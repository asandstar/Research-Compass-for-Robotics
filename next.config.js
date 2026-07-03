/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 部署需要设置 basePath，仓库名为 <repo-name> 时
  // basePath: '/<repo-name>',
}

module.exports = nextConfig
