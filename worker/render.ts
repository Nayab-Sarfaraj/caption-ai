import os from 'os'
import { rm, mkdir } from 'fs/promises'
import path from 'path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import { createReadStream } from 'fs'
import type { Job } from 'bullmq'
import type { RenderJobPayload } from '../src/types/job.types'
import type { Transcript } from '../src/types/transcript.types'
import {
  updateJobStatus,
  updateJobDone,
  updateJobFailed,
  findJobById,
  updateJobTranscript,
} from '../src/repositories/job.repository'
import { getBundle } from '../src/services/render.service'
import { getTranscriptionProvider } from '../src/services/transcription.service'
import { getRedis } from '../src/lib/redis'

function getS3(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

async function getPresignedUrl(key: string, expiresIn: number): Promise<string> {
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }),
    { expiresIn }
  )
}

async function uploadToR2(localPath: string, key: string): Promise<void> {
  const upload = new Upload({
    client: getS3(),
    params: {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: createReadStream(localPath),
      ContentType: 'video/mp4',
    },
    queueSize: 4,
    partSize: 10 * 1024 * 1024,
  })
  await upload.done()
}

// ─── Transcribe phase ────────────────────────────────────────────────────────

async function processTranscribePhase(bullJob: Job<RenderJobPayload>): Promise<void> {
  const { jobId, videoKey } = bullJob.data

  try {
    const jobDoc = await findJobById(jobId)
    if (!jobDoc) throw new Error(`Job ${jobId} not found`)

    if (jobDoc.transcript) {
      // User uploaded SRT/VTT — skip Deepgram
      await updateJobStatus(jobId, 'transcript_ready')
      console.log(`[worker] job ${jobId} transcript already exists → transcript_ready`)
      return
    }

    console.log(`[worker] transcribing job ${jobId} via Deepgram`)
    await updateJobStatus(jobId, 'transcribing')

    const audioUrl = await getPresignedUrl(videoKey, 900)
    const transcript = await getTranscriptionProvider().transcribe(audioUrl)

    await updateJobTranscript(jobId, transcript)
    await updateJobStatus(jobId, 'transcript_ready')
    console.log(`[worker] job ${jobId} → transcript_ready (${transcript.words.length} words)`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[worker] transcription failed for job ${jobId}:`, message)
    await updateJobFailed(jobId, message)
    throw err
  }
}

// ─── Render phase ────────────────────────────────────────────────────────────

async function processRenderPhase(bullJob: Job<RenderJobPayload>): Promise<void> {
  const { jobId, userId, videoKey, compositionId, fps, activeColor = '#FACC15', textColor = '#FFFFFF', accentColor, fontFamily, watermark } = bullJob.data
  const tmpDir = `/tmp/${jobId}`

  try {
    await mkdir(tmpDir, { recursive: true })

    const jobDoc = await findJobById(jobId)
    if (!jobDoc) throw new Error(`Job ${jobId} not found`)
    if (!jobDoc.transcript) throw new Error(`Job ${jobId} has no transcript — cannot render`)

    const transcript = jobDoc.transcript as Transcript
    const videoSrc = await getPresignedUrl(videoKey, 1800)
    const compWidth = jobDoc.width ?? 1920
    const compHeight = jobDoc.height ?? 1080

    await updateJobStatus(jobId, 'rendering')
    console.log(`[worker] rendering job ${jobId} (${compositionId}) ${compWidth}×${compHeight}`)

    const serveUrl = await getBundle()
    const { selectComposition, renderMedia } = await import('@remotion/renderer')

    // Render through the CaptionRoot dispatcher (id: 'CaptionRoot' + style
    // prop) rather than selecting the style composition directly — that's the
    // same component the live preview uses (components/preview-player.tsx),
    // so worker and preview can't silently diverge on props one of them
    // forgets to pass (this already happened once: fontFamily reached the
    // preview but not the worker until it was explicitly wired through).
    const inputProps = { style: compositionId, transcript, videoSrc, activeColor, textColor, accentColor, fontFamily, watermark }

    const composition = await selectComposition({
      serveUrl,
      id: 'CaptionRoot',
      inputProps,
    })

    // Override dimensions to match actual video aspect ratio
    composition.width = compWidth
    composition.height = compHeight

    // CaptionRoot is registered in Root.tsx with a fixed 6s SAMPLE_DURATION_FRAMES
    // for Remotion Studio preview only — every real render must override it to
    // the actual transcript length, or output gets hard-capped at 6 seconds
    // regardless of the source video's real duration. Same +3s tail buffer
    // formula already used client-side for the live preview Player
    // (app/dashboard/jobs/[id]/page.tsx) — keeps both in sync.
    const lastWordEnd = transcript.words?.length ? transcript.words[transcript.words.length - 1].end : 0
    composition.durationInFrames = Math.ceil(lastWordEnd * fps) + fps * 3

    const outputPath = path.join(tmpDir, 'output.mp4')

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      // Maximize parallel frame rendering by using all available CPU cores
      concurrency: os.cpus().length,
      // Adjusted CRF from 18 to 22. CRF 22 remains visually high quality for web/social,
      // but generates the file much faster and produces a smaller MP4.
      crf: 22,
      // No GPU on this VM — swangle (SwiftShader via ANGLE) benchmarks faster than
      // the default autodetect for headless software rendering on Linux servers.
      chromiumOptions: { gl: 'swangle' },
      // Default x264 preset is 'medium'; 'veryfast' trades a bit of file size
      // for meaningfully faster encode with crf22 quality held constant.
      x264Preset: 'veryfast',
      pixelFormat: 'yuv420p',
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ renderedFrames, progress }) => {
        const totalFrames = composition.durationInFrames
        const pct = Math.round(progress * 100)
        bullJob.updateProgress(pct)
        // The SSE route (app/api/jobs/[id]/stream/route.ts) subscribes to this
        // exact channel — bullJob.updateProgress alone never reaches it, that's
        // BullMQ's own internal tracking, not a Redis pub/sub message. Without
        // this publish the client never receives a 'progress' event and the
        // bar sits at 0% until the terminal-status poll fires on done/failed.
        getRedis().publish(`job:${jobId}:progress`, JSON.stringify({ renderedFrames, totalFrames })).catch((err) => {
          console.error(`[worker] failed to publish progress for job ${jobId}:`, err)
        })
        if (renderedFrames % 30 === 0) {
          console.log(`[worker] job ${jobId} render progress: ${pct}%`)
        }
      },
    })

    const outputKey = `outputs/${userId}/${jobId}/output.mp4`
    await uploadToR2(outputPath, outputKey)
    await updateJobDone(jobId, outputKey)
    console.log(`[worker] job ${jobId} done → ${outputKey}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[worker] render failed for job ${jobId}:`, message)
    await updateJobFailed(jobId, message)
    throw err
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function processRenderJob(bullJob: Job<RenderJobPayload>): Promise<void> {
  if (bullJob.data.phase === 'render') {
    return processRenderPhase(bullJob)
  }
  return processTranscribePhase(bullJob)
}
