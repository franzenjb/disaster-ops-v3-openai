/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Uncomment for production/GitHub Pages deployment:
  // output: 'export',
  // basePath: '/disaster-ops-v3',
  // assetPrefix: '/disaster-ops-v3/',
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
}

module.exports = nextConfig