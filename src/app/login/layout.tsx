import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In — Eixora',
  description: 'Log in to your Eixora account and continue decoding viral ads with AI.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false, // Login page doesn't need to rank
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
