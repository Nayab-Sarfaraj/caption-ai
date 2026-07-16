import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findByClerkId } from '@/src/repositories/user.repository'
import { getUsageStats, getTotalStorageBytes, countRendersThisMonth } from '@/src/repositories/job.repository'
import { FREE_TIER_MONTHLY_RENDERS } from '@/src/services/billing.service'
import { formatBytes } from '@/src/helpers/format-bytes'
import { BillingActions } from '@/components/billing-actions'

const PLAN_LABEL: Record<string, string> = {
  active: 'Pro',
  past_due: 'Payment failed',
  unpaid: 'Payment failed',
  canceled: 'Cancelled',
  incomplete: 'Pending',
  incomplete_expired: 'Free',
  trialing: 'Trial',
  none: 'Free',
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[#14120f1f] bg-white p-5 space-y-1.5">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">{label}</p>
      <p className="text-2xl font-bold text-[#1a1917] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#6b6862]">{sub}</p>}
    </div>
  )
}

export default async function UsagePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const [user, stats, storageBytes, rendersThisMonth] = await Promise.all([
    findByClerkId(userId),
    getUsageStats(userId),
    getTotalStorageBytes(userId),
    countRendersThisMonth(userId),
  ])

  const status = user?.subscriptionStatus ?? 'none'
  const isPaid = status === 'active'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Usage'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Usage</h1>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Current plan" value={PLAN_LABEL[status] ?? 'Free'} />
        <StatCard label="Renders done" value={String(stats.done)} />
        <StatCard label="Renders failed" value={String(stats.failed)} />
        <StatCard
          label="Total processed"
          value={formatBytes(storageBytes)}
          sub="All uploads ever, including ones auto-deleted after 7 days — not live storage."
        />
      </div>

      {!isPaid && (
        <div className="mt-4 border border-[#14120f1f] bg-white p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a39e96]">Free-tier renders this month</span>
              <span className="text-[#6b6862] tabular-nums">{rendersThisMonth} / {FREE_TIER_MONTHLY_RENDERS}</span>
            </div>
            <div className="h-1.5 w-full bg-[#14120f1f] overflow-hidden rounded-full mt-2.5">
              <div
                className="h-full bg-[#c1361f] transition-all"
                style={{ width: `${Math.min(100, (rendersThisMonth / FREE_TIER_MONTHLY_RENDERS) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-[#6b6862]">Free renders are watermarked. Subscribe for unlimited, watermark-free exports.</p>
          <BillingActions status={status} />
        </div>
      )}
    </div>
  )
}
