import { rm, mkdir } from 'fs/promises'
import path from 'path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import type { Job } from 'bullmq'
import type { RenderJobPayload } from '../src/types/job.types'
import type { Transcript } from '../src/types/transcript.types'
import {
  updateJobStatus,
  updateJobDone,
  updateJobFailed,
  findJobById,
} from '../src/repositories/job.repository'
import { getBundle } from '../src/services/render.service'

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

async function downloadFromR2(key: string, dest: string): Promise<void> {
  const s3 = getS3()
  const res = await s3.send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key })
  )
  if (!res.Body) throw new Error(`Empty body from R2 for key ${key}`)
  await pipeline(res.Body as Readable, createWriteStream(dest))
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
    partSize: 10 * 1024 * 1024, // 10MB parts
  })
  await upload.done()
}

async function getTranscript(job: IJobData): Promise<Transcript> {
  if (job.transcriptKey) {
    const tmpPath = `/tmp/transcript-${job._id}.json`
    await downloadFromR2(job.transcriptKey, tmpPath)
    const { readFile } = await import('fs/promises')
    const raw = await readFile(tmpPath, 'utf-8')
    await rm(tmpPath, { force: true })
    return JSON.parse(raw) as Transcript
  }
  const doc = await findJobById(String(job._id))
  if (!doc?.transcript) throw new Error('No transcript on job doc')
  return doc.transcript as Transcript
}

interface IJobData {
  _id: unknown
  transcriptKey: string | null
  transcript: unknown
}

export async function processRenderJob(bullJob: Job<RenderJobPayload>): Promise<void> {
  const { jobId, userId, videoKey, compositionId, fps } = bullJob.data
  const tmpDir = `/tmp/${jobId}`

  try {
    await mkdir(tmpDir, { recursive: true })
    await updateJobStatus(jobId, 'rendering')

    // Download source video from R2
    const inputPath = path.join(tmpDir, 'input.mp4')
    await downloadFromR2(videoKey, inputPath)

    // Get transcript (from R2 or Mongo)
    const jobDoc = await findJobById(jobId)
    if (!jobDoc) throw new Error(`Job ${jobId} not found`)
    const transcript = await getTranscript({
      _id: jobDoc._id,
      transcriptKey: jobDoc.transcriptKey,
      transcript: jobDoc.transcript,
    })

    // Bundle Remotion compositions (cached after first call)
    const serveUrl = await getBundle()

    const { selectComposition, renderMedia } = await import('@remotion/renderer')

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps: {
        transcript,
        videoSrc: `file://${inputPath}`,
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
        videoSrc: `file://${inputPath}`,
      },
      fps,
      onProgress: ({ renderedFrames, totalFrames }) => {
        bullJob.updateProgress(
          totalFrames > 0 ? Math.round((renderedFrames / totalFrames) * 100) : 0
        )
      },
    })

    // Upload rendered output to R2
    const outputKey = `outputs/${userId}/${jobId}/output.mp4`
    await uploadToR2(outputPath, outputKey)
    await updateJobDone(jobId, outputKey)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await updateJobFailed(jobId, message)
    throw err // rethrow so BullMQ records failure and triggers retry
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
