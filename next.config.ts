import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
  // PostHog reverse proxy — routes client-side analytics through our own
  // domain instead of i.posthog.com directly. Ad-blockers (Brave shields,
  // uBlock, etc.) pattern-match known analytics domains, not our own paths,
  // so this is what actually gets events through for users running one.
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  skipTrailingSlashRedirect: true,
}

export default nextConfig
