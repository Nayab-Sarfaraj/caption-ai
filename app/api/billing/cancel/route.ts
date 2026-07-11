export const runtime = 'nodejs'

import { handleCancelSubscription } from '@/src/controllers/billing.controller'

export async function POST() {
  return handleCancelSubscription()
}
