import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
}

export default nextConfig
