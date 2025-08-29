/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development mode - remove static export settings
  // output: 'export', // Only for production build
  // trailingSlash: true, // Only for static export
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
