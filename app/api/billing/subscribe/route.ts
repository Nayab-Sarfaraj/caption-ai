export const runtime = 'nodejs'

import { handleCreateSubscription } from '@/src/controllers/billing.controller'

export async function POST() {
  return handleCreateSubscription()
}
