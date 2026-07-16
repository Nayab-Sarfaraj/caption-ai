'use client'

import { useEffect } from 'react'

// Native browser scroll-to-#hash-on-load doesn't reliably survive Next.js
// hydration timing (it can fire before the client bundle finishes mounting,
// landing on the wrong position with nothing to correct it after). Runs
// once after mount and does it explicitly instead of hoping the browser gets
// there first.
export function ScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return
    const el = document.querySelector(window.location.hash)
    el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
  }, [])

  return null
}
