// Single source of truth for the 3 paid billing cadences — landing page,
// paywall modal, and billing page all read this instead of hardcoding prices
// in three places and letting them drift.
export type BillingTier = 'weekly' | 'monthly' | 'yearly'

export interface PricingTier {
  id: BillingTier
  label: string
  price: string
  period: string
  note?: string
  badge?: string
}

export const PRICING_TIERS: PricingTier[] = [
  { id: 'weekly', label: 'Weekly', price: '$6.99', period: '/week' },
  { id: 'monthly', label: 'Monthly', price: '$14.99', period: '/month', badge: 'Most popular' },
  { id: 'yearly', label: 'Yearly', price: '$119', period: '/year', note: '~$9.92/mo — 34% off monthly' },
]
