import { connectDB } from '@/src/lib/mongo'
import { Job, IJob, JobStatus } from '@/src/models/Job'
import type { Transcript } from '@/src/types/transcript.types'

export async function createJob(data: {
  _id?: unknown
  userId: string
  videoKey: string
  originalFilename: string
  status: JobStatus
  batchId?: string
  fileSize?: number
}): Promise<IJob> {
  await connectDB()
  return Job.create(data) as Promise<IJob>
}

export async function findJobById(id: string): Promise<IJob | null> {
  await connectDB()
  return Job.findById(id)
}

export async function findJobsByBatchId(batchId: string): Promise<IJob[]> {
  await connectDB()
  return Job.find({ batchId }).sort({ createdAt: 1 })
}

export interface PaginatedJobs {
  jobs: IJob[]
  total: number
  page: number
  pageSize: number
}

export async function findJobsByUserId(
  userId: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<PaginatedJobs> {
  await connectDB()
  const skip = (page - 1) * pageSize
  const [jobs, total] = await Promise.all([
    Job.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Job.countDocuments({ userId }),
  ])
  return { jobs, total, page, pageSize }
}

export async function countTodayUploads(userId: string): Promise<number> {
  await connectDB()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  return Job.countDocuments({ userId, createdAt: { $gte: startOfToday } })
}

// Free-tier gate (3 renders/month) — counts jobs that actually reached a
// render, not just uploads. No separate "render triggered at" timestamp
// exists, so this uses Job.createdAt as a proxy (upload and render-trigger
// happen close together in practice) rather than adding a new field for MVP.
export async function countRendersThisMonth(userId: string): Promise<number> {
  await connectDB()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  return Job.countDocuments({
    userId,
    status: { $in: ['rendering', 'done'] },
    createdAt: { $gte: startOfMonth },
  })
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  extra?: Partial<Pick<IJob, 'errorMessage' | 'outputKey' | 'retryCount'>>
): Promise<IJob | null> {
  await connectDB()
  return Job.findByIdAndUpdate(id, { $set: { status, ...extra } }, { new: true })
}

export async function updateJobTranscript(
  id: string,
  transcript: Transcript,
  transcriptKey?: string
): Promise<IJob | null> {
  await connectDB()
  const update: Record<string, unknown> = { transcriptSource: transcript.source }

  if (transcriptKey) {
    update.transcriptKey = transcriptKey
  } else {
    // Always strip non-serializable fields before storing
    update.transcript = JSON.parse(JSON.stringify(transcript))
  }

  return Job.findByIdAndUpdate(id, { $set: update }, { new: true })
}

export async function updateJobDone(id: string, outputKey: string): Promise<IJob | null> {
  await connectDB()
  return Job.findByIdAndUpdate(id, { $set: { status: 'done', outputKey } }, { new: true })
}

export async function updateJobDimensions(id: string, width: number, height: number): Promise<void> {
  await connectDB()
  await Job.findByIdAndUpdate(id, { $set: { width, height } })
}

export async function updateJobFailed(id: string, errorMessage: string): Promise<IJob | null> {
  await connectDB()
  return Job.findByIdAndUpdate(
    id,
    { $set: { status: 'failed', errorMessage }, $inc: { retryCount: 1 } },
    { new: true }
  )
}

// Persists the resolved render config (post brand-kit merge) so a manual
// retry can reuse exactly what was attempted, not today's brand kit values.
export async function updateJobRenderConfig(
  id: string,
  config: { compositionId: string; activeColor?: string; textColor?: string; accentColor?: string; fontFamily?: string }
): Promise<void> {
  await connectDB()
  await Job.findByIdAndUpdate(id, { $set: config })
}

// Atomic — guards against a double-click racing past the cap. Returns null if
// the job isn't 'failed' or manualRetryCount is already at/over the cap.
export async function incrementManualRetryIfUnderCap(id: string, cap: number): Promise<IJob | null> {
  await connectDB()
  return Job.findOneAndUpdate(
    { _id: id, status: 'failed', manualRetryCount: { $lt: cap } },
    { $inc: { manualRetryCount: 1 }, $set: { errorMessage: null } },
    { new: true }
  )
}

export interface UsageStats {
  total: number
  done: number
  failed: number
  inProgress: number // pending | processing | transcribing | transcript_ready | rendering
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  await connectDB()
  const rows = await Job.aggregate<{ _id: JobStatus; count: number }>([
    { $match: { userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count])) as Partial<Record<JobStatus, number>>
  const done = byStatus.done ?? 0
  const failed = byStatus.failed ?? 0
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return { total, done, failed, inProgress: total - done - failed }
}

// "Total processed" — sums fileSize across every job ever recorded, not
// current live storage. Phase 1's 7-day auto-delete removes the R2 object but
// not this Mongo field, so this number only ever climbs. Intentional — see
// the tooltip copy on the usage page.
export async function getTotalStorageBytes(userId: string): Promise<number> {
  await connectDB()
  const [row] = await Job.aggregate<{ totalBytes: number }>([
    { $match: { userId } },
    { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } },
  ])
  return row?.totalBytes ?? 0
}
