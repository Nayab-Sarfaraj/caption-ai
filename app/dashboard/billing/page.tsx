import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findByClerkId } from '@/src/repositories/user.repository'
import { countRendersThisMonth } from '@/src/repositories/job.repository'
import { FREE_TIER_MONTHLY_RENDERS, getSubscriptionDetails } from '@/src/services/billing.service'
import { PLAN_COMPARISON, daysUntilRenderReset } from '@/src/helpers/plan-comparison'
import { PRICING_TIERS } from '@/src/helpers/pricing-tiers'
import { BillingActions } from '@/components/billing-actions'

const STATUS_COPY: Record<string, { label: string; desc: string; color: string }> = {
  active: { label: 'PRO', color: '#2e7d4f', desc: 'Unlimited renders, no watermark.' },
  past_due: { label: 'PAYMENT FAILED', color: '#c1361f', desc: 'Your last charge failed. Resubscribe to restore full access.' },
  unpaid: { label: 'PAYMENT FAILED', color: '#c1361f', desc: 'Your last charge failed. Resubscribe to restore full access.' },
  canceled: { label: 'CANCELLED', color: '#a39e96', desc: 'Your subscription was cancelled. Resubscribe anytime.' },
  incomplete: { label: 'PENDING', color: '#a39e96', desc: 'Checkout started but not confirmed yet.' },
  incomplete_expired: { label: 'FREE', color: '#a39e96', desc: `${FREE_TIER_MONTHLY_RENDERS} watermarked renders per month, no card required.` },
  trialing: { label: 'TRIAL', color: '#2e7d4f', desc: 'Unlimited renders, no watermark — trial period.' },
  none: { label: 'FREE', color: '#a39e96', desc: `${FREE_TIER_MONTHLY_RENDERS} watermarked renders per month, no card required.` },
}

export default async function BillingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const [user, rendersUsed] = await Promise.all([
    findByClerkId(userId),
    countRendersThisMonth(userId),
  ])

  const status = user?.subscriptionStatus ?? 'none'
  const s = STATUS_COPY[status] ?? STATUS_COPY.none
  const isActive = status === 'active'

  const tier = user?.billingTier ? PRICING_TIERS.find((t) => t.id === user.billingTier) : undefined
  // Live from Polar, not cached — only fetched when there's a subscription to look up.
  const details = isActive ? await getSubscriptionDetails(userId) : null
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const periodEndLabel = details ? formatDate(details.currentPeriodEnd) : null
  const memberSinceLabel = details?.startedAt ? formatDate(details.startedAt) : null
  const amountLabel = details ? `$${(details.amount / 100).toFixed(2)} ${details.currency.toUpperCase()}` : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Billing'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Plan</h1>

      {/* Current status — always shown, top of page */}
      <div className="mt-6 max-w-md border border-[#14120f1f] bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
          {isActive && tier && (
            <span className="text-xs text-[#a39e96]">— {tier.label} plan</span>
          )}
        </div>
        <p className="text-[13px] text-[#6b6862]">{s.desc}</p>

        {isActive && details && (
          <div className="text-sm space-y-1.5 pt-1">
            {amountLabel && (
              <div className="flex items-center justify-between">
                <span className="text-[#a39e96]">Price</span>
                <span className="text-[#6b6862] text-xs tabular-nums">{amountLabel}{tier?.period}</span>
              </div>
            )}
            {periodEndLabel && (
              <div className="flex items-center justify-between">
                <span className="text-[#a39e96]">{details.cancelAtPeriodEnd ? 'Access until' : 'Renews'}</span>
                <span className="text-[#6b6862] text-xs">{periodEndLabel}</span>
              </div>
            )}
            {memberSinceLabel && (
              <div className="flex items-center justify-between">
                <span className="text-[#a39e96]">Member since</span>
                <span className="text-[#6b6862] text-xs">{memberSinceLabel}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#a39e96]">Renders this month</span>
              <span className="text-[#6b6862] text-xs tabular-nums">{rendersUsed} (unlimited)</span>
            </div>
            {details.cancelAtPeriodEnd && (
              <p className="text-xs text-[#c1361f] pt-0.5">Cancellation scheduled — you keep full access until {periodEndLabel}.</p>
            )}
          </div>
        )}

        {!isActive && (
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-[#a39e96]">Renders this month</span>
            <span className="text-[#6b6862] text-xs tabular-nums">{rendersUsed} / {FREE_TIER_MONTHLY_RENDERS}</span>
          </div>
        )}

        {isActive && <BillingActions status={status} />}
      </div>

      {/* Upgrade content — outcome, value, reassurance, price, CTA. Only shown
          to non-Pro users; a paying user doesn't need to be re-sold. */}
      {!isActive && (
        <div className="mt-6 max-w-md border border-[#14120f1f] bg-white p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Upgrade'}</p>
            <h2 className="text-xl font-bold tracking-wide uppercase text-[#1a1917]">Go unlimited</h2>
            <p className="text-sm text-[#6b6862] mt-1.5">Unlimited, watermark-free renders — no monthly limit.</p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#a39e96]">
                <th className="text-left font-normal pb-2">&nbsp;</th>
                <th className="text-center font-normal pb-2">Free</th>
                <th className="text-center font-normal pb-2 text-[#c1361f]">Pro</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.label} className="border-t border-[#14120f1f]">
                  <td className="py-2 text-[#1a1917]">{row.label}</td>
                  <td className="py-2 text-center text-[#6b6862]">{row.free}</td>
                  <td className="py-2 text-center text-[#1a1917] font-bold">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-[#6b6862]">
            No card required to keep using the free tier — your renders reset in {daysUntilRenderReset()} day{daysUntilRenderReset() === 1 ? '' : 's'}. Cancel Pro anytime.
          </p>

          <div className="border-t border-[#14120f1f]" />

          <div className="grid grid-cols-3 gap-3">
            {PRICING_TIERS.map((t) => (
              <div key={t.id}>
                <p className="text-[11px] text-[#a39e96] uppercase tracking-wide">{t.label}</p>
                <p className="text-xl font-bold text-[#1a1917] mt-0.5">
                  {t.price}<span className="text-xs font-normal text-[#6b6862]">{t.period}</span>
                </p>
                {t.note && <p className="text-[11px] text-[#a39e96] mt-0.5">{t.note}</p>}
              </div>
            ))}
          </div>

          <BillingActions status={status} />
        </div>
      )}
    </div>
  )
}
