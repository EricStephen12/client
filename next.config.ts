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
    return [
      {
        source: '/api/main/:path*',
        destination: (process.env.BACKEND_URL || 'http://localhost:4000') + '/:path*',
      },
    ];
  },
};

export default nextConfig;
