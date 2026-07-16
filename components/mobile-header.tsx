'use client'

import { useState } from 'react'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import type { SubscriptionStatus } from '@/src/models/User'
import { PaywallModal } from '@/components/paywall-modal'
import { NAV, PLAN_BADGE } from '@/src/helpers/dashboard-nav'

export function MobileHeader({ subscriptionStatus = 'none' }: { subscriptionStatus?: SubscriptionStatus }) {
  const pathname = usePathname()
  const [showPaywall, setShowPaywall] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-[#14120f1f] bg-white font-[family-name:var(--font-cc)]">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="w-7 h-7 flex items-center justify-center text-[#1a1917] shrink-0"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border-2 border-[#c1361f]" />
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]">Hypecap</span>
          </Link>
        </div>

        {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

        <div className="flex items-center gap-3">
          {subscriptionStatus === 'active' ? (
            <Link
              href="/dashboard/billing"
              className="text-[10px] uppercase tracking-wide text-[#a39e96] hover:text-[#c1361f] border border-[#14120f1f] px-1.5 py-0.5 transition-colors"
            >
              Pro plan
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="flex items-center gap-1 bg-[#c1361f] text-white text-xs font-bold px-2.5 py-1.5 hover:brightness-[1.08] transition-all"
            >
              ⚡ Upgrade
            </button>
          )}
          <UserButton />
        </div>
      </div>

      {/* Backdrop — always mounted so the drawer can animate in/out, not
          just appear/disappear. Pointer-events off when closed so it
          doesn't eat clicks behind an invisible layer. */}
      <div
        onClick={() => setMenuOpen(false)}
        className={[
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer — slides in from the left, matching the desktop Sidebar's position. */}
      <nav
        className={[
          'fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-[#14120f1f] flex flex-col transition-transform duration-200',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#14120f1f]">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]">Hypecap</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-7 h-7 flex items-center justify-center text-[#1a1917] shrink-0"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex-1 px-2 py-3">
          {NAV.map(({ href, index, label, exact }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={[
                  'flex items-center gap-2.5 px-2 py-2.5 text-xs tracking-wide border-l-2 transition-colors',
                  active
                    ? 'text-[#1a1917] border-[#c1361f] bg-[#c1361f08]'
                    : 'text-[#a39e96] border-transparent hover:text-[#1a1917]',
                ].join(' ')}
              >
                <span className={['text-[10px]', active ? 'text-[#c1361f]' : 'text-[#c7c2b8]'].join(' ')}>
                  {index}
                </span>
                {label}
              </Link>
            )
          })}
        </div>

        <div className="border-t border-[#14120f1f] px-2 py-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-[#a39e96] px-2">
            {PLAN_BADGE[subscriptionStatus]}
          </span>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-2 text-xs tracking-wide text-[#a39e96] hover:text-[#c1361f] transition-colors"
            >
              <LogOut className="w-[14px] h-[14px] shrink-0" />
              Log out
            </button>
          </SignOutButton>
        </div>
      </nav>
    </header>
  )
}
