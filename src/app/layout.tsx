import type { Metadata } from "next";
import "./globals.css";
import PaddleLoader from "@/components/PaddleLoader";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Viral TikTok Ad Scripts for Dropshippers | EIXORA",
  description: "Generate winning TikTok ad scripts and social content in seconds.",
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
        <PaddleLoader />
      </body>
    </html>
  );
}
