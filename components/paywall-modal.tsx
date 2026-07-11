'use client'

import { useEffect } from 'react'
import { BillingActions } from '@/components/billing-actions'

const BENEFITS = [
  'Unlimited renders — no monthly cap',
  'No watermark on exports',
  'All 11 caption styles',
  'Priority render queue',
]

export interface PaywallModalProps {
  onClose: () => void
  // Proceeds with the action that opened this modal (upload, export) instead
  // of subscribing — still hits the real server-side free-tier gate, this
  // just doesn't short-circuit it. Omit to just show a dismiss-only modal.
  onContinueFree?: () => void
}

export function PaywallModal({ onClose, onContinueFree }: PaywallModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-[family-name:var(--font-cc)]"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-md w-full p-6 sm:p-7 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#a39e96] hover:text-[#1a1917] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Upgrade'}</p>
          <h2 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Go unlimited</h2>
          <p className="text-sm text-[#6b6862] mt-1.5">Unlimited, watermark-free renders — no monthly limit.</p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-[#1a1917]">$12–15</span>
          <span className="text-sm text-[#a39e96]">/month flat</span>
        </div>

        <ul className="space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-[#1a1917]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c1361f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {b}
            </li>
          ))}
        </ul>

        <div className="border-t border-[#14120f1f]" />

        <BillingActions status="none" />

        {onContinueFree && (
          <button
            type="button"
            onClick={onContinueFree}
            className="w-full text-center text-xs text-[#a39e96] hover:text-[#6b6862] transition-colors"
          >
            Continue with free render (watermarked)
          </button>
        )}
      </div>
    </div>
  )
}
