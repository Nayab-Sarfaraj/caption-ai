import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findByClerkId } from '@/src/repositories/user.repository'
import { countRendersThisMonth } from '@/src/repositories/job.repository'
import { FREE_TIER_MONTHLY_RENDERS } from '@/src/services/billing.service'
import { PLAN_COMPARISON, daysUntilRenderReset } from '@/src/helpers/plan-comparison'
import { BillingActions } from '@/components/billing-actions'

const STATUS_COPY: Record<string, { label: string; desc: string; color: string }> = {
  active: { label: 'PRO', color: '#2e7d4f', desc: 'Unlimited renders, no watermark.' },
  halted: { label: 'PAYMENT FAILED', color: '#c1361f', desc: 'Your last charge failed and Razorpay stopped retrying. Resubscribe to restore full access.' },
  cancelled: { label: 'CANCELLED', color: '#a39e96', desc: 'Your subscription was cancelled. Resubscribe anytime.' },
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Billing'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Plan</h1>

      {/* Current status — always shown, top of page */}
      <div className="mt-6 max-w-md border border-[#14120f1f] bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
        </div>
        <p className="text-[13px] text-[#6b6862]">{s.desc}</p>

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

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#1a1917]">$12–15</span>
            <span className="text-sm text-[#a39e96]">/month flat</span>
          </div>

          <BillingActions status={status} />
        </div>
      )}
    </div>
  )
}
