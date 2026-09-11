'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/nextjs'

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((m) => m.UserButton),
  { ssr: false }
)

export function LazyUserButton() {
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  const shouldOpenOnClickRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleInteraction = useCallback(() => {
    if (!mounted) {
      setMounted(true)
    }
  }, [mounted])

  const handleClick = useCallback(() => {
    if (!mounted) {
      shouldOpenOnClickRef.current = true
      setMounted(true)
    }
  }, [mounted])

  // When mounted via direct click/tap, programmatically click Clerk's trigger button once it renders
  useEffect(() => {
    if (mounted && shouldOpenOnClickRef.current && containerRef.current) {
      shouldOpenOnClickRef.current = false
      const timer = setTimeout(() => {
        const btn = containerRef.current?.querySelector('button')
        btn?.click()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [mounted])

  const avatarUrl = user?.imageUrl
  const initials = user?.firstName ? user.firstName[0].toUpperCase() : 'U'

  if (mounted) {
    return (
      <div ref={containerRef} className="shrink-0 flex items-center">
        <UserButton />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleInteraction}
      onTouchStart={handleInteraction}
      onFocus={handleInteraction}
      onClick={handleClick}
      className="w-7 h-7 rounded-full overflow-hidden border border-[var(--hair)] bg-[var(--panel-2)] flex items-center justify-center shrink-0 cursor-pointer select-none transition-opacity hover:opacity-90"
      title={user?.fullName || 'User account'}
      aria-label="User account"
      tabIndex={0}
      role="button"
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
