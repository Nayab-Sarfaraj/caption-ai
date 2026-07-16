'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

// Links frontend event capture (autocaptured pageviews, custom events) to
// the same person as backend captures — both key off this same distinct ID
// (clerkId), see src/lib/posthog.ts.
export function PostHogIdentify({ userId, email }: { userId: string; email: string }) {
  useEffect(() => {
    posthog.identify(userId, { email })
  }, [userId, email])

  return null
}
