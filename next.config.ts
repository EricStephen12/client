import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
    return [
      {
        source: '/api/main/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
