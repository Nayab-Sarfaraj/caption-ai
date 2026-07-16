import { getPolar } from '@/src/lib/polar'
import { getPostHog } from '@/src/lib/posthog'
import { env } from '@/config/env'
import {
  findByClerkId,
  syncSubscription,
} from '@/src/repositories/user.repository'
import { countRendersThisMonth } from '@/src/repositories/job.repository'
import type { SubscriptionStatus } from '@/src/models/User'
import type { BillingTier } from '@/src/helpers/pricing-tiers'

// Single source of truth — usage page, billing page, and the render-trigger
// gate all read this. Redeclaring it per-file lets it drift silently.
export const FREE_TIER_MONTHLY_RENDERS = 3

// Maps each billing cadence to its Polar Product — three separate Products
// since Polar checkout takes a product list, not a price/interval param.
const TIER_PRODUCT_IDS: Record<BillingTier, string> = {
  weekly: env.POLAR_PRODUCT_ID_WEEKLY,
  monthly: env.POLAR_PRODUCT_ID_MONTHLY,
  yearly: env.POLAR_PRODUCT_ID_YEARLY,
}

// Reverse lookup for webhook sync — Polar tells us the productId that was
// purchased, not which of our three named tiers it maps to.
function tierForProductId(productId: string): BillingTier | null {
  const entry = (Object.entries(TIER_PRODUCT_IDS) as [BillingTier, string][])
    .find(([, id]) => id === productId)
  return entry ? entry[0] : null
}

// Minimal shape of the fields we actually read off a Polar subscription
// webhook payload — not the full SDK type, matching this codebase's existing
// pattern of hand-typing just what's consumed.
export interface PolarSubscriptionEvent {
  type: string
  data?: {
    id?: string
    status?: string
    customerId?: string | null
    productId?: string | null
    customer?: { externalId?: string | null }
  }
}

export async function createCheckout(clerkId: string, tier: BillingTier): Promise<{ url: string }> {
  const user = await findByClerkId(clerkId)
  if (!user) throw new Error('User not found')

  // No local DB write here — Polar's checkout-first flow means there's no
  // subscription to reference until the customer actually completes payment
  // on Polar's hosted page. The subscription.* webhook is what links
  // polarSubscriptionId to this clerkId, via externalCustomerId set below.
  const checkout = await getPolar().checkouts.create({
    products: [TIER_PRODUCT_IDS[tier]],
    externalCustomerId: clerkId,
    successUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  return { url: checkout.url }
}

export async function cancelSubscription(clerkId: string): Promise<void> {
  const user = await findByClerkId(clerkId)
  if (!user?.polarSubscriptionId) throw new Error('No active subscription')

  // cancelAtPeriodEnd: true — let the user keep paid access through the cycle
  // they already paid for. Local status is NOT updated here — the
  // subscription.updated webhook (still reporting status: 'active' until the
  // period actually ends) is the single source of truth.
  await getPolar().subscriptions.update({
    id: user.polarSubscriptionId,
    subscriptionUpdate: { cancelAtPeriodEnd: true },
  })
}

// One handler for every subscription.* event — Polar always sends the full
// current subscription object (status, customer.externalId), so there's no
// need to switch per event name like Razorpay's payload required. Idempotent:
// re-processing the same event just re-syncs the same status.
export async function handleWebhookEvent(event: PolarSubscriptionEvent): Promise<void> {
  if (!event.type.startsWith('subscription.')) return

  const sub = event.data
  const clerkId = sub?.customer?.externalId
  if (!sub?.id || !sub?.status || !clerkId) return

  await syncSubscription({
    clerkId,
    subscriptionId: sub.id,
    status: sub.status as SubscriptionStatus,
    polarCustomerId: sub.customerId ?? undefined,
    billingTier: sub.productId ? tierForProductId(sub.productId) : undefined,
  })

  if (sub.status === 'active') {
    getPostHog()?.capture({
      distinctId: clerkId,
      event: 'subscription_active',
      properties: { tier: sub.productId ? tierForProductId(sub.productId) : null },
    })
  }
}

// Live period/renewal info — not cached locally, Polar is the source of
// truth for billing periods (same reasoning as PLAN-PHASE2.md's optional
// billing-cycle-usage note: don't duplicate what Polar already tracks).
export async function getSubscriptionDetails(clerkId: string): Promise<{
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  startedAt: Date | null
  amount: number // cents
  currency: string
} | null> {
  const user = await findByClerkId(clerkId)
  if (!user?.polarSubscriptionId) return null

  const sub = await getPolar().subscriptions.get({ id: user.polarSubscriptionId })
  return {
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    startedAt: sub.startedAt,
    amount: sub.amount,
    currency: sub.currency,
  }
}

// Polar-hosted customer portal — real invoices + payment-method management,
// not something we'd build ourselves for MVP. Session tokens are short-lived
// by design, so this is generated on demand, never stored.
export async function createCustomerPortalUrl(clerkId: string): Promise<string> {
  const session = await getPolar().customerSessions.create({ externalCustomerId: clerkId })
  return session.customerPortalUrl
}

export async function canRender(clerkId: string): Promise<{ allowed: boolean; watermark: boolean }> {
  const user = await findByClerkId(clerkId)

  if (user?.subscriptionStatus === 'active') {
    return { allowed: true, watermark: false }
  }

  const cap = FREE_TIER_MONTHLY_RENDERS + (user?.bonusRenders ?? 0)
  const count = await countRendersThisMonth(clerkId)
  if (count < cap) {
    return { allowed: true, watermark: true }
  }

  return { allowed: false, watermark: false }
}

// Free renders left this month for a non-paying user — 0 once subscribed
// (unlimited, the number stops being meaningful) so callers can treat it as
// "N left" without also checking subscriptionStatus themselves.
export async function getRendersRemaining(clerkId: string): Promise<number> {
  const user = await findByClerkId(clerkId)
  if (user?.subscriptionStatus === 'active') return 0

  const cap = FREE_TIER_MONTHLY_RENDERS + (user?.bonusRenders ?? 0)
  const count = await countRendersThisMonth(clerkId)
  return Math.max(0, cap - count)
}
