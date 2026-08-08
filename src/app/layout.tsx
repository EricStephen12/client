import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerkAppearance';
import { Providers } from '@/components/Providers';
import localFont from 'next/font/local';

const singsong = localFont({
  src: '../../public/fonts/Singsong.otf',
  variable: '--font-singsong',
  display: 'swap',
});

const BASE_URL = 'https://eixora.store';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Eixora — AI Ad Intelligence | Decode Viral TikTok & Reels Ads',
    template: '%s | Eixora',
  },
  description:
    'Eixora reverse-engineers any viral TikTok, Instagram Reels, or YouTube Shorts ad. Extract hooks, pacing, psychological triggers, and conversion DNA in 60 seconds. Free to start.',

  // ── Keywords ───────────────────────────────────────────────────────────────
  keywords: [
    // Core product
    'AI ad intelligence',
    'viral ad analyzer',
    'TikTok ad analysis',
    'Instagram Reels ad decoder',
    'YouTube Shorts ad intelligence',
    'reverse engineer viral ads',
    'ad DNA analysis',
    'hook analysis tool',
    'ad hook generator',
    'video ad analyzer',

    // Use cases
    'TikTok dropshipping ads',
    'ecommerce ad strategy',
    'creative strategy tool',
    'ad spy tool',
    'viral content decoder',
    'ad hook breakdown',
    'conversion trigger analysis',
    'short form video analysis',
    'content intelligence platform',
    'social media ad tool',

    // Audience
    'dropshipping tool',
    'ecommerce creator tool',
    'UGC ad tool',
    'TikTok shop ads',
    'performance marketer tool',
    'media buyer tool',
    'creative director AI',
    'AI for marketers',
    'AI video analysis',
    'ad creative analysis tool',

    // Competitors / alternatives
    'AdSpy alternative',
    'Minea alternative',
    'Foreplay alternative',
    'viral video analysis',
    'product research tool',
  ],

  // ── Canonical & alternates ─────────────────────────────────────────────────
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    title: 'Eixora — Decode Viral Ads with AI in 60 Seconds',
    description:
      'Paste any TikTok, Reels, or Shorts URL. Get the full psychological DNA — hook, pacing, triggers — in 60 seconds. Free to start. Built for creators and e-commerce teams.',
    url: BASE_URL,
    siteName: 'Eixora',
    images: [
      {
        url: `${BASE_URL}/hero.png`,
        width: 1200,
        height: 630,
        alt: 'Eixora — AI Ad Intelligence Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@eixorastore',
    creator: '@eixorastore',
    title: 'Eixora — Decode Viral Ads with AI',
    description:
      'Paste any TikTok or Reels URL. Get the full psychological DNA in 60 seconds. Free to start.',
    images: [`${BASE_URL}/hero.png`],
  },

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
    other: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icon.png' },
    ],
  },

  // ── Verification ───────────────────────────────────────────────────────────
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
    // bing is handled via BingSiteAuth.xml in /public already
  },

  // ── Crawler instructions ───────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── App specific ───────────────────────────────────────────────────────────
  applicationName: 'Eixora',
  authors: [{ name: 'Eixora', url: BASE_URL }],
  creator: 'Eixora by EXRICX',
  publisher: 'Eixora',
  category: 'Marketing Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // SoftwareApplication schema
      {
        '@type': 'SoftwareApplication',
        name: 'Eixora',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        url: `${BASE_URL}`,
        description:
          'AI-powered ad intelligence platform that reverse-engineers viral TikTok, Instagram Reels, and YouTube Shorts ads. Extract hooks, pacing, and psychological triggers in 60 seconds.',
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'USD',
            description: '3 scans per month',
          },
          {
            '@type': 'Offer',
            name: 'Creator',
            price: '5',
            priceCurrency: 'USD',
            description: '30 scans per month',
          },
          {
            '@type': 'Offer',
            name: 'The Studio',
            price: '10',
            priceCurrency: 'USD',
            description: '250 scans per month',
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '127',
        },
      },
      // Organization schema
      {
        '@type': 'Organization',
        name: 'Eixora',
        url: `${BASE_URL}`,
        logo: `${BASE_URL}/icon.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@eixora.store',
          contactType: 'customer support',
        },
        sameAs: [],
      },
      // WebSite schema with SearchAction for sitelinks searchbox
      {
        '@type': 'WebSite',
        name: 'Eixora',
        url: `${BASE_URL}`,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/signup?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      // FAQ schema for Google FAQ rich results
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does Eixora work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste any viral TikTok, Reels, or YouTube Shorts URL into Eixora. Our AI extracts the hook, pacing, and psychological triggers — then generates a full Strategy Brief in 60 seconds.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which platforms does Eixora support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Eixora fully supports TikTok, Instagram Reels, YouTube Shorts, and Facebook video ads.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Eixora free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Eixora has a free plan with 3 scans per month. Paid plans start at $5/month for 30 scans.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is TikTok ad DNA analysis?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ad DNA analysis deconstructs a video ad into its psychological components — the opening hook, pacing, emotional triggers, and call-to-action structure — so you can replicate what makes it convert.',
            },
          },
        ],
      },
    ],
  };

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${singsong.variable}`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="font-sans antialiased text-slate-900 bg-[#FAFAF9]">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
