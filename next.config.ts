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

  // ── Redirect www → bare domain (canonical enforcement) ─────────────────────
  // Vercel handles this at CDN level too — this is a belt-and-suspenders fallback.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.eixora.store' }],
        destination: 'https://eixora.store/:path*',
        permanent: true, // 301 — transfers all link equity to the bare domain
      },
    ];
  },

  // ── Security & SEO headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS for 1 year, include subdomains
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:file(.*\\.(?:ico|png|jpg|jpeg|svg|webm|webp|mp4|woff2?))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};

export default nextConfig;
