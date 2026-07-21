import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { findJobById, findJobsByUserId, updateJobRenderConfig } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import { getRenderQueue } from '@/src/lib/queue'
import { updateJobStatus } from '@/src/repositories/job.repository'
import { getBrandKit } from '@/src/services/brand-kit.service'
import { canRender } from '@/src/services/billing.service'
import { retryJob, RetryServiceError } from '@/src/services/job.service'
import { connectDB } from '@/src/lib/mongo'
import { getPostHog } from '@/src/lib/posthog'
import type { RenderJobPayload } from '@/src/types/job.types'
import { compositionIdSchema, hexColorSchema, fontFamilySchema } from '@/src/helpers/validators'
import { z } from 'zod'

const ENQUEUE_TIMEOUT_MS = 10_000

// No .default() here — brand-kit fallback (below) needs to tell "not sent"
// apart from "sent". Precedence: request body > brand kit > hardcoded default.
const triggerRenderSchema = z.object({
  compositionId: compositionIdSchema.optional(),
  activeColor: hexColorSchema.optional(),
  textColor: hexColorSchema.optional(),
  accentColor: hexColorSchema.optional(),
  fontFamily: fontFamilySchema.optional(),
  fontSizeMultiplier: z.number().min(0.5).max(2).optional(),
  posX: z.number().min(0).max(100).optional(),
  posY: z.number().min(0).max(100).optional(),
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

  const { allowed, watermark } = await canRender(userId)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Free render limit reached this month — subscribe for unlimited renders' },
      { status: 402 }
    )
  }

  const brandKit = await getBrandKit(userId)

  const payload: RenderJobPayload = {
    jobId,
    userId,
    videoKey: job.videoKey,
    compositionId: parsed.data.compositionId ?? brandKit?.defaultCompositionId ?? 'WordByWord',
    fps: 30,
    outputFormat: 'mp4',
    phase: 'render',
    activeColor: parsed.data.activeColor ?? brandKit?.activeColor ?? undefined,
    textColor: parsed.data.textColor ?? brandKit?.textColor ?? undefined,
    accentColor: parsed.data.accentColor ?? brandKit?.accentColor ?? undefined,
    fontFamily: parsed.data.fontFamily ?? brandKit?.fontFamily ?? undefined,
    fontSizeMultiplier: parsed.data.fontSizeMultiplier ?? undefined,
    posX: parsed.data.posX ?? undefined,
    posY: parsed.data.posY ?? undefined,
    watermark,
  }

  // Persist the resolved config so a later manual retry (Stage 4) can reuse
  // exactly what was attempted here, not whatever the brand kit says by then.
  await updateJobRenderConfig(jobId, {
    compositionId: payload.compositionId,
    activeColor: payload.activeColor,
    textColor: payload.textColor,
    accentColor: payload.accentColor,
    fontFamily: payload.fontFamily,
    fontSizeMultiplier: payload.fontSizeMultiplier,
    captionPosX: payload.posX,
    captionPosY: payload.posY,
    watermarked: watermark,
  })

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
    getPostHog()?.capture({
      distinctId: userId,
      event: 'render_triggered',
      properties: { jobId, compositionId: payload.compositionId, watermark },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Enqueue failed'
    console.error('Render enqueue error:', message)
    return NextResponse.json({ error: message }, { status: 503 })
  }

  return NextResponse.json({ jobId, status: 'rendering' })
}

const RETRY_ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  NOT_FAILED: 409,
  RETRY_CAP_EXCEEDED: 429,
  RENDER_LIMIT: 402,
  ENQUEUE_FAILED: 503,
}

export async function handleRetryJob(
  _req: NextRequest,
  jobId: string
): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  try {
    const { status } = await retryJob(jobId, userId)
    return NextResponse.json({ jobId, status })
  } catch (err) {
    if (err instanceof RetryServiceError) {
      return NextResponse.json({ error: err.message }, { status: RETRY_ERROR_STATUS[err.code] ?? 500 })
    }
    console.error('Retry error:', err)
    return NextResponse.json({ error: 'Retry failed' }, { status: 500 })
  }
}

export async function handleListJobs(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('pageSize')) || 20))

  const { jobs, total } = await findJobsByUserId(userId, { page, pageSize })
  return NextResponse.json({
    jobs: jobs.map((j) => ({
      id: j._id.toString(),
      status: j.status,
      originalFilename: j.originalFilename,
      transcriptSource: j.transcriptSource,
      createdAt: j.createdAt,
    })),
    total,
    page,
    pageSize,
  })
}
