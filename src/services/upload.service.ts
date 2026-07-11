import mongoose from 'mongoose'
import { connectDB } from '@/src/lib/mongo'
import { createJob, countTodayUploads } from '@/src/repositories/job.repository'
import { generatePresignedPut } from '@/src/helpers/presigned-url'

const MAX_DAILY_UPLOADS = 5

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
}

export async function createUploadJob(
  userId: string,
  input: { filename: string; contentType: string; fileSize: number }
): Promise<{ uploadUrl: string; key: string; jobId: string }> {
  await connectDB()

  const count = await countTodayUploads(userId)
  if (count >= MAX_DAILY_UPLOADS) throw new Error('RATE_LIMIT')

  const jobId = new mongoose.Types.ObjectId()
  const key = `uploads/${userId}/${jobId.toString()}/${sanitizeFilename(input.filename)}`

  const { url: uploadUrl } = await generatePresignedPut(key, input.contentType)

  await createJob({
    _id: jobId,
    userId,
    videoKey: key,
    originalFilename: input.filename,
    status: 'pending',
    fileSize: input.fileSize,
  })

  return { uploadUrl, key, jobId: jobId.toString() }
}

export interface BatchUploadResult {
  batchId: string
  uploads: { jobId: string; uploadUrl: string; key: string }[]
}

export async function createBatchUploadJobs(
  userId: string,
  files: { filename: string; contentType: string; fileSize: number }[]
): Promise<BatchUploadResult> {
  await connectDB()

  // Check the cap against todayCount + files.length BEFORE creating any Job
  // docs — otherwise a batch can partially succeed and leave orphaned Job
  // docs behind when the cap is hit mid-loop.
  const count = await countTodayUploads(userId)
  if (count + files.length > MAX_DAILY_UPLOADS) throw new Error('RATE_LIMIT')

  const batchId = new mongoose.Types.ObjectId().toString()

  const uploads = await Promise.all(
    files.map(async (input) => {
      const jobId = new mongoose.Types.ObjectId()
      const key = `uploads/${userId}/${jobId.toString()}/${sanitizeFilename(input.filename)}`
      const { url: uploadUrl } = await generatePresignedPut(key, input.contentType)

      await createJob({
        _id: jobId,
        userId,
        videoKey: key,
        originalFilename: input.filename,
        status: 'pending',
        batchId,
        fileSize: input.fileSize,
      })

      return { jobId: jobId.toString(), uploadUrl, key }
    })
  )

  return { batchId, uploads }
}
