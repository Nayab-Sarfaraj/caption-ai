import mongoose, { Document, Schema } from 'mongoose'

export type JobStatus = 'pending' | 'processing' | 'transcribing' | 'rendering' | 'done' | 'failed'
export type TranscriptSource = 'deepgram' | 'user'

export interface IJob extends Document {
  userId: string
  videoKey: string
  originalFilename: string
  status: JobStatus
  transcriptSource: TranscriptSource | null
  transcript: unknown | null    // Schema.Types.Mixed — always serialize with JSON.parse(JSON.stringify())
  transcriptKey: string | null  // R2 key if transcript stored externally (large files)
  outputKey: string | null
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>(
  {
    userId: { type: String, required: true, index: true },
    videoKey: { type: String, required: true },
    originalFilename: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'transcribing', 'rendering', 'done', 'failed'],
      default: 'pending',
    },
    transcriptSource: { type: String, enum: ['deepgram', 'user'], default: null },
    transcript: { type: Schema.Types.Mixed, default: null },
    transcriptKey: { type: String, default: null },
    outputKey: { type: String, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound index for rate-limit query: count today's uploads per user
JobSchema.index({ userId: 1, createdAt: 1 })

export const Job = mongoose.models.Job ?? mongoose.model<IJob>('Job', JobSchema)
