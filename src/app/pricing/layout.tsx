import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Free, Creator & Studio Plans',
  description:
    'Eixora pricing starts free. 3 scans/month at $0, 30 scans at $9/mo (Creator), or 100 scans at $15/mo (Studio). Cancel anytime. No contracts.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Eixora Pricing — Start Free, Scale Anytime',
    description:
      'Plans from $0 to $15/month. Analyze TikTok, Reels, and Shorts ads with AI. No contracts, cancel anytime.',
    url: 'https://eixora.store/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
