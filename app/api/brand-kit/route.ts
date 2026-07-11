export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleGetBrandKit, handleUpsertBrandKit } from '@/src/controllers/brand-kit.controller'

export async function GET() {
  return handleGetBrandKit()
}

export async function PUT(req: NextRequest) {
  return handleUpsertBrandKit(req)
}
