export const runtime = 'nodejs'

import { type NextRequest } from 'next/server'
import { handleRazorpayWebhook } from '@/src/controllers/billing.controller'

export async function POST(req: NextRequest) {
  return handleRazorpayWebhook(req)
}
