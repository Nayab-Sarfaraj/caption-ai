import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { findJobById, findJobsByUserId } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import { getRenderQueue } from '@/src/lib/queue'
import { updateJobStatus } from '@/src/repositories/job.repository'
import { connectDB } from '@/src/lib/mongo'
import type { RenderJobPayload } from '@/src/types/job.types'
import { z } from 'zod'

const ENQUEUE_TIMEOUT_MS = 10_000

const HEX_COLOR = z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()

const triggerRenderSchema = z.object({
  compositionId: z.enum(['WordByWord', 'Karaoke', 'Fade', 'Spring', 'Hype', 'Hormozi', 'Minimal']).default('WordByWord'),
  activeColor: HEX_COLOR,
  textColor: HEX_COLOR,
})

export async function handleGetJob(
  _req: NextRequest,
  jobId: string
): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  let downloadUrl: string | null = null
  if (job.status === 'done' && job.outputKey) {
    downloadUrl = await generatePresignedGet(job.outputKey, 3600)
  }

  return NextResponse.json({
    id: job._id.toString(),
    status: job.status,
    originalFilename: job.originalFilename,
    transcriptSource: job.transcriptSource,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    downloadUrl,
  })
}

export async function handleTriggerRender(
  req: NextRequest,
  jobId: string
): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = triggerRenderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await connectDB()
  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  if (job.status !== 'transcript_ready') {
    return NextResponse.json(
      { error: `Job is ${job.status} — can only render from transcript_ready` },
      { status: 409 }
    )
  }

  const payload: RenderJobPayload = {
    jobId,
    userId,
    videoKey: job.videoKey,
    compositionId: parsed.data.compositionId,
    fps: 30,
    outputFormat: 'mp4',
    phase: 'render',
    activeColor: parsed.data.activeColor,
    textColor: parsed.data.textColor,
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
    await updateJobStatus(jobId, 'rendering')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Enqueue failed'
    console.error('Render enqueue error:', message)
    return NextResponse.json({ error: message }, { status: 503 })
  }

  return NextResponse.json({ jobId, status: 'rendering' })
}

export async function handleListJobs(_req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobs = await findJobsByUserId(userId)
  return NextResponse.json(
    jobs.map((j) => ({
      id: j._id.toString(),
      status: j.status,
      originalFilename: j.originalFilename,
      transcriptSource: j.transcriptSource,
      createdAt: j.createdAt,
    }))
  )
}
