import os from "os";
import { rm, mkdir } from "fs/promises";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";
import { Input, MP4, QTFF, UrlSource } from "mediabunny";
import type { Job } from "bullmq";
import type { RenderJobPayload } from "../src/types/job.types";
import type { Transcript } from "../src/types/transcript.types";
import {
  updateJobStatus,
  updateJobDone,
  updateJobFailed,
  findJobById,
  updateJobTranscript,
} from "../src/repositories/job.repository";
import { getBundle } from "../src/services/render.service";
import { getTranscriptionProvider } from "../src/services/transcription.service";
import { getRedis } from "../src/lib/redis";
import { findByClerkId } from "../src/repositories/user.repository";
import { notifyDiscord, DISCORD_COLOR } from "../src/lib/discord";

function getS3(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function getPresignedUrl(
  key: string,
  expiresIn: number,
): Promise<string> {
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }),
    { expiresIn },
  );
}

async function uploadToR2(localPath: string, key: string): Promise<void> {
  const upload = new Upload({
    client: getS3(),
    params: {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: createReadStream(localPath),
      ContentType: "video/mp4",
    },
    queueSize: 4,
    partSize: 10 * 1024 * 1024,
  });
  await upload.done();
}

const DEFAULT_RENDER_FPS = 30;

function capRenderFps(sourceFps: number | null, fallbackFps: number): number {
  const safeFallback =
    Number.isFinite(fallbackFps) && fallbackFps > 0
      ? Math.min(Math.round(fallbackFps), DEFAULT_RENDER_FPS)
      : DEFAULT_RENDER_FPS;

  if (!sourceFps || !Number.isFinite(sourceFps) || sourceFps <= 0) {
    return safeFallback;
  }

  const roundedSourceFps = Math.round(sourceFps);

  // Keep normal source frame rates unchanged. High-frame-rate phone videos
  // render at half rate: 50fps becomes 25fps and 60fps becomes 30fps.
  if (roundedSourceFps >= 49 && roundedSourceFps <= 51) return 25;
  if (roundedSourceFps >= 59 && roundedSourceFps <= 61) return 30;

  return Math.min(Math.max(roundedSourceFps, 1), DEFAULT_RENDER_FPS);
}

async function getRenderFps(videoSrc: string, fallbackFps: number): Promise<{
  sourceFps: number | null;
  renderFps: number;
}> {
  const input = new Input({
    source: new UrlSource(videoSrc),
    formats: [MP4, QTFF],
  });

  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) {
      console.warn("[worker] no video track found while detecting source FPS");
      return { sourceFps: null, renderFps: capRenderFps(null, fallbackFps) };
    }

    // Probe actual frame timestamps instead of trusting container metadata.
    // 128 packets is enough to distinguish common 24/25/30/50/60fps clips
    // without adding a full-video scan before each render.
    const metrics = await track.computeFrameRateMetrics({
      targetPacketCount: 128,
    });
    const sourceFps = metrics.bestGuessFrameRate;

    return {
      sourceFps,
      renderFps: capRenderFps(sourceFps, fallbackFps),
    };
  } catch (error) {
    console.warn(
      "[worker] source FPS detection failed; using fallback FPS:",
      error,
    );
    return { sourceFps: null, renderFps: capRenderFps(null, fallbackFps) };
  } finally {
    input.dispose();
  }
}

// ─── Transcribe phase ────────────────────────────────────────────────────────

