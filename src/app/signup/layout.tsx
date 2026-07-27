import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free — Start Decoding Viral Ads',
  description:
    'Create your free Eixora account. Get 3 free scans. Analyze any TikTok, Reels, or Shorts ad with AI and extract the hook, pacing, and conversion triggers in 60 seconds.',
  alternates: {
    canonical: '/signup',
  },
  openGraph: {
    title: 'Sign Up Free — Eixora Ad Intelligence',
    description: 'Get 3 free scans. No credit card required. Decode viral ads with AI in 60 seconds.',
    url: 'https://eixora.store/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
