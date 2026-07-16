'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SubscriptionStatus } from '@/src/models/User'
import { PRICING_TIERS, type BillingTier } from '@/src/helpers/pricing-tiers'

export function BillingActions({ status }: { status: SubscriptionStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState<BillingTier | 'cancel' | 'portal' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = useCallback(async (tier: BillingTier) => {
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

  const handlePortal = useCallback(async () => {
    setLoading('portal')
    setError(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not open billing portal')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing portal')
      setLoading(null)
    }
  }, [])

  const handleCancel = useCallback(async () => {
    setLoading('cancel')
    setError(null)
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Cancel failed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setLoading(null)
    }
  }, [router])

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-[#c1361f]">{error}</p>}

      {status === 'active' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePortal}
            disabled={loading !== null}
            className="text-sm font-medium text-[#1a1917] border border-[#14120f1f] px-4 py-2 hover:border-[#c1361f] hover:text-[#c1361f] transition-colors disabled:opacity-50"
          >
            {loading === 'portal' ? 'Opening…' : 'Manage payment & invoices'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading !== null}
            className="text-sm font-medium text-[#1a1917] border border-[#14120f1f] px-4 py-2 hover:border-[#c1361f] hover:text-[#c1361f] transition-colors disabled:opacity-50"
          >
            {loading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {PRICING_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSubscribe(t.id)}
              disabled={loading !== null}
              className="flex flex-col items-center gap-0.5 bg-[#c1361f] text-white text-sm font-bold px-3 py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === t.id ? (
                'Redirecting…'
              ) : (
                <>
                  <span>{t.label}</span>
                  <span className="text-xs font-normal opacity-90">{t.price}{t.period}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
      {status === 'past_due' && (
        <p className="text-xs text-[#c1361f]">Last payment failed — pick a plan below to resubscribe.</p>
      )}
    </div>
  )
}
