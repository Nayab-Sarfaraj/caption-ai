import { findJobById } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import type { IJob } from '@/src/models/Job'

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
