import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.bunjang.co.kr' },
      { protocol: 'https', hostname: 'img2.joongna.com' },
      { protocol: 'https', hostname: 'dnvefa72aowie.cloudfront.net' },
      { protocol: 'https', hostname: '*.daangn.com' },
      { protocol: 'https', hostname: '*.karroter.com' },
    ],
  },
}

export default nextConfig
