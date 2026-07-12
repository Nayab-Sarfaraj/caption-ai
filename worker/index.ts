import path from 'path'
import dotenv from 'dotenv'
// Bare 'dotenv/config' loads '.env' at process.cwd(), which is neither
// worker/.env (the file docs/vm-setup.md step 6 has you create) nor
// .env.local (Next's file) — pm2 runs this with cwd at the repo root, so
// nothing ever populated MONGO_URI etc. in production without this.
dotenv.config({ path: path.join(process.cwd(), 'worker/.env') })
import { Worker } from 'bullmq'
import { connectDB } from '../src/lib/mongo'
import { getRedisBullMQOptions } from '../src/lib/redis'
import { QUEUE_NAME } from '../src/lib/queue'
import type { RenderJobPayload } from '../src/types/job.types'
import { processRenderJob } from './render'
import { updateJobFailed, updateJobStatus } from '../src/repositories/job.repository'

async function main() {
  await connectDB()
  console.log('[worker] MongoDB connected')

  const connection = getRedisBullMQOptions()

  const worker = new Worker<RenderJobPayload>(
    QUEUE_NAME,
    async (job) => {
      console.log(`[worker] picked up job ${job.data.jobId} (${job.data.compositionId})`)
      await processRenderJob(job)
      console.log(`[worker] completed job ${job.data.jobId}`)
    },
    {
      connection,
      concurrency: 1, // MVP: one render at a time — GCP VM constraint
    }
  )

  worker.on('failed', async (job, err) => {
    if (!job) return
    const { jobId } = job.data
    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1)
    if (isLastAttempt) {
      await updateJobFailed(jobId, err.message).catch(console.error)
      console.error(`[worker] job ${jobId} permanently failed after ${job.attemptsMade} attempts:`, err.message)
    } else {
      await updateJobStatus(jobId, 'pending').catch(console.error)
      console.warn(`[worker] job ${jobId} failed attempt ${job.attemptsMade}, will retry`)
    }
  })

  worker.on('error', (err) => {
    console.error('[worker] worker error:', err)
  })

  console.log(`[worker] listening on queue "${QUEUE_NAME}", concurrency=1`)

  process.on('SIGTERM', async () => {
    console.log('[worker] SIGTERM received, draining…')
    await worker.close()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('[worker] fatal startup error:', err)
  process.exit(1)
})
