export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleCreateBatchUpload } from '@/src/controllers/upload.controller'

export async function POST(req: NextRequest) {
  return handleCreateBatchUpload(req)
}
