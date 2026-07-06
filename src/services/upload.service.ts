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
  })

  return { uploadUrl, key, jobId: jobId.toString() }
}
