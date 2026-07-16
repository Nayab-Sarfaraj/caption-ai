import mongoose, { Document, Schema } from 'mongoose'

export type SupportMessageType = 'bug' | 'feedback' | 'other'

export interface ISupportMessage extends Document {
  type: SupportMessageType
  message: string
  email: string
  userId: string | null // Clerk id if submitted while signed in, null for landing-page visitors
  createdAt: Date
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    type: { type: String, enum: ['bug', 'feedback', 'other'], required: true },
    message: { type: String, required: true, maxlength: 5000 },
    email: { type: String, required: true },
    userId: { type: String, default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const SupportMessage =
  mongoose.models.SupportMessage ?? mongoose.model<ISupportMessage>('SupportMessage', SupportMessageSchema)
