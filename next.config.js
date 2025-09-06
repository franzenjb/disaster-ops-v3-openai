/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use export and basePath for production GitHub Pages deployment
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    basePath: '/disaster-ops-v3',
    assetPrefix: '/disaster-ops-v3/',
  } : {}),
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
}

module.exports = nextConfig