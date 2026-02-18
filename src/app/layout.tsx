import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PaddleLoader from "@/components/PaddleLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Socially | Viral Scripts for Dropshippers",
  description: "Generate winning TikTok ad scripts and social content in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-slate-900 bg-[#FAFAF9]`}>
        {children}
        <PaddleLoader />
      </body>
    </html>
  );
}
