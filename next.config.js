/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Temporarily ignore ESLint during builds due to circular structure bug in Next.js 14.2.33
    // This doesn't affect code quality - you can still run `npm run lint` separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ensure TypeScript errors are still caught
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

