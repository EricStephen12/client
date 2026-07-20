import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: "EIXORA — AI Ad Intelligence for Creators | Decode Viral TikTok Ads",
  description: "Reverse-engineer any viral TikTok ad. Extract hooks, pacing, and conversion triggers with AI-powered DNA analysis. Built for creators and e-commerce teams who scale.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "EIXORA — Decode Viral Ads with AI",
    description: "Paste any TikTok or Reels URL. Get the full psychological DNA — hook, pacing, triggers — in 60 seconds. Start free.",
    url: "https://www.eixora.store",
    siteName: "Eixora",
    images: [
      {
        url: "https://www.eixora.store/hero.png",
        width: 1200,
        height: 630,
        alt: "Eixora — AI Ad Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EIXORA — Decode Viral Ads with AI",
    description: "Paste any TikTok or Reels URL. Get the full psychological DNA in 60 seconds.",
    images: ["https://www.eixora.store/hero.png"],
  },
  metadataBase: new URL("https://www.eixora.store"),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased text-slate-900 bg-[#FAFAF9]">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
