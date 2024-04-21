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
        protocol: process.env.REMOTE_PROTOCOL,
        hostname: process.env,
        pathname: process.env.REMOTE_PATH
      }
    ],
  },
}

module.exports = nextConfig
