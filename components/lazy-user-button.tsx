'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/nextjs'

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((m) => m.UserButton),
  { ssr: false }
)

export function LazyUserButton() {
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Defer mounting until browser idle time, or immediately on user hover/touch/click
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
        () => setMounted(true),
        { timeout: 3500 }
      )
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle)
        }
      }
    } else {
      const timer = setTimeout(() => setMounted(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (mounted) {
    return <UserButton />
  }

  const avatarUrl = user?.imageUrl
  const initials = user?.firstName ? user.firstName[0].toUpperCase() : 'U'

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setMounted(true)}
      onTouchStart={() => setMounted(true)}
      onClick={() => setMounted(true)}
      className="w-7 h-7 rounded-full overflow-hidden border border-[var(--hair)] bg-[var(--panel-2)] flex items-center justify-center shrink-0 cursor-pointer select-none"
      title={user?.fullName || 'User account'}
      aria-label="User account"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.fullName || 'User avatar'}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="text-[11px] font-bold text-[var(--ink-dim)]">
          {initials}
        </span>
      )}
    </div>
  )
}
