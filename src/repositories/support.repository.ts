import { connectDB } from '@/src/lib/mongo'
import { SupportMessage, ISupportMessage, SupportMessageType } from '@/src/models/SupportMessage'

export async function createSupportMessage(data: {
  type: SupportMessageType
  message: string
  email: string
  userId: string | null
}): Promise<ISupportMessage> {
  await connectDB()
  return SupportMessage.create(data)
}
