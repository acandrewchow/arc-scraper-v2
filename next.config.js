/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize for Vercel deployment
  output: 'standalone',
}

module.exports = nextConfig
