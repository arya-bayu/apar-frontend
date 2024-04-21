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
        hostname: 'api.tisain.id',
        pathname: '/storage/**'
      }
    ],
  },
}

module.exports = nextConfig
