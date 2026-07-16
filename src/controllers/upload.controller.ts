import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { uploadRequestSchema, captionUploadSchema, jobConfirmSchema, batchUploadRequestSchema } from '@/src/helpers/validators'
import { createUploadJob, createBatchUploadJobs } from '@/src/services/upload.service'
import { findJobById, updateJobStatus, updateJobTranscript, updateJobDimensions } from '@/src/repositories/job.repository'
import { parseCaptionFile } from '@/src/helpers/srt-parser'
import { connectDB } from '@/src/lib/mongo'
import { getRenderQueue } from '@/src/lib/queue'
import { getPostHog } from '@/src/lib/posthog'
import type { RenderJobPayload } from '@/src/types/job.types'

const ENQUEUE_TIMEOUT_MS = 10_000

export async function handleCreateUpload(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const data = await createUploadJob(userId, parsed.data)
    return NextResponse.json(data)
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'RATE_LIMIT') {
      return NextResponse.json(
        { error: 'Upload limit reached (5 per day on free tier)' },
        { status: 429 }
      )
    }
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function handleCreateBatchUpload(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = batchUploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const data = await createBatchUploadJobs(userId, parsed.data.files)
    return NextResponse.json(data)
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'RATE_LIMIT') {
      return NextResponse.json(
        { error: 'Upload limit reached (5 per day on free tier)' },
        { status: 429 }
      )
    }
    console.error('Batch upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function handleCaptionUpload(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = captionUploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { jobId, content, filename } = parsed.data

  await connectDB()
  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const format = filename.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt'
  const transcript = parseCaptionFile(content, format)

  await updateJobTranscript(jobId, transcript)
  await updateJobStatus(jobId, 'pending')

  return NextResponse.json({ success: true })
}

export async function handleConfirmUpload(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = jobConfirmSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await connectDB()
  const job = await findJobById(parsed.data.jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const jobId = job._id.toString()

  if (parsed.data.width && parsed.data.height) {
    await updateJobDimensions(jobId, parsed.data.width, parsed.data.height)
  }

  const payload: RenderJobPayload = {
    jobId,
    userId,
    videoKey: job.videoKey,
    transcriptKey: job.transcriptKey ?? undefined,
    compositionId: 'WordByWord', // overridden at render time
    fps: 30,
    outputFormat: 'mp4',
    phase: 'transcribe',
  }

  try {
    await Promise.race([
      getRenderQueue().add('render', payload, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis enqueue timeout')), ENQUEUE_TIMEOUT_MS)
      ),
    ])
    await updateJobStatus(jobId, 'processing')
    getPostHog()?.capture({ distinctId: userId, event: 'video_uploaded', properties: { jobId } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Enqueue failed'
    console.error('Enqueue error:', message)
    return NextResponse.json({ error: message }, { status: 503 })
  }

  return NextResponse.json({ jobId, status: 'processing' })
}
