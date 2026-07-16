import { PostHog } from 'posthog-node'

declare global {
  var _posthog: PostHog | null | undefined
}

// null (not just unset) once we've confirmed no key is configured, so we
// don't re-check env on every call — analytics is optional, never a hard
// dependency the app can't run without.
export function getPostHog(): PostHog | null {
  if (global._posthog !== undefined) return global._posthog

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) {
    global._posthog = null
    return null
  }

  // This is a persistent Next.js server (pm2), not serverless — unlike
  // Vercel-style short-lived functions, we don't need flushAt:1/shutdown()
  // per call. One long-lived client batches normally.
  global._posthog = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  })

  return global._posthog
}
