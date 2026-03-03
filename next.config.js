/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ensure proper routing
  async rewrites() {
    return []
  },
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Optimize for production
  compress: true,
  
  // Handle API routes properly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

module.exports = nextConfig