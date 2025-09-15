/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Vercel
  output: 'standalone',
  // Configure webpack for better compatibility
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'react/jsx-runtime.js',
        'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime.js',
      })
    }
    return config
  },
};

module.exports = nextConfig;