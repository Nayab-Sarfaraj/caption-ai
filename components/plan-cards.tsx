'use client'

import { useCallback, useState } from 'react'
import { PRICING_TIERS, type BillingTier } from '@/src/helpers/pricing-tiers'
import type { SubscriptionStatus } from '@/src/models/User'

const FEATURES = ['Unlimited renders', 'No watermark', 'All caption styles']

export function PlanCards({ status }: { status: SubscriptionStatus }) {
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

      <div className="grid gap-3 sm:grid-cols-3">
        {PRICING_TIERS.map((t) => {
          const featured = Boolean(t.badge)
          return (
            <div
              key={t.id}
              className={[
                'relative flex flex-col rounded-2xl border p-4',
                featured
                  ? 'border-[var(--brand)] shadow-[0_16px_40px_-24px_var(--brand)]'
                  : 'border-[var(--hair)]',
              ].join(' ')}
            >
              {t.badge && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {t.badge}
                </span>
              )}
              <p className="text-[11px] uppercase tracking-wide text-[var(--mute)] font-[family-name:var(--font-geist-mono)]">
                {t.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)] tabular-nums">
                {t.price}
                <span className="text-xs font-normal text-[var(--mute)]">{t.period}</span>
              </p>
              <p className="text-[11px] text-[var(--mute)] min-h-[14px]">{t.note ?? ''}</p>

              <ul className="mt-3 mb-4 space-y-1.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--ink-dim)]">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="var(--brand)" strokeWidth="2.4" aria-hidden="true">
                      <path d="M4 10l4 4 8-9" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => subscribe(t.id)}
                disabled={loading !== null}
                className={[
                  'mt-auto w-full rounded-lg py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  featured
                    ? 'bg-[var(--brand)] text-white hover:brightness-110'
                    : 'border border-[var(--hair)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
                ].join(' ')}
              >
                {loading === t.id ? 'Redirecting…' : `Get ${t.label}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
