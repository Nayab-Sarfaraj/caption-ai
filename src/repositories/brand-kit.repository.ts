import { connectDB } from '@/src/lib/mongo'
import { BrandKit, IBrandKit } from '@/src/models/BrandKit'

export interface BrandKitInput {
  fontFamily?: string | null
  activeColor?: string | null
  textColor?: string | null
  accentColor?: string | null
  defaultCompositionId?: string | null
}

export async function findBrandKitByUserId(userId: string): Promise<IBrandKit | null> {
  await connectDB()
  return BrandKit.findOne({ userId })
}

export async function upsertBrandKit(userId: string, data: BrandKitInput): Promise<IBrandKit> {
  await connectDB()
  return BrandKit.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
}
