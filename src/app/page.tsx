'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import CursorEffect from '@/components/CursorEffect';
import MagneticButton from '@/components/MagneticButton';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const handleDirectAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    router.push(`/dashboard/analyze?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-gray-900 selection:bg-purple-600 selection:text-white overflow-x-hidden">
      <CursorEffect />

      {/* Navigation - Minimalist & Bordered */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-purple-200 transition-all duration-300">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tighter hover:opacity-70 transition-opacity">
            Socially.
          </Link>
          <div className="flex items-center gap-12">
            <Link href="/login" className="hidden md:block text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1">
              Sign In
            </Link>
            <Link href={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:from-purple-700 hover:to-blue-700 border-0 transition-all shadow-lg hover:shadow-xl">
              {isLoggedIn ? "Enter Studio" : "Join List"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Refined Editorial */}
      <section className="pt-20 min-h-[90vh] grid md:grid-cols-2 border-b border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">

        {/* Left: Clear Value Prop */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 border-r border-purple-200">
          <RevealOnScroll delay={100}>
            <span className="text-xs font-medium tracking-[0.3em] uppercase mb-8 text-purple-600">AI Ad Creative Engineering</span>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.95] mb-8 tracking-tight text-balance">
              Stop <br />
              <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Guessing.</span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <p className="text-xl font-light leading-relaxed max-w-md mb-12 text-gray-700">
              Weaponize the math of winning creative. We deconstruct the retention DNA of viral TikToks so you can scale what works.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <form onSubmit={handleDirectAnalyze} className="max-w-md mb-12 flex flex-col gap-4">
              <div className="relative group p-2 bg-white rounded-2xl border border-purple-100 shadow-xl focus-within:ring-2 focus-within:ring-purple-600/20 transition-all">
                <input
                  type="text"
                  placeholder="Paste TikTok URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-2"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Scan Reference
                </button>
                <MagneticButton href={isLoggedIn ? "/dashboard/analyze" : "/signup"} variant="secondary">
                  {isLoggedIn ? "View Portfolio" : "Start Free Trial"}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </MagneticButton>
              </div>
            </form>
          </RevealOnScroll>
        </div>

        {/* Right: Single Focal Image */}
        <div className="relative h-[50vh] md:h-auto overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
          <Image
            src="/hero-person.jpg"
            alt="Professional workspace"
            fill
            className="object-cover transition-all duration-1000 ease-out scale-105 hover:scale-100"
            priority
          />
          <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end text-white pointer-events-none drop-shadow-lg">
            <RevealOnScroll delay={500}>
              <div>
                <p className="font-serif text-3xl italic">Volume 01</p>
                <p className="text-xs tracking-[0.2em] uppercase opacity-80">Viral Ad Collection</p>
              </div>
            </RevealOnScroll>
            <div className="w-16 h-16 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest animate-spin-slow">View</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee - "Ticker" */}
      <section className="py-4 border-b border-purple-200 overflow-hidden whitespace-nowrap bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="inline-block animate-marquee">
          <span className="text-4xl font-serif italic mx-8 uppercase">Intelligence</span>
          <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
          <span className="text-4xl font-serif italic mx-8 uppercase">Psychology</span>
          <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
          <span className="text-4xl font-serif italic mx-8 uppercase">Conversion</span>
          <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
          <span className="text-4xl font-serif italic mx-8 uppercase">Retention</span>
          <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
        </div>
      </section>

      {/* The Manifesto / How It Works */}
      <section className="grid lg:grid-cols-2 border-b border-purple-200">
        <div className="p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-purple-200 flex items-center bg-gradient-to-br from-purple-50 to-transparent">
          <RevealOnScroll>
            <h2 className="text-6xl md:text-8xl font-serif leading-none tracking-tight">
              SCIENTIFIC <br />
              <span className="text-transparent stroke-text">CREATIVE.</span>
            </h2>
          </RevealOnScroll>
        </div>
        <div className="p-12 lg:p-24 flex flex-col justify-center">
          <RevealOnScroll delay={200}>
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-12 max-w-md">
              ROAS is a choice. We deconstruct the viral math of winning ads so you can scale with certainty.
            </p>
          </RevealOnScroll>

          <ul className="space-y-6">
            {['Algorithmic Hook Arbitrage', 'High-Retention DNA Extraction', 'Psychological Trigger Mapping'].map((item, i) => (
              <RevealOnScroll key={i} delay={300 + (i * 100)}>
                <li className="flex items-center gap-6 group cursor-pointer">
                  <span className="text-xs font-mono border-2 border-purple-600 w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:text-white transition-all">{i + 1}</span>
                  <span className="text-xl font-serif italic decoration-1 underline-offset-4 group-hover:underline">{item}</span>
                </li>
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </section>

      {/* Process Section - NEW */}
      <section className="py-32 px-6 border-b border-purple-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-serif mb-6 italic">The Production Pipeline</h2>
            <p className="text-xs tracking-[0.4em] uppercase text-purple-600">From URL to Viral Asset in 60 Seconds</p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-purple-100 -z-10"></div>
            {[
              { step: "Deconstruct", desc: "Paste any winning URL. Isolate the hook rate, visual pacing, and Schwartz DNA." },
              { step: "Bridge", desc: "Map the competitor's 'Secret Sauce' onto your product's unique selling proposition." },
              { step: "Weaponize", desc: "Generate full-stack, boardroom-ready scripts designed for maximum ROAS." }
            ].map((p, i) => (
              <RevealOnScroll key={i} delay={i * 200} className="bg-white p-8 border border-purple-100 relative shadow-sm hover:shadow-xl transition-all">
                <span className="absolute -top-4 left-8 bg-purple-600 text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest">{i + 1}</span>
                <h3 className="text-2xl font-serif mb-4 pt-4 italic">{p.step}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">{p.desc}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid - Brutalist */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-purple-200">
        {[
          { title: "Retention DNA", subtitle: "Math-Based Creative", img: "https://images.unsplash.com/photo-1596462502278-27bfdd403348" },
          { title: "Hook Engineering", subtitle: "Algorithmic Arbitrage", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113" },
        ].map((feature, i) => (
          <div key={i} className={`group border-b md:border-b-0 border-purple-200 ${i !== 1 ? 'md:border-r border-purple-200' : ''} h-[80vh] relative overflow-hidden`}>
            <Image
              src={feature.img}
              alt={feature.title}
              fill
              className="object-cover group-hover:scale-110 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-transparent transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t-2 border-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <RevealOnScroll>
                <span className="text-xs tracking-[0.2em] uppercase block mb-2">{feature.subtitle}</span>
                <h3 className="text-3xl font-serif">{feature.title}</h3>
              </RevealOnScroll>
            </div>
            <div className="absolute top-8 left-8 text-white drop-shadow-lg">
              <span className="text-xs font-mono border-2 border-white bg-purple-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">0{i + 1}</span>
            </div>
          </div>
        ))}
      </section>

      {/* The Math - Editorial Table Style */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll className="text-center mb-24">
            <h2 className="text-5xl font-serif mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent italic">The Retention Engine</h2>
            <p className="text-xs tracking-[0.3em] uppercase text-purple-600">Engineered for Human Attention</p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="border-2 border-purple-600 rounded-lg overflow-hidden shadow-xl">
              {[
                { l: "Input", r: "Any High-Performing Competitor Video" },
                { l: "Process", r: "Neural Analysis of 50+ Hook Variations" },
                { l: "Output", r: "Psychology Breakdown + Replica Script" },
                { l: "Conversion", r: "Engineered to Stop the Scroll" }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-2 border-b border-purple-200 last:border-b-0 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300 group">
                  <div className="p-8 border-r border-purple-200 font-serif text-xl italic">{row.l}</div>
                  <div className="p-8 text-sm uppercase tracking-widest flex items-center">{row.r}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer - Massive */}
      <footer className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pt-32 pb-12 px-6 border-t-4 border-purple-600">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-32">
            <div>
              <RevealOnScroll>
                <h2 className="text-[10vw] leading-[0.8] font-serif tracking-tighter opacity-20">
                  GENERATE.
                </h2>
              </RevealOnScroll>
            </div>

            <div className="space-y-6">
              <RevealOnScroll delay={200}>
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-6 text-purple-400">Direct Contact</h3>
                <div className="space-y-4 text-sm font-light opacity-80">
                  <p className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold">P:</span> +1-555-555-5555
                  </p>
                  <a href="https://wa.me/15555555555" target="_blank" className="flex items-center gap-3 hover:text-green-400 transition-colors">
                    <span className="text-green-400 font-bold">W:</span> WhatsApp Support
                  </a>
                  <p className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold">A:</span> 123 Main St, Anytown, USA
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            <div className="flex flex-col justify-end items-start md:items-end">
              <RevealOnScroll delay={300} className="w-full text-left md:text-right">
                <Link href="/signup" className="text-4xl md:text-6xl font-serif hover:italic transition-all underline decoration-1 underline-offset-8 mb-8 inline-block">
                  Launch Engine &rarr;
                </Link>
                <p className="text-sm opacity-50 max-w-md ml-auto">
                  Join the elite agents using Socially to dominate the attention economy. <br />
                  Limited access. Professional grade.
                </p>
              </RevealOnScroll>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/20">
            <p className="text-xs tracking-[0.2em] uppercase opacity-50">&copy; 2026 EXRICX. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="#" className="text-xs tracking-[0.2em] uppercase hover:underline">Instagram</Link>
              <Link href="#" className="text-xs tracking-[0.2em] uppercase hover:underline">Twitter</Link>
              <Link href="#" className="text-xs tracking-[0.2em] uppercase hover:underline">TikTok</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
