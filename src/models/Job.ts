import mongoose, { Document, Schema } from 'mongoose'

export type JobStatus = 'pending' | 'processing' | 'transcribing' | 'transcript_ready' | 'rendering' | 'done' | 'failed'
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
  retryCount: number            // BullMQ automatic retry count — NOT the same as manualRetryCount below
  manualRetryCount: number      // user-initiated retries from the dashboard, capped separately
  batchId: string | null        // shared across jobs created from one batch-upload session
  fileSize: number | null       // bytes, set at upload confirm time — null for jobs uploaded before this field existed
  width: number
  height: number
  // Resolved render config from the last trigger-render call (post brand-kit
  // merge) — persisted so a manual retry reuses what was actually attempted,
  // not whatever the user's brand kit happens to say right now.
  compositionId: string | null
  activeColor: string | null
  textColor: string | null
  accentColor: string | null
  fontFamily: string | null
  fontSizeMultiplier: number | null // caption scale from the last render; null = never rendered
  captionPosX: number | null        // caption horizontal position 0–100 %; null = composition default
  captionPosY: number | null        // caption vertical position 0–100 %; null = composition default
  watermarked: boolean | null   // whether the last-triggered render was free-tier watermarked; null = never rendered
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
      enum: ['pending', 'processing', 'transcribing', 'transcript_ready', 'rendering', 'done', 'failed'],
      default: 'pending',
    },
    transcriptSource: { type: String, enum: ['deepgram', 'user'], default: null },
    transcript: { type: Schema.Types.Mixed, default: null },
    transcriptKey: { type: String, default: null },
    outputKey: { type: String, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
    manualRetryCount: { type: Number, default: 0 },
    batchId: { type: String, default: null, index: true },
    fileSize: { type: Number, default: null },
    width: { type: Number, default: 1920 },
    height: { type: Number, default: 1080 },
    compositionId: { type: String, default: null },
    activeColor: { type: String, default: null },
    textColor: { type: String, default: null },
    accentColor: { type: String, default: null },
    fontFamily: { type: String, default: null },
    fontSizeMultiplier: { type: Number, default: null },
    captionPosX: { type: Number, default: null },
    captionPosY: { type: Number, default: null },
    watermarked: { type: Boolean, default: null },
  },
  { timestamps: true }
)

// Compound index for rate-limit query: count today's uploads per user
JobSchema.index({ userId: 1, createdAt: 1 })

export const Job = mongoose.models.Job ?? mongoose.model<IJob>('Job', JobSchema)
