import { getRazorpay } from '@/src/lib/razorpay'
import { env } from '@/config/env'
import {
  findByClerkId,
  setPendingSubscription,
  updateSubscriptionStatus,
} from '@/src/repositories/user.repository'
import { countRendersThisMonth } from '@/src/repositories/job.repository'

// Razorpay Subscriptions have no "infinite" option — total_count is mandatory.
// 1200 monthly cycles = 100 years, the practical proxy for an unbounded flat-tier plan.
const TOTAL_COUNT_MONTHLY = 1200

const FREE_TIER_MONTHLY_RENDERS = 3

export interface RazorpaySubscriptionWebhookEntity {
  id: string
  status: string
  customer_id: string | null
}

export async function createSubscription(clerkId: string): Promise<{ shortUrl: string }> {
  const user = await findByClerkId(clerkId)
  if (!user) throw new Error('User not found')

  const subscription = await getRazorpay().subscriptions.create({
    plan_id: env.RAZORPAY_PLAN_ID,
    total_count: TOTAL_COUNT_MONTHLY,
    customer_notify: true,
    notes: { clerkId },
  })

  await setPendingSubscription(clerkId, subscription.id)

  return { shortUrl: subscription.short_url }
}

export async function cancelSubscription(clerkId: string): Promise<void> {
  const user = await findByClerkId(clerkId)
  if (!user?.razorpaySubscriptionId) throw new Error('No active subscription')

  // cancelAtCycleEnd: true — let the user keep paid access through the cycle
  // they already paid for. Local status is NOT updated here — the
  // subscription.cancelled webhook is the single source of truth, so a
  // delayed webhook can't leave local/Razorpay state disagreeing.
  await getRazorpay().subscriptions.cancel(user.razorpaySubscriptionId, true)
}

export async function handleWebhookEvent(event: {
  event: string
  payload?: { subscription?: { entity?: RazorpaySubscriptionWebhookEntity } }
}): Promise<void> {
  const sub = event.payload?.subscription?.entity
  if (!sub) return

  switch (event.event) {
    case 'subscription.authenticated':
      // Authorization payment succeeded but billing cycle hasn't started yet —
      // capture the customer id as soon as it's available, don't flip status.
      if (sub.customer_id) {
        await updateSubscriptionStatus(sub.id, { status: 'none', razorpayCustomerId: sub.customer_id })
      }
      break
    case 'subscription.activated':
      await updateSubscriptionStatus(sub.id, {
        status: 'active',
        ...(sub.customer_id && { razorpayCustomerId: sub.customer_id }),
      })
      break
    case 'subscription.charged':
      // Renewal succeeded — already 'active', nothing to change.
      break
    case 'subscription.halted':
      await updateSubscriptionStatus(sub.id, { status: 'halted' })
      break
    case 'subscription.cancelled':
      await updateSubscriptionStatus(sub.id, { status: 'cancelled' })
      break
    default:
      // subscription.updated / pending / paused / resumed / completed — no
      // local state change needed for MVP. Explicit no-op, not an error.
      break
  }
}

export async function canRender(clerkId: string): Promise<{ allowed: boolean; watermark: boolean }> {
  const user = await findByClerkId(clerkId)

  // Strict equality — 'halted' is Razorpay's dead-end after exhausting its own
  // retry schedule, not a grace period like Stripe's 'past_due'. Treat it the
  // same as 'cancelled'/'none': fall through to the free-tier check below.
  if (user?.subscriptionStatus === 'active') {
    return { allowed: true, watermark: false }
  }

  const count = await countRendersThisMonth(clerkId)
  if (count < FREE_TIER_MONTHLY_RENDERS) {
    return { allowed: true, watermark: true }
  }

  return { allowed: false, watermark: false }
}
