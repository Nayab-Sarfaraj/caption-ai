'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import { LogOut, LifeBuoy } from 'lucide-react'
import type { SubscriptionStatus } from '@/src/models/User'
import { PaywallModal } from '@/components/paywall-modal'
import { SupportModal } from '@/components/support-modal'
import { NAV, PLAN_BADGE } from '@/src/helpers/dashboard-nav'

export function Sidebar({ subscriptionStatus = 'none' }: { subscriptionStatus?: SubscriptionStatus }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSupport, setShowSupport] = useState(false)

  return (
    <aside
      className={[
        'shrink-0 border-r border-[var(--hair)] bg-[var(--panel)] flex flex-col h-full transition-[width] duration-150',
        collapsed ? 'w-[56px]' : 'w-[208px]',
      ].join(' ')}
    >
      <div className={['h-14 flex items-center border-b border-[var(--hair)]', collapsed ? 'justify-center px-0' : 'justify-between px-4'].join(' ')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="text-[15px] font-extrabold tracking-[-0.02em] text-[var(--ink)]"><span className="text-[var(--brand)]">Insta</span>cap</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--mute)] hover:text-[var(--ink)] border border-transparent hover:border-[var(--hair)] transition-colors shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" />
            <line x1="10" y1="4" x2="10" y2="20" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-2 py-3">
        {NAV.map(({ href, index, label, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-2.5 px-2 py-2 text-xs tracking-wide rounded-md border-l-2 transition-colors',
                collapsed ? 'justify-center' : '',
                active
                  ? 'text-[var(--ink)] border-[var(--brand)] bg-[var(--brand-soft)]'
                  : 'text-[var(--mute)] border-transparent hover:text-[var(--ink)]',
              ].join(' ')}
            >
              <span className={['text-[10px]', active ? 'text-[var(--brand)]' : 'text-[var(--faint)]'].join(' ')}>
                {index}
              </span>
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}

      {subscriptionStatus !== 'active' && (
        <div className={collapsed ? 'flex justify-center px-2 pb-2' : 'px-2 pb-2'}>
          <button
            type="button"
            onClick={() => setShowPaywall(true)}
            title={collapsed ? 'Upgrade to Pro' : undefined}
            className={[
              'flex items-center justify-center gap-1.5 rounded-lg bg-[var(--brand)] text-white text-xs font-bold py-2 hover:brightness-[1.08] transition-all',
              collapsed ? 'w-8 h-8 shrink-0' : 'w-full',
            ].join(' ')}
          >
            {collapsed ? '⚡' : '⚡ Upgrade to Pro'}
          </button>
        </div>
      )}

      <div className="border-t border-[var(--hair)]">
        <div className={['p-3 flex items-center gap-2.5', collapsed ? 'justify-center' : ''].join(' ')}>
          <UserButton />
          {!collapsed && (
            // Already Pro → go manage/cancel on the real billing page, not a
            // "go unlimited" pitch for something they already have.
            subscriptionStatus === 'active' ? (
              <Link
                href="/dashboard/billing"
                className="text-[10px] uppercase tracking-wide rounded-md text-[var(--mute)] hover:text-[var(--brand)] hover:border-[var(--brand)] border border-[var(--hair)] px-1.5 py-0.5 transition-colors"
              >
                {PLAN_BADGE[subscriptionStatus]}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowPaywall(true)}
                className="text-[10px] uppercase tracking-wide rounded-md text-[var(--mute)] hover:text-[var(--brand)] hover:border-[var(--brand)] border border-[var(--hair)] px-1.5 py-0.5 transition-colors"
              >
                {PLAN_BADGE[subscriptionStatus]}
              </button>
            )
          )}
        </div>
        <div className={['px-2 pb-2 space-y-0.5', collapsed ? 'flex flex-col items-center' : ''].join(' ')}>
          <button
            type="button"
            onClick={() => setShowSupport(true)}
            title={collapsed ? 'Contact support' : undefined}
            className={[
              'flex items-center gap-2.5 px-2 py-2 text-xs tracking-wide text-[var(--mute)] hover:text-[var(--brand)] transition-colors',
              collapsed ? 'justify-center' : 'w-full',
            ].join(' ')}
          >
            <LifeBuoy className="w-[15px] h-[15px] shrink-0" />
            {!collapsed && 'Contact support'}
          </button>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              title={collapsed ? 'Log out' : undefined}
              className={[
                'flex items-center gap-2.5 px-2 py-2 text-xs tracking-wide text-[var(--mute)] hover:text-[var(--brand)] transition-colors',
                collapsed ? 'justify-center' : 'w-full',
              ].join(' ')}
            >
              <LogOut className="w-[15px] h-[15px] shrink-0" />
              {!collapsed && 'Log out'}
            </button>
          </SignOutButton>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 pt-1">
              <Link href="/terms" className="text-[10px] text-[var(--mute)] hover:text-[var(--brand)] transition-colors">Terms</Link>
              <span className="text-[10px] text-[var(--faint)]">·</span>
              <Link href="/privacy" className="text-[10px] text-[var(--mute)] hover:text-[var(--brand)] transition-colors">Privacy</Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
