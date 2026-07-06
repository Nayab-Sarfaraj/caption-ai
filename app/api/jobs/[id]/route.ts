export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleGetJob } from '@/src/controllers/job.controller'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleGetJob(req, id)
}
