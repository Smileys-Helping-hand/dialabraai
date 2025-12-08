/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  // Enable compression
  compress: true,
  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,
  // Optionally enable PWA features
  ...(process.env.NEXT_PUBLIC_PWA_ENABLED === 'true' && {
    experimental: {
      optimizeCss: true,
    },
  }),
};

module.exports = nextConfig;
