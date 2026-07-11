import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findByClerkId } from '@/src/repositories/user.repository'
import { countRendersThisMonth } from '@/src/repositories/job.repository'
import { FREE_TIER_MONTHLY_RENDERS } from '@/src/services/billing.service'
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Billing'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Plan</h1>

      <div className="mt-6 max-w-md border border-[#14120f1f] bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
        </div>
        <p className="text-[13px] text-[#6b6862]">{s.desc}</p>

        {status !== 'active' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#a39e96]">Renders this month</span>
            <span className="text-[#6b6862] text-xs tabular-nums">{rendersUsed} / {FREE_TIER_MONTHLY_RENDERS}</span>
          </div>
        )}

        <div className="border-t border-[#14120f1f]" />

        <BillingActions status={status} />
      </div>
    </div>
  )
}
