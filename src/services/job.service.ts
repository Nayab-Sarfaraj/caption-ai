import {
  findJobById,
  updateJobStatus,
  updateJobRenderConfig,
  incrementManualRetryIfUnderCap,
} from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import { getRenderQueue } from '@/src/lib/queue'
import { canRender } from '@/src/services/billing.service'
import type { IJob } from '@/src/models/Job'
import type { RenderJobPayload } from '@/src/types/job.types'

export interface JobStatusResult {
  job: IJob
  downloadUrl?: string
}

export async function getJobWithDownloadUrl(
  jobId: string,
  userId: string
): Promise<JobStatusResult | null> {
  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) return null

  let downloadUrl: string | undefined
  if (job.status === 'done' && job.outputKey) {
    downloadUrl = await generatePresignedGet(job.outputKey, 3600)
  }

  return { job, downloadUrl }
}

export const MAX_MANUAL_RETRIES = 3
const ENQUEUE_TIMEOUT_MS = 10_000

export type RetryError = 'NOT_FOUND' | 'NOT_FAILED' | 'RETRY_CAP_EXCEEDED' | 'RENDER_LIMIT' | 'ENQUEUE_FAILED'

export async function retryJob(jobId: string, userId: string): Promise<{ status: 'processing' | 'rendering' }> {
  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) throw new RetryServiceError('NOT_FOUND', 'Job not found')
  if (job.status !== 'failed') throw new RetryServiceError('NOT_FAILED', `Job is ${job.status} — can only retry a failed job`)
  if (job.manualRetryCount >= MAX_MANUAL_RETRIES) {
    throw new RetryServiceError('RETRY_CAP_EXCEEDED', `Retry limit reached (${MAX_MANUAL_RETRIES} max)`)
  }

  // Skip re-transcription if a transcript already exists — the actual value
  // of this stage, not just re-running the same job from scratch.
  const skipTranscription = Boolean(job.transcript || job.transcriptKey)

  // Retry still consumes a render slot — re-check the free-tier gate. Only
  // matters when this retry goes straight to render; a transcribe-phase retry
  // gets gated later by handleTriggerRender once it reaches transcript_ready.
  let watermark = false
  if (skipTranscription) {
    const gate = await canRender(userId)
    if (!gate.allowed) {
      throw new RetryServiceError('RENDER_LIMIT', 'Free render limit reached this month — subscribe for unlimited renders')
    }
    watermark = gate.watermark
  }

  // Atomic — guards a double-click racing past the cap even after the check above.
  const updated = await incrementManualRetryIfUnderCap(jobId, MAX_MANUAL_RETRIES)
  if (!updated) throw new RetryServiceError('RETRY_CAP_EXCEEDED', `Retry limit reached (${MAX_MANUAL_RETRIES} max)`)

  // Re-persist watermarked state — a retry re-checks canRender fresh, so it
  // can legitimately differ from the original attempt (e.g. user subscribed
  // in between), and the job page reads this field to show the right CTA.
  if (skipTranscription) {
    await updateJobRenderConfig(jobId, {
      compositionId: (job.compositionId as RenderJobPayload['compositionId']) ?? 'WordByWord',
      activeColor: job.activeColor ?? undefined,
      textColor: job.textColor ?? undefined,
      accentColor: job.accentColor ?? undefined,
      fontFamily: job.fontFamily ?? undefined,
      fontSizeMultiplier: job.fontSizeMultiplier ?? undefined,
      captionPosX: job.captionPosX ?? undefined,
      captionPosY: job.captionPosY ?? undefined,
      watermarked: watermark,
    })
  }

  const payload: RenderJobPayload = skipTranscription
    ? {
        jobId,
        userId,
        videoKey: job.videoKey,
        compositionId: (job.compositionId as RenderJobPayload['compositionId']) ?? 'WordByWord',
        fps: 30,
        outputFormat: 'mp4',
        phase: 'render',
        activeColor: job.activeColor ?? undefined,
        textColor: job.textColor ?? undefined,
        accentColor: job.accentColor ?? undefined,
        fontFamily: job.fontFamily ?? undefined,
        fontSizeMultiplier: job.fontSizeMultiplier ?? undefined,
        posX: job.captionPosX ?? undefined,
        posY: job.captionPosY ?? undefined,
        watermark,
      }
    : {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Enqueue failed'
    // manualRetryCount already incremented — counts against the cap even on
    // enqueue failure, so retry-spamming during a Redis outage still burns down.
    await updateJobStatus(jobId, 'failed', { errorMessage: message })
    throw new RetryServiceError('ENQUEUE_FAILED', message)
  }

  const status = skipTranscription ? 'rendering' : 'processing'
  await updateJobStatus(jobId, status)
  return { status }
}

export class RetryServiceError extends Error {
  code: RetryError
  constructor(code: RetryError, message: string) {
    super(message)
    this.code = code
  }
}
