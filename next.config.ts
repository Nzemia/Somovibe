import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use 'standalone' output only for Docker/self-hosted builds, not on Vercel
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
