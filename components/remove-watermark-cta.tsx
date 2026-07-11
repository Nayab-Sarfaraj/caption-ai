'use client'

import { useState } from 'react'
import { PaywallModal } from '@/components/paywall-modal'

// Watermark strip on a just-finished render — the "hit a limit, saw the
// value" moment contextual-paywall research points to as high-intent, unlike
// ambient nav CTAs (sidebar) which stay plain links to avoid modal fatigue.
export function RemoveWatermarkCta() {
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <div className="border border-[#14120f1f] bg-[#c1361f08] p-3 space-y-1.5">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <p className="text-xs text-[#1a1917]">This export has a watermark (free tier).</p>
      <button
        type="button"
        onClick={() => setShowPaywall(true)}
        className="text-xs font-bold text-[#c1361f] hover:brightness-90 transition-all"
      >
        Subscribe to remove it →
      </button>
    </div>
  )
}
