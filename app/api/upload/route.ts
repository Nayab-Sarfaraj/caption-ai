export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleCreateUpload, handleDeleteUpload } from '@/src/controllers/upload.controller'

export async function POST(req: NextRequest) {
  return handleCreateUpload(req)
}

export async function DELETE(req: NextRequest) {
  return handleDeleteUpload(req)
}
