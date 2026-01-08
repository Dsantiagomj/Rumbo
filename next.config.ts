import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    // Turbopack for faster builds (stable in 16.0+)
    turbo: {},
  },
};

export default nextConfig;
