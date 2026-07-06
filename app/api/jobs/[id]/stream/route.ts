export const runtime = 'nodejs'

import { auth } from '@clerk/nextjs/server'
import { findJobById } from '@/src/repositories/job.repository'
import { connectDB } from '@/src/lib/mongo'
import { createRedisSub } from '@/src/lib/redis'
import type { JobProgressEvent } from '@/src/types/job.types'

const POLL_INTERVAL_MS = 2000
const MAX_STREAM_DURATION_MS = 10 * 60 * 1000 // 10 min

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  await connectDB()
  const job = await findJobById(id)
  if (!job || job.userId !== userId) {
    return new Response('Not found', { status: 404 })
  }

  // If already terminal, return immediately
  if (job.status === 'done' || job.status === 'failed' || job.status === 'transcript_ready') {
    const event: JobProgressEvent =
      job.status === 'done'
        ? { type: 'done', outputKey: job.outputKey ?? undefined }
        : job.status === 'transcript_ready'
        ? { type: 'done' }
        : { type: 'failed', errorMessage: job.errorMessage ?? 'Unknown error' }
    return new Response(`data: ${JSON.stringify(event)}\n\n`, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  const send = (event: JobProgressEvent) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
    } catch {
      // writer closed — ignore
    }
  }

  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    writer.close().catch(() => {})
    redisSub.disconnect()
    clearInterval(pollTimer)
    clearTimeout(maxTimer)
  }

  // Subscribe to Redis pub/sub for frame-level progress
  const redisSub = createRedisSub()
  const channel = `job:${id}:progress`
  redisSub.subscribe(channel)
  redisSub.on('message', (_ch: string, msg: string) => {
    try {
      const data = JSON.parse(msg) as { renderedFrames: number; totalFrames: number }
      send({ type: 'progress', ...data })
    } catch {
      // ignore parse errors
    }
  })

  // Poll Mongo every 2s for terminal status (done/failed)
  const pollTimer = setInterval(async () => {
    try {
      const updated = await findJobById(id)
      if (!updated) return
      if (updated.status === 'done') {
        send({ type: 'done', outputKey: updated.outputKey ?? undefined })
        close()
      } else if (updated.status === 'transcript_ready') {
        send({ type: 'done' })
        close()
      } else if (updated.status === 'failed') {
        send({ type: 'failed', errorMessage: updated.errorMessage ?? 'Unknown error' })
        close()
      }
    } catch {
      // ignore transient DB errors
    }
  }, POLL_INTERVAL_MS)

  const maxTimer = setTimeout(() => {
    send({ type: 'failed', errorMessage: 'Stream timeout — check job status manually' })
    close()
  }, MAX_STREAM_DURATION_MS)

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
