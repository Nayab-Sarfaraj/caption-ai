'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SubscriptionStatus } from '@/src/models/User'

export function BillingActions({ status }: { status: SubscriptionStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/subscribe', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Subscribe failed')
      // Same-tab redirect — Razorpay's hosted page has no callback_url, so the
      // back button is how the user returns here; this page re-reads status
      // fresh on every load once they do.
      window.location.href = data.shortUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscribe failed')
      setLoading(false)
    }
  }, [])

  const handleCancel = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Cancel failed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-[#c1361f]">{error}</p>}

      {status === 'active' ? (
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="text-sm font-medium text-[#1a1917] border border-[#14120f1f] px-4 py-2 hover:border-[#c1361f] hover:text-[#c1361f] transition-colors disabled:opacity-50"
        >
          {loading ? 'Cancelling…' : 'Cancel subscription'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-[#c1361f] text-white text-sm font-bold px-5 py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirecting…' : status === 'halted' ? 'Fix payment — resubscribe' : 'Subscribe'}
        </button>
      )}
    </div>
  )
}
