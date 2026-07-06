export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleCreateUpload } from '@/src/controllers/upload.controller'

export async function POST(req: NextRequest) {
  return handleCreateUpload(req)
}
