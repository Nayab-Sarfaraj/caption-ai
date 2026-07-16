export const runtime = 'nodejs'

import { handleCreatePortalSession } from '@/src/controllers/billing.controller'

export async function POST() {
  return handleCreatePortalSession()
}