async function processTranscribePhase(
  bullJob: Job<RenderJobPayload>,
): Promise<void> {
  const { jobId, videoKey } = bullJob.data;

  try {
    const jobDoc = await findJobById(jobId);
    if (!jobDoc) throw new Error(`Job ${jobId} not found`);

    if (jobDoc.transcript) {
      // User uploaded SRT/VTT — skip Deepgram
      await updateJobStatus(jobId, "transcript_ready");
      console.log(
        `[worker] job ${jobId} transcript already exists → transcript_ready`,
      );
      return;
    }

    console.log(`[worker] transcribing job ${jobId} via Deepgram`);
    await updateJobStatus(jobId, "transcribing");

    const audioUrl = await getPresignedUrl(videoKey, 900);
    const transcript = await getTranscriptionProvider().transcribe(audioUrl);

    await updateJobTranscript(jobId, transcript);
    await updateJobStatus(jobId, "transcript_ready");
    console.log(
      `[worker] job ${jobId} → transcript_ready (${transcript.words.length} words)`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[worker] transcription failed for job ${jobId}:`, message);
    await updateJobFailed(jobId, message);
    throw err;
  }
}

// ─── Render phase ────────────────────────────────────────────────────────────

async function processRenderPhase(
  bullJob: Job<RenderJobPayload>,
): Promise<void> {
  const {
    jobId,
    userId,
    videoKey,
    compositionId,
    fps,
    activeColor = "#FACC15",
    textColor = "#FFFFFF",
    accentColor,
    fontFamily,
    fontSizeMultiplier,
    posX,
    posY,
    watermark,
  } = bullJob.data;
  const tmpDir = `/tmp/${jobId}`;

  try {
    await mkdir(tmpDir, { recursive: true });

    const jobDoc = await findJobById(jobId);
    if (!jobDoc) throw new Error(`Job ${jobId} not found`);
    if (!jobDoc.transcript)
      throw new Error(`Job ${jobId} has no transcript — cannot render`);

    const transcript = jobDoc.transcript as Transcript;
    const videoSrc = await getPresignedUrl(videoKey, 1800);
    const compWidth = jobDoc.width ?? 1920;
    const compHeight = jobDoc.height ?? 1080;
    const { sourceFps, renderFps } = await getRenderFps(videoSrc, fps);

    await updateJobStatus(jobId, "rendering");
    console.log(
      `[worker] rendering job ${jobId} (${compositionId}) ${compWidth}×${compHeight} at ${renderFps}fps${sourceFps ? ` (source ${sourceFps.toFixed(3)}fps)` : " (fallback)"}`,
    );

    // Render through the CaptionRoot dispatcher (id: 'CaptionRoot' + style
    // prop) rather than selecting the style composition directly — that's the
    // same component the live preview uses (components/preview-player.tsx),
    // so worker and preview can't silently diverge on props one of them
    // forgets to pass (this already happened once: fontFamily reached the
    // preview but not the worker until it was explicitly wired through).
    const inputProps = {
      style: compositionId,
      transcript,
      videoSrc,
      activeColor,
      textColor,
      accentColor,
      fontFamily,
      fontSizeMultiplier,
      posX,
      posY,
      watermark,
    };

    // CaptionRoot is registered in Root.tsx with a fixed 6s SAMPLE_DURATION_FRAMES
    // for Remotion Studio preview only — every real render must override it to
    // the actual transcript length, or output gets hard-capped at 6 seconds
    // regardless of the source video's real duration. Use a one-second tail buffer
    // formula already used client-side for the live preview Player
    // (app/dashboard/jobs/[id]/page.tsx) — keeps both in sync.
    const lastWordEnd = transcript.words?.length
      ? transcript.words[transcript.words.length - 1].end
      : 0;
    const durationInFrames =
      Math.ceil(lastWordEnd * renderFps) + renderFps;

    const outputPath = path.join(tmpDir, "output.mp4");

    const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
    const lambdaServeUrl = process.env.REMOTION_LAMBDA_SERVE_URL;
    const region = (process.env.REMOTION_AWS_REGION as any) || "us-east-1";
    const lambdaConcurrency = Number.parseInt(
      process.env.REMOTION_LAMBDA_CONCURRENCY ?? "6",
      10
    );

    if (functionName) {
      if (!lambdaServeUrl) {
        throw new Error(
          "REMOTION_LAMBDA_SERVE_URL is required when REMOTION_LAMBDA_FUNCTION_NAME is set"
        );
      }
      if (!Number.isInteger(lambdaConcurrency) || lambdaConcurrency < 1) {
        throw new Error(
          "REMOTION_LAMBDA_CONCURRENCY must be a positive integer"
        );
      }
      console.log(
        `[worker] rendering job ${jobId} via @remotion/lambda (${functionName}, concurrency ${lambdaConcurrency})`
      );
      const { renderMediaOnLambda, getRenderProgress, downloadMedia } =
        await import("@remotion/lambda");

      const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl: lambdaServeUrl,
        composition: "CaptionRoot",
        inputProps: {
          ...inputProps,
        },
        codec: "h264",
        crf: 20,
        forceWidth: compWidth,
        forceHeight: compHeight,
        forceFps: renderFps,
        forceDurationInFrames: durationInFrames,
        concurrency: lambdaConcurrency,
      });

      let completed = false;
      while (!completed) {
        const progress = await getRenderProgress({
          renderId,
          bucketName,
          functionName,
          region,
        });

        const totalFrames = durationInFrames;
        const renderedFrames = Math.round(
          progress.overallProgress * totalFrames
        );
        const pct = Math.round(progress.overallProgress * 100);
        bullJob.updateProgress(pct);

        getRedis()
          .publish(
            `job:${jobId}:progress`,
            JSON.stringify({ renderedFrames, totalFrames, progress: pct })
          )
          .catch((err) =>
            console.error(
              `[worker] failed to publish progress for job ${jobId}:`,
              err
            )
          );

        if (progress.done) {
          console.log(
            `[worker] Lambda render complete for job ${jobId}, downloading output...`
          );
          await downloadMedia({
            bucketName,
            renderId,
            region,
            outPath: outputPath,
          });
          completed = true;
          break;
        }

        if (progress.fatalErrorEncountered) {
          throw new Error(
            progress.errors[0]?.message || "Remotion Lambda render failed"
          );
        }

        await new Promise((r) => setTimeout(r, 1000));
      }
    } else {
      const serveUrl = await getBundle();
      const { selectComposition, renderMedia } =
        await import("@remotion/renderer");
      const composition = await selectComposition({
        serveUrl,
        id: "CaptionRoot",
        inputProps,
      });
      composition.width = compWidth;
      composition.height = compHeight;
      composition.fps = renderFps;
      composition.durationInFrames = durationInFrames;

      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        // Cap concurrency to avoid exhausting memory on 16GB VMs.
        concurrency: Math.min(os.cpus().length, 4),
        // Recover quality from the previous lower-quality encode.
        crf: 20,
        // Use a slightly slower x264 preset for better visual quality.
        x264Preset: "faster",
        // No GPU on this VM — swangle (SwiftShader via ANGLE) benchmarks faster than
        // the default autodetect for headless software rendering on Linux servers.
        chromiumOptions: { gl: "swangle" },
        pixelFormat: "yuv420p",
        outputLocation: outputPath,
        inputProps,
        onProgress: ({
          renderedFrames,
          progress,
        }: {
          renderedFrames: number;
          progress: number;
        }) => {
          const totalFrames = composition.durationInFrames;
          const pct = Math.round(progress * 100);
          bullJob.updateProgress(pct);
          getRedis()
            .publish(
              `job:${jobId}:progress`,
              JSON.stringify({ renderedFrames, totalFrames })
            )
            .catch((err) => {
              console.error(
                `[worker] failed to publish progress for job ${jobId}:`,
                err
              );
            });
          if (renderedFrames % 30 === 0) {
            console.log(`[worker] job ${jobId} render progress: ${pct}%`);
          }
        },
      });
    }

    const outputKey = `outputs/${userId}/${jobId}/output.mp4`;
    await uploadToR2(outputPath, outputKey);
    await updateJobDone(jobId, outputKey);
    console.log(`[worker] job ${jobId} done → ${outputKey}`);

    const renderedUser = await findByClerkId(userId).catch(() => null);
    // 7-day expiry matches the storage retention window (CLAUDE.md: original +
    // rendered output auto-deleted 7 days after creation) — link stays valid
    // for exactly as long as the file itself still exists.
    const videoUrl = await getPresignedUrl(outputKey, 60 * 60 * 24 * 7).catch(
      () => null,
    );
    notifyDiscord({
      title: "✅ Video rendered successfully",
      color: DISCORD_COLOR.success,
      fields: [
        {
          name: "User Name",
          value: renderedUser?.name ?? "Unknown",
          inline: true,
        },
        {
          name: "Email",
          value: renderedUser?.email ?? "Unknown",
          inline: true,
        },
        { name: "User ID", value: userId, inline: true },
        { name: "Job ID", value: jobId, inline: true },
        { name: "Style", value: compositionId, inline: true },
        ...(videoUrl ? [{ name: "Video URL", value: videoUrl }] : []),
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[worker] render failed for job ${jobId}:`, message);
    await updateJobFailed(jobId, message);
    throw err;
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function processRenderJob(
  bullJob: Job<RenderJobPayload>,
): Promise<void> {
  if (bullJob.data.phase === "render") {
    return processRenderPhase(bullJob);
  }
  return processTranscribePhase(bullJob);
}
