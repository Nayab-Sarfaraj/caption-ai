import { connectDB } from '@/src/lib/mongo'
import { Job, IJob, JobStatus } from '@/src/models/Job'
import type { Transcript } from '@/src/types/transcript.types'

export async function createJob(data: {
  _id?: unknown
  userId: string
  videoKey: string
  originalFilename: string
  status: JobStatus
}): Promise<IJob> {
  await connectDB()
  return Job.create(data) as Promise<IJob>
}

export async function findJobById(id: string): Promise<IJob | null> {
  await connectDB()
  return Job.findById(id)
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
