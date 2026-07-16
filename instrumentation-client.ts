import posthog from 'posthog-js'

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Routed through next.config.ts rewrites (/ingest/*), not i.posthog.com
    // directly — ad-blockers (Brave shields, uBlock, etc.) pattern-match
    // known analytics domains, this keeps requests on our own origin so
    // they get through. ui_host stays the real PostHog domain since that's
    // only used for links back to the dashboard, not data collection.
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-06-25',
  })
}
