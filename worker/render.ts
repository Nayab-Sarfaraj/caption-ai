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

async function getVideoUrl(videoKey: string): Promise<string> {
  const s3 = getS3()
  // 30-min presigned URL — Chromium fetches via HTTPS (no file:// restriction)
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: videoKey }),
    { expiresIn: 1800 }
  )
}

async function uploadToR2(localPath: string, key: string): Promise<void> {
  const s3 = getS3()
  const upload = new Upload({
    client: s3,
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

async function getTranscript(jobId: string, videoKey: string): Promise<Transcript> {
  const jobDoc = await findJobById(jobId)
  if (!jobDoc) throw new Error(`Job ${jobId} not found`)

  // Already have transcript (user uploaded SRT/VTT)
  if (jobDoc.transcript) {
    return jobDoc.transcript as Transcript
  }

  // Need to transcribe via Deepgram
  console.log(`[worker] transcribing job ${jobId} via Deepgram`)
  await updateJobStatus(jobId, 'transcribing')

  // Generate short-lived presigned GET URL for Deepgram to fetch
  const s3 = getS3()
  const audioUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: videoKey }),
    { expiresIn: 900 } // 15 min
  )

  const provider = getTranscriptionProvider()
  const transcript = await provider.transcribe(audioUrl)

  await updateJobTranscript(jobId, transcript)
  console.log(`[worker] transcription done: ${transcript.words.length} words`)

  return transcript
}

export async function processRenderJob(bullJob: Job<RenderJobPayload>): Promise<void> {
  const { jobId, userId, videoKey, compositionId, fps } = bullJob.data
  const tmpDir = `/tmp/${jobId}`

  try {
    await mkdir(tmpDir, { recursive: true })

    // 1. Transcribe (if no transcript yet)
    const transcript = await getTranscript(jobId, videoKey)

    // 2. Get presigned URL — Chromium fetches over HTTPS (file:// blocked by security policy)
    await updateJobStatus(jobId, 'rendering')
    const videoSrc = await getVideoUrl(videoKey)
    console.log(`[worker] got presigned video URL for job ${jobId}`)

    // 3. Bundle Remotion (cached after first call)
    const serveUrl = await getBundle()

    const { selectComposition, renderMedia } = await import('@remotion/renderer')

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps: {
        transcript,
        videoSrc,
      },
    })

    const outputPath = path.join(tmpDir, 'output.mp4')

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        transcript,
        videoSrc,
      },
      fps,
      onProgress: ({ renderedFrames, totalFrames }) => {
        const pct = totalFrames > 0 ? Math.round((renderedFrames / totalFrames) * 100) : 0
        bullJob.updateProgress(pct)
        if (renderedFrames % 30 === 0) {
          console.log(`[worker] job ${jobId} render progress: ${pct}%`)
        }
      },
    })

    // 4. Upload rendered output to R2
    const outputKey = `outputs/${userId}/${jobId}/output.mp4`
    await uploadToR2(outputPath, outputKey)
    await updateJobDone(jobId, outputKey)
    console.log(`[worker] job ${jobId} done → ${outputKey}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[worker] job ${jobId} failed:`, message)
    await updateJobFailed(jobId, message)
    throw err // rethrow so BullMQ triggers retry
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
