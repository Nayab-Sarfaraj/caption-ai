import { connectDB } from '@/src/lib/mongo'
import { User, IUser, SubscriptionStatus } from '@/src/models/User'

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
    { upsert: true, returnDocument: 'after', runValidators: true }
  ) as Promise<IUser>
}

// Keyed on clerkId (Polar's externalCustomerId), not subscriptionId — Polar's
// checkout-first flow never gives us a subscription id to store locally
// before the first webhook fires, so every subscription.* event (first or
// Nth) links/re-links polarSubscriptionId + syncs status in one call.
// Idempotent — Polar can retry/resend webhook events.
export async function syncSubscription(data: {
  clerkId: string
  subscriptionId: string
  status: SubscriptionStatus
  polarCustomerId?: string
  billingTier?: 'weekly' | 'monthly' | 'yearly' | null
}): Promise<IUser | null> {
  await connectDB()
  return User.findOneAndUpdate(
    { clerkId: data.clerkId },
    {
      $set: {
        polarSubscriptionId: data.subscriptionId,
        subscriptionStatus: data.status,
        ...(data.polarCustomerId && { polarCustomerId: data.polarCustomerId }),
        ...(data.billingTier !== undefined && { billingTier: data.billingTier }),
      },
    },
    { returnDocument: 'after' }
  )
}
