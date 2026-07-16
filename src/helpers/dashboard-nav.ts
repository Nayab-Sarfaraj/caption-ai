import type { SubscriptionStatus } from '@/src/models/User'

// Shared between the desktop Sidebar and mobile nav drawer — redeclaring
// per-file lets them drift, e.g. a new dashboard page added to one but not
// the other.
export const NAV = [
  { href: '/dashboard', index: '01', label: 'HOME', exact: true },
  { href: '/dashboard/jobs', index: '02', label: 'VIDEOS', exact: false },
  { href: '/dashboard/usage', index: '03', label: 'USAGE', exact: false },
  { href: '/dashboard/settings', index: '04', label: 'SETTINGS', exact: false },
  { href: '/dashboard/billing', index: '05', label: 'BILLING', exact: false },
]

export const PLAN_BADGE: Record<SubscriptionStatus, string> = {
  active: 'Pro plan',
  past_due: 'Payment failed',
  unpaid: 'Payment failed',
  canceled: 'Cancelled',
  incomplete: 'Pending',
  incomplete_expired: 'Free plan',
  trialing: 'Trial',
  none: 'Free plan',
}
