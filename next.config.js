/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Research-Compass-for-Robotics',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
