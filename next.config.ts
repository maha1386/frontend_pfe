import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
  // ✅ Ajouter ces lignes
  experimental: {
    proxyTimeout: 1500000,  // 25 minutes en ms
  },
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;