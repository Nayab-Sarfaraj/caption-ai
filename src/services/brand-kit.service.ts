import { findBrandKitByUserId, upsertBrandKit, BrandKitInput } from '@/src/repositories/brand-kit.repository'
import type { IBrandKit } from '@/src/models/BrandKit'

export async function getBrandKit(userId: string): Promise<IBrandKit | null> {
  return findBrandKitByUserId(userId)
}

export async function saveBrandKit(userId: string, data: BrandKitInput): Promise<IBrandKit> {
  return upsertBrandKit(userId, data)
}
