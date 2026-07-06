export const runtime = 'nodejs'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { findJobById, updateJobStatus } from '@/src/repositories/job.repository'
import { connectDB } from '@/src/lib/mongo'
import { getRenderQueue } from '@/src/lib/queue'
import type { RenderJobPayload } from '@/src/types/job.types'
import { z } from 'zod'

const bodySchema = z.object({
  compositionId: z.enum(['WordByWord', 'Karaoke', 'Fade', 'Spring']).default('WordByWord'),
})

const ENQUEUE_TIMEOUT_MS = 10_000

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = bodySchema.safeParse(await req.json().catch(() => ({})))
    if (!body.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    await connectDB()
    const job = await findJobById(id)
    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (job.status !== 'pending' && job.status !== 'failed') {
      return NextResponse.json({ error: 'Job not enqueueable in current state' }, { status: 409 })
    }

    const payload: RenderJobPayload = {
      jobId: id,
      userId,
      videoKey: job.videoKey,
      transcriptKey: job.transcriptKey ?? undefined,
      compositionId: body.data.compositionId,
      fps: 30,
      outputFormat: 'mp4',
      phase: 'transcribe',
    }

    const queue = getRenderQueue()

    // Mandatory timeout — queue.add() hangs silently on Redis disconnect
    await Promise.race([
      queue.add('render', payload, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis enqueue timeout')), ENQUEUE_TIMEOUT_MS)
      ),
    ])

    await updateJobStatus(id, 'processing')

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = message.includes('timeout') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
