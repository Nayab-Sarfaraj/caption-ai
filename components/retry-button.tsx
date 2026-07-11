'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

const MAX_MANUAL_RETRIES = 3

export function RetryButton({ jobId, manualRetryCount }: { jobId: string; manualRetryCount: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const atCap = manualRetryCount >= MAX_MANUAL_RETRIES

  const handleRetry = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Retry failed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed')
      setLoading(false)
    }
  }, [jobId, router])

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-[#c1361f]">{error}</p>}
      <button
        type="button"
        onClick={handleRetry}
        disabled={loading || atCap}
        className="w-full bg-[#c1361f] text-white text-sm font-bold py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Retrying…' : atCap ? 'Retry limit reached' : `Retry${manualRetryCount > 0 ? ` (${manualRetryCount}/${MAX_MANUAL_RETRIES} used)` : ''}`}
      </button>
    </div>
  )
}
