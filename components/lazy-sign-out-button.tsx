'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const SignOutButton = dynamic(
  () => import('@clerk/nextjs').then((m) => m.SignOutButton),
  { ssr: false }
)

export function LazySignOutButton({
  children,
  redirectUrl = '/sign-in',
}: {
  children: React.ReactNode
  redirectUrl?: string
}) {
  const [mounted, setMounted] = useState(false)
  const shouldClickRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleInteraction = useCallback(() => {
    if (!mounted) {
      setMounted(true)
    }
  }, [mounted])

  const handleClick = useCallback(() => {
    if (!mounted) {
      shouldClickRef.current = true
      setMounted(true)
    }
  }, [mounted])

  // When mounted via direct click/tap, programmatically click Clerk's sign out button once rendered
  useEffect(() => {
    if (mounted && shouldClickRef.current && containerRef.current) {
      shouldClickRef.current = false
      const timer = setTimeout(() => {
        const btn = containerRef.current?.querySelector('button')
        btn?.click()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [mounted])

  if (mounted) {
    return (
      <div ref={containerRef} className="w-full">
        <SignOutButton redirectUrl={redirectUrl}>
          {children}
        </SignOutButton>
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
      className="w-full"
    >
      {children}
    </div>
  )
}
