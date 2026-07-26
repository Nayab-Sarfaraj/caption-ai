import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.getinstacap.com',
          },
        ],
        destination: 'https://getinstacap.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
