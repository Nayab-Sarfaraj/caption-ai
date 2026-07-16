export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleSubmitSupportMessage } from '@/src/controllers/support.controller'

export async function POST(req: NextRequest) {
  return handleSubmitSupportMessage(req)
}
