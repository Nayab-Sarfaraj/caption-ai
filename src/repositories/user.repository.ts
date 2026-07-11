import { connectDB } from '@/src/lib/mongo'
import { User, IUser, SubscriptionStatus } from '@/src/models/User'

export async function findByClerkId(clerkId: string): Promise<IUser | null> {
  await connectDB()
  return User.findOne({ clerkId })
}

export async function findByRazorpaySubscriptionId(subscriptionId: string): Promise<IUser | null> {
  await connectDB()
  return User.findOne({ razorpaySubscriptionId: subscriptionId })
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

// Called right after razorpay.subscriptions.create() succeeds — status stays
// 'none' until the webhook confirms the authorization payment actually landed.
export async function setPendingSubscription(clerkId: string, subscriptionId: string): Promise<IUser | null> {
  await connectDB()
  return User.findOneAndUpdate(
    { clerkId },
    { $set: { razorpaySubscriptionId: subscriptionId } },
    { new: true }
  )
}

// Idempotent upsert keyed on razorpaySubscriptionId — Razorpay can retry/resend
// webhook events, re-processing the same event twice must be a no-op.
export async function updateSubscriptionStatus(
  subscriptionId: string,
  data: { status: SubscriptionStatus; razorpayCustomerId?: string }
): Promise<IUser | null> {
  await connectDB()
  return User.findOneAndUpdate(
    { razorpaySubscriptionId: subscriptionId },
    { $set: { subscriptionStatus: data.status, ...(data.razorpayCustomerId && { razorpayCustomerId: data.razorpayCustomerId }) } },
    { new: true }
  )
}
