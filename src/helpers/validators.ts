import { z } from 'zod'

export const uploadRequestSchema = z.object({
  filename: z.string().max(255),
  contentType: z.enum(['video/mp4', 'video/quicktime']),
  fileSize: z.number().positive().max(500 * 1024 * 1024), // 500MB
})

export const captionUploadSchema = z.object({
  jobId: z.string().min(1),
  content: z.string().min(1),
  filename: z.string().min(1),
})

export const jobConfirmSchema = z.object({
  jobId: z.string().min(1),
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>
