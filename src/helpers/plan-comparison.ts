// Single source of truth for Free vs Pro — used by the paywall modal and the
// billing page. Only real, currently-true differences: a claim the product
// doesn't actually implement (e.g. a "priority queue" when the worker is a
// single FIFO process) is a trust/legal risk the moment someone notices.
export const PLAN_COMPARISON: { label: string; free: string; pro: string }[] = [
  { label: 'Renders / month', free: '3', pro: 'Unlimited' },
  { label: 'Watermark', free: 'Yes', pro: 'No' },
  { label: 'Caption styles', free: 'All 11', pro: 'All 11' },
]

export function daysUntilRenderReset(): number {
  const now = new Date()
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.ceil((firstOfNextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
