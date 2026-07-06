import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { uploadRequestSchema, captionUploadSchema, jobConfirmSchema } from '@/src/helpers/validators'
import { createUploadJob } from '@/src/services/upload.service'
import { findJobById, updateJobStatus, updateJobTranscript } from '@/src/repositories/job.repository'
import { parseCaptionFile } from '@/src/helpers/srt-parser'
import { connectDB } from '@/src/lib/mongo'

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

  const job = await findJobById(parsed.data.jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({ jobId: job._id.toString(), status: job.status })
}
