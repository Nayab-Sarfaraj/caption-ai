import { connectDB } from '@/src/lib/mongo'
import { User, IUser } from '@/src/models/User'

export async function findByClerkId(clerkId: string): Promise<IUser | null> {
  await connectDB()
  return User.findOne({ clerkId })
}

export async function upsertFromClerk(data: {
  clerkId: string
  email: string
  name: string
}): Promise<IUser> {
  await connectDB()
  return User.findOneAndUpdate(
    { clerkId: data.clerkId },
    { $set: { email: data.email, name: data.name } },
    { upsert: true, new: true, runValidators: true }
  ) as Promise<IUser>
}
