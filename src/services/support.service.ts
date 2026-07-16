import { createSupportMessage } from '@/src/repositories/support.repository'
import type { SupportMessageType } from '@/src/models/SupportMessage'

export async function submitSupportMessage(data: {
  type: SupportMessageType
  message: string
  email: string
  userId: string | null
}): Promise<void> {
  await createSupportMessage(data)
}
