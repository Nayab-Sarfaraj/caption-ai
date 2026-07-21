'use client'

import { useEffect, useState } from 'react'
import { BillingActions } from '@/components/billing-actions'
import { PLAN_COMPARISON, daysUntilRenderReset } from '@/src/helpers/plan-comparison'
import { PRICING_TIERS } from '@/src/helpers/pricing-tiers'

export interface PaywallModalProps {
  onClose: () => void
  // Proceeds with the action that opened this modal (upload, export) instead
  // of subscribing — still hits the real server-side free-tier gate, this
  // just doesn't short-circuit it. Omit to just show a dismiss-only modal.
  onContinueFree?: () => void
}

export function PaywallModal({ onClose, onContinueFree }: PaywallModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // Mount closed, flip open next frame — gives the entrance transition
    // something to animate from instead of popping in instantly.
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf)
    }
  }, [onClose])

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      onClick={onClose}
    >
      <div
        className={[
          'bg-[var(--panel)] rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 relative transition-all duration-200',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Outcome first — what changes for you, not what it costs */}
        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)] mb-1.5">{'// Upgrade'}</p>
          <h2 className="text-2xl font-bold tracking-wide uppercase text-[var(--ink)]">Go unlimited</h2>
          <p className="text-sm text-[var(--ink-dim)] mt-1.5">Unlimited, watermark-free renders — no monthly limit.</p>
        </div>

        {/* Value explanation — honest Free vs Pro, only real differences */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-[var(--mute)]">
              <th className="text-left font-normal pb-2">&nbsp;</th>
              <th className="text-center font-normal pb-2">Free</th>
              <th className="text-center font-normal pb-2 text-[var(--brand)]">Pro</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map((row) => (
              <tr key={row.label} className="border-t border-[var(--hair)]">
                <td className="py-2 text-[var(--ink)]">{row.label}</td>
                <td className="py-2 text-center text-[var(--ink-dim)]">{row.free}</td>
                <td className="py-2 text-center text-[var(--ink)] font-bold">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reassurance — real, not manufactured: no card required for free tier,
            and if they're seeing this because they're out of renders, tell them
            honestly when it resets instead of only pushing to pay. */}
        <p className="text-xs text-[var(--ink-dim)]">
          No card required to keep using the free tier — your renders reset in {daysUntilRenderReset()} day{daysUntilRenderReset() === 1 ? '' : 's'}. Cancel Pro anytime.
        </p>

        <div className="border-t border-[var(--hair)]" />

        {/* Pricing — after value, not before */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {PRICING_TIERS.map((t) => (
            <div key={t.id}>
              <p className="text-lg font-bold text-[var(--ink)]">{t.price}</p>
              <p className="text-[11px] text-[var(--mute)]">{t.period}</p>
            </div>
          ))}
        </div>

        <BillingActions status="none" />

        {onContinueFree && (
          <button
            type="button"
            onClick={onContinueFree}
            className="w-full text-center text-xs text-[var(--mute)] hover:text-[var(--ink-dim)] transition-colors"
          >
            Continue with free render (watermarked)
          </button>
        )}
      </div>
    </div>
  )
}
