import mongoose, { Document, Schema } from 'mongoose'

export type SubscriptionStatus = 'none' | 'active' | 'halted' | 'cancelled'

export interface IUser extends Document {
  clerkId: string
  email: string
  name: string
  razorpaySubscriptionId: string | null
  razorpayCustomerId: string | null  // only populated once the webhook confirms the authorization payment
  subscriptionStatus: SubscriptionStatus
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    razorpaySubscriptionId: { type: String, default: null, index: true },
    razorpayCustomerId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'halted', 'cancelled'],
      default: 'none',
    },
  },
  { timestamps: true }
)

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
