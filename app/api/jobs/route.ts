export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleConfirmUpload } from '@/src/controllers/upload.controller'
import { handleListJobs } from '@/src/controllers/job.controller'

export async function POST(req: NextRequest) {
  return handleConfirmUpload(req)
}

export async function GET(req: NextRequest) {
  return handleListJobs(req)
}
