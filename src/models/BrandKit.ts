import mongoose, { Document, Schema } from 'mongoose'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'

export interface IBrandKit extends Document {
  userId: string
  fontFamily: string | null
  activeColor: string | null
  textColor: string | null
  accentColor: string | null
  defaultCompositionId: CompositionId | null
  createdAt: Date
  updatedAt: Date
}

const BrandKitSchema = new Schema<IBrandKit>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fontFamily: { type: String, default: null },
    activeColor: { type: String, default: null },
    textColor: { type: String, default: null },
    accentColor: { type: String, default: null },
    defaultCompositionId: { type: String, default: null },
  },
  { timestamps: true }
)

export const BrandKit = mongoose.models.BrandKit ?? mongoose.model<IBrandKit>('BrandKit', BrandKitSchema)
