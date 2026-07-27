import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/signup', '/login', '/privacy', '/terms', '/refund'],
        disallow: ['/dashboard/', '/admin/', '/api/'],
      },
      // Block AI scrapers from training on content
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://eixora.store/sitemap.xml',
    host: 'https://eixora.store',
  };
}
