'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import type { SubscriptionStatus } from '@/src/models/User'

const NAV = [
  { href: '/dashboard', index: '01', label: 'HOME', exact: true },
  { href: '/dashboard/jobs', index: '02', label: 'VIDEOS', exact: false },
  { href: '/dashboard/usage', index: '03', label: 'USAGE', exact: false },
  { href: '/dashboard/settings', index: '04', label: 'SETTINGS', exact: false },
  { href: '/dashboard/billing', index: '05', label: 'BILLING', exact: false },
]

const PLAN_BADGE: Record<SubscriptionStatus, string> = {
  active: 'Pro plan',
  halted: 'Payment failed',
  cancelled: 'Cancelled',
  none: 'Free plan',
}

export function Sidebar({ subscriptionStatus = 'none' }: { subscriptionStatus?: SubscriptionStatus }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={[
        'shrink-0 border-r border-[#14120f1f] bg-white flex flex-col h-full transition-[width] duration-150',
        collapsed ? 'w-[56px]' : 'w-[208px]',
      ].join(' ')}
    >
      <div className={['h-14 flex items-center border-b border-[#14120f1f]', collapsed ? 'justify-center px-0' : 'justify-between px-4'].join(' ')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="w-2 h-2 rounded-full border-2 border-[#c1361f]" />
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]">Captions</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="w-6 h-6 flex items-center justify-center text-[#a39e96] hover:text-[#1a1917] border border-transparent hover:border-[#14120f1f] transition-colors shrink-0"
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
                'flex items-center gap-2.5 px-2 py-2 text-xs tracking-wide border-l-2 transition-colors',
                collapsed ? 'justify-center' : '',
                active
                  ? 'text-[#1a1917] border-[#c1361f] bg-[#c1361f08]'
                  : 'text-[#a39e96] border-transparent hover:text-[#1a1917]',
              ].join(' ')}
            >
              <span className={['text-[10px]', active ? 'text-[#c1361f]' : 'text-[#c7c2b8]'].join(' ')}>
                {index}
              </span>
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {subscriptionStatus !== 'active' && (
        <div className={collapsed ? 'flex justify-center px-2 pb-2' : 'px-2 pb-2'}>
          <Link
            href="/dashboard/billing"
            title={collapsed ? 'Upgrade to Pro' : undefined}
            className={[
              'flex items-center justify-center gap-1.5 bg-[#c1361f] text-white text-xs font-bold py-2 hover:brightness-[1.08] transition-all',
              collapsed ? 'w-8 h-8 shrink-0' : 'w-full',
            ].join(' ')}
          >
            {collapsed ? '⚡' : '⚡ Upgrade to Pro'}
          </Link>
        </div>
      )}

      <div className="border-t border-[#14120f1f]">
        <div className={['p-3 flex items-center gap-2.5', collapsed ? 'justify-center' : ''].join(' ')}>
          <UserButton />
          {!collapsed && (
            <Link
              href="/dashboard/billing"
              className="text-[10px] uppercase tracking-wide text-[#a39e96] hover:text-[#c1361f] hover:border-[#c1361f] border border-[#14120f1f] px-1.5 py-0.5 transition-colors"
            >
              {PLAN_BADGE[subscriptionStatus]}
            </Link>
          )}
        </div>
        <div className={['px-2 pb-2', collapsed ? 'flex justify-center' : ''].join(' ')}>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              title={collapsed ? 'Log out' : undefined}
              className={[
                'flex items-center gap-2.5 px-2 py-2 text-xs tracking-wide text-[#a39e96] hover:text-[#c1361f] transition-colors',
                collapsed ? 'justify-center' : 'w-full',
              ].join(' ')}
            >
              <LogOut className="w-[15px] h-[15px] shrink-0" />
              {!collapsed && 'Log out'}
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  )
}
