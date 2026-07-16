import mongoose, { Document, Schema } from 'mongoose'

// Mirrors Polar's Subscription.status field directly (no local remapping) —
// 'none' is our own addition for users who never subscribed.
export type SubscriptionStatus =
  | 'none'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export interface IUser extends Document {
  clerkId: string
  email: string
  name: string
  polarSubscriptionId: string | null
  polarCustomerId: string | null  // only populated once the webhook confirms the first payment
  subscriptionStatus: SubscriptionStatus
  billingTier: 'weekly' | 'monthly' | 'yearly' | null  // derived from the webhook's productId, not user input
  bonusRenders: number  // manual grant on top of FREE_TIER_MONTHLY_RENDERS — comps, beta testers, support gestures
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    polarSubscriptionId: { type: String, default: null, index: true },
    polarCustomerId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'],
      default: 'none',
    },
    billingTier: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: null },
    bonusRenders: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
