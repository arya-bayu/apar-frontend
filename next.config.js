/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [''],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**'
      },
      {
        protocol: 'https',
        hostname: 'apar-backend-morning-surf-2097.fly.dev',
        pathname: '/storage/**'
      }
    ],
  },
}

module.exports = nextConfig
