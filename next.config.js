/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Research-Compass-for-Robotics',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
