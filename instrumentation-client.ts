import posthog from 'posthog-js'

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Direct, not proxied through /ingest — the reverse proxy traded
    // ad-blocker resilience for a real, recurring failure mode: it made the
    // VM's own outbound reachability to PostHog a server-side dependency,
    // and it wasn't reliable. Simpler and more robust to just eat the
    // ad-blocker loss than have analytics 500 through your own server logs.
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    defaults: '2026-06-25',
  })
}
