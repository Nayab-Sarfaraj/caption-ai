'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutGrid } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Home' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/10 bg-[#111] flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <span className="text-sm font-semibold tracking-tight text-white">Captions</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <UserButton />
        <span className="text-xs text-zinc-500">Free plan</span>
      </div>
    </aside>
  )
}
