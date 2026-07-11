export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleRetryJob } from '@/src/controllers/job.controller'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleRetryJob(req, id)
}
