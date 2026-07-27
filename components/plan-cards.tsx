'use client'

import { useCallback, useState } from 'react'
import { PRICING_TIERS, type BillingTier } from '@/src/helpers/pricing-tiers'
import type { SubscriptionStatus } from '@/src/models/User'

const FEATURES = ['Unlimited renders', 'No watermark', 'All caption styles']

// compact: for tight spaces (paywall modal) — drops the feature list (a
// Free-vs-Pro table usually sits above it) and stays 3-across at any width.
export function PlanCards({ status, compact = false }: { status: SubscriptionStatus; compact?: boolean }) {
  const [loading, setLoading] = useState<BillingTier | null>(null)
  const [error, setError] = useState<string | null>(null)

  const subscribe = useCallback(async (tier: BillingTier) => {
    setLoading(tier)
    setError(null)
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Subscribe failed')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscribe failed')
      setLoading(null)
    }
  }, [])

  return (
    <div className="space-y-3">
      {status === 'past_due' && (
        <p className="text-xs text-[var(--brand)]">Last payment failed — pick a plan to resubscribe.</p>
      )}
      {error && <p className="text-xs text-[var(--brand)]">{error}</p>}

      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2' : 'grid gap-3 sm:grid-cols-3'}>
        {PRICING_TIERS.map((t) => {
          const featured = Boolean(t.badge)
          return (
            <div
              key={t.id}
              className={[
                'relative flex flex-col rounded-2xl border',
                compact ? 'p-3' : 'p-4',
                featured
                  ? 'border-[var(--brand)] shadow-[0_16px_40px_-24px_var(--brand)] bg-[var(--brand-soft)]/20'
                  : 'border-[var(--hair)] bg-[var(--card)]',
              ].join(' ')}
            >
              <div className="flex sm:flex-col justify-between items-start sm:items-stretch gap-1">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--mute)] font-[family-name:var(--font-geist-mono)]">
                    {t.label}
                  </p>
                  <p className={`mt-0.5 font-bold text-[var(--ink)] tabular-nums ${compact ? 'text-base sm:text-lg' : 'text-2xl'}`}>
                    {t.price}
                    <span className="text-xs font-normal text-[var(--mute)]">{t.period}</span>
                  </p>
                  {t.note && (
                    <p className="text-[10px] text-[var(--mute)] leading-tight mt-0.5">{t.note}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => subscribe(t.id)}
                  disabled={loading !== null}
                  className={[
                    'rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0',
                    compact ? 'py-1.5 px-3 text-xs sm:w-full sm:mt-2.5' : 'mt-auto w-full py-2 text-sm',
                    featured
                      ? 'bg-[var(--brand)] text-white hover:brightness-110'
                      : 'border border-[var(--hair)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
                  ].join(' ')}
                >
                  {loading === t.id ? '…' : `Get ${t.label}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
