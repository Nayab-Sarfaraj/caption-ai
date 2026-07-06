'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function MobileHeader() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-[#111]">
      <Link href="/dashboard" className="text-sm font-semibold text-white">
        Captions
      </Link>
      <UserButton />
    </header>
  )
}
