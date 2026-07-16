'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function MobileHeader() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-[#14120f1f] bg-white font-[family-name:var(--font-cc)]">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full border-2 border-[#c1361f]" />
        <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]">Hypecap</span>
      </Link>
      <UserButton />
    </header>
  )
}
