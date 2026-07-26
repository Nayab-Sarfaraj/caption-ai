import type { SubscriptionStatus } from '@/src/models/User'
import { Home, Film, BarChart3, Palette, CreditCard, type LucideIcon } from 'lucide-react'

// Shared between the desktop Sidebar and mobile nav drawer — redeclaring
// per-file lets them drift, e.g. a new dashboard page added to one but not
// the other.
export const NAV: { href: string; label: string; icon: LucideIcon; exact: boolean }[] = [
  { href: '/dashboard', label: 'Home', icon: Home, exact: true },
  { href: '/dashboard/jobs', label: 'Videos', icon: Film, exact: false },
  { href: '/dashboard/usage', label: 'Usage', icon: BarChart3, exact: false },
  { href: '/dashboard/settings', label: 'Brand kit', icon: Palette, exact: false },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, exact: false },
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
