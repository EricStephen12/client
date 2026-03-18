import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "EIXORA — AI Ad Intelligence for Dropshippers | Decode Viral TikTok Ads",
  description: "Reverse-engineer any viral TikTok ad. Extract hooks, pacing, and conversion triggers with AI-powered DNA analysis. Built for e-commerce sellers who scale.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 bg-[#FAFAF9]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
