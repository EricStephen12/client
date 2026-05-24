'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import CursorEffect from '@/components/CursorEffect';
import MagneticButton from '@/components/MagneticButton';
import RevealOnScroll from '@/components/RevealOnScroll';
import VideoCarousel from '@/components/VideoCarousel';
import FloatingHearts from '@/components/FloatingHearts';
import BlueprintPreview from '@/components/BlueprintPreview';

export default function LandingPage() {
    const [url, setUrl] = useState('');
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const isLoggedIn = isLoaded && !!user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleDirectAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        if (!isLoggedIn) {
            router.push(`/signup?redirect=/dashboard/analyze&url=${encodeURIComponent(url)}`);
            return;
        }
        router.push(`/dashboard/analyze?url=${encodeURIComponent(url)}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-gray-900 selection:bg-purple-600 selection:text-white overflow-x-hidden">
            <CursorEffect />

<nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-purple-100 transition-all duration-300">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-3xl md:text-4xl font-signature hover:opacity-70 transition-opacity">
                        Eixora.
                    </Link>

<div className="hidden md:flex items-center gap-12">
                        <Link href="/pricing" className="text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Pricing
                        </Link>
                        <Link href="/login" className="text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Sign In
                        </Link>
                        <Link href={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:from-purple-700 hover:to-blue-700 border-0 transition-all shadow-lg hover:shadow-xl">
                            {isLoggedIn ? "Enter Studio" : "Get Started"}
                        </Link>
                    </div>

<button
                        className="md:hidden text-gray-900 p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>

{isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-purple-100 animate-slide-down">
                        <div className="flex flex-col p-8 gap-6 text-center">
                            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500">Pricing</Link>
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500">Sign In</Link>
                            <Link
                                href={isLoggedIn ? "/dashboard/analyze" : "/signup"}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 text-[10px] font-black tracking-[0.4em] uppercase rounded-xl"
                            >
                                {isLoggedIn ? "Enter Studio" : "Get Started"}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

<section className="pt-20 min-h-[85vh] flex flex-col md:grid md:grid-cols-2 border-b border-purple-200 overflow-hidden">
                <div className="flex flex-col justify-center px-5 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-24 border-b md:border-b-0 md:border-r border-purple-200 bg-white">
                    <RevealOnScroll delay={100}>
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase mb-4 md:mb-6 text-purple-500 block">Your Creative Intelligence</span>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[1.1] mb-6 md:mb-8 tracking-tight">
                            Find your <br className="hidden sm:block" />
                            <span className="italic bg-gradient-to-r from-purple-600 via-rose-500 to-purple-500 bg-clip-text text-transparent underline decoration-purple-200 decoration-4 underline-offset-8">Creative Flow.</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <p className="text-base sm:text-lg font-light leading-relaxed max-w-sm mb-8 md:mb-10 text-gray-500">
                            Stop the endless cycle of guessing. Eixora helps you see the viral logic behind every winner, giving you the clarity to shoot with total confidence.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <form onSubmit={handleDirectAnalyze} className="max-w-md flex flex-col gap-4">
                            <div className="relative group p-1 bg-gray-50 rounded-xl border border-purple-100 focus-within:ring-2 focus-within:ring-purple-600/10 transition-all">
                                <input
                                    type="text"
                                    placeholder="Paste TikTok, Instagram Reels, or YouTube Shorts URL..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-3"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg active:scale-95"
                            >
                                Extract Blueprint &rarr;
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>

<div className="relative h-[50vh] sm:h-[70vh] md:h-auto overflow-hidden bg-black flex items-center justify-center">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        poster="/demo-recording.webp"
                    >
                        <source src="/hero-video.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
            </section>



<VideoCarousel />

<BlueprintPreview />

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-white relative overflow-hidden group border border-purple-500/20 shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 font-sans font-bold text-[20vw] sm:text-[12vw] pointer-events-none text-purple-200">ENGINE</div>
                        <div className="max-w-3xl relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400 mb-8 block">Our Vision</span>
                            <h2 className="text-3xl sm:text-4xl md:text-7xl font-sans font-bold leading-tight tracking-tight mb-8 sm:mb-12">
                                Scale with <br />
                                <span className="italic text-purple-200/60 font-serif">Total Peace.</span>
                            </h2>
                            <p className="text-base sm:text-xl md:text-2xl font-light leading-relaxed text-white/80 mb-10 sm:mb-16">
                                We believe creative work should be rewarding, not exhausting. Eixora handles the heavy lifting of analysis so you can stay in your zone of genius—creating content that connects.
                            </p>
                            <div className="flex flex-wrap gap-8 sm:gap-12 border-t border-white/10 pt-8 sm:pt-12">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500/40 mb-2">Focus On</p>
                                    <p className="text-lg font-serif italic text-white">Creative Strategy</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500/40 mb-2">Leave Us The</p>
                                    <p className="text-lg font-serif italic text-white">Technical Blueprinting</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16 md:mb-24">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 mb-4 sm:mb-6">Built for High-Growth Teams.</h2>
                        <p className="text-base sm:text-lg text-slate-500 font-light px-2">The Eixora Protocol: From discovery to production in 60 seconds.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { step: "01", title: "Extract Viral DNA", desc: "Paste any viral TikTok or Reels URL. Our engine deconstructs the hook, pacing, and visual triggers that drive the hold rate." },
                            { step: "02", title: "Map Technical Brief", desc: "We convert visual data into a structured production blueprint. Direct shooting instructions, script variations, and audio cues." },
                            { step: "03", title: "Scale with Logic", desc: "Hand the brief to your creators. Stop guessing what will work and start filming ads backed by psychological data." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                                <span className="text-5xl font-sans font-bold text-slate-100 group-hover:text-purple-100 transition-colors block mb-8">{item.step}</span>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto border-t border-slate-100 pt-16 sm:pt-24 md:pt-32">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 sm:gap-16 md:gap-20">
                        <div className="lg:col-span-5">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 mb-6 sm:mb-8">Performance Driven.</h2>
                            <p className="text-lg text-slate-500 font-light leading-relaxed mb-12">
                                Eixora isn't just a tool; it's a member of your creative team. We analyze millions in ad spend daily to keep our "Director's Logic" ahead of the market.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">✓</div>
                                    <p className="text-slate-700 font-medium tracking-tight">Enterprise-Grade Security</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">✓</div>
                                    <p className="text-slate-700 font-medium tracking-tight">Dedicated Support for Agencies</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                <div className="bg-slate-50 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100">
                                    <p className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 mb-2 sm:mb-4">42%</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Average Hook Rate Increase</p>
                                </div>
                                <div className="bg-slate-50 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100">
                                    <p className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 mb-2 sm:mb-4">12x</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Faster Brief Turnaround</p>
                                </div>
                                <div className="bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] text-white sm:col-span-2">
                                    <p className="text-xl font-serif italic mb-6">"Eixora has completely changed our creative workflow. We no longer wait days for scripts—we get them in 60 seconds."</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest">Rawlins Stephen</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Founder, AsrdollarBeatz</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#F8FAFC]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16 md:mb-24">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">Questions & Answers.</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "What is the Eixora Protocol?", a: "The Eixora Protocol is our proprietary AI deconstruction method that extracts technical shooting data from viral social ads." },
                            { q: "Do I need technical skills?", a: "No. Our technical briefs are written for creators and editors of all levels. If you can read, you can shoot." },
                            { q: "Which platforms are supported?", a: "We are optimized for TikTok and Reels, with YouTube Shorts and Meta support currently in beta." },
                            { q: "Can I cancel anytime?", a: "Yes. Our monthly plans are contract-free. Scale up or down as your production needs change." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-blue-400 transition-all duration-300">
                                <summary className="flex items-center justify-between p-5 sm:p-8 md:p-10 cursor-pointer list-none">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pr-4">{faq.q}</h3>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                </summary>
                                <div className="px-5 sm:px-8 md:px-10 pb-5 sm:pb-8 md:pb-10 text-sm sm:text-base text-slate-500 font-light leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

<footer className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white pt-16 sm:pt-24 md:pt-32 pb-12 px-4 sm:px-6 border-t border-purple-500/20">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-12 sm:gap-16 md:gap-32 mb-16 sm:mb-20 md:mb-32">
                        <div>
                            <RevealOnScroll>
                                <h2 className="text-[20vw] md:text-[8vw] leading-[0.8] font-serif tracking-tighter opacity-10 text-purple-500">
                                    FLOW.
                                </h2>
                            </RevealOnScroll>
                        </div>

                        <div className="space-y-12">
                            <RevealOnScroll delay={200}>
                                <div>
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 text-purple-500/60">The Lounge</h3>
                                    <div className="flex flex-col gap-6 text-sm font-light opacity-60">
                                        <Link href="/pricing" className="hover:text-purple-500 transition-colors">Pricing</Link>
                                        <Link href="/privacy" className="hover:text-purple-500 transition-colors">Privacy</Link>
                                        <Link href="/terms" className="hover:text-purple-500 transition-colors">Terms</Link>
                                    </div>
                                </div>
                                <div className="mt-16">
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 text-purple-500/60">Connect</h3>
                                    <a href="mailto:hello@eixora.store" className="text-sm font-light opacity-60 hover:text-purple-500 transition-colors">hello@eixora.store</a>
                                </div>
                            </RevealOnScroll>
                        </div>

                        <div className="flex flex-col justify-end items-start md:items-end">
                            <RevealOnScroll delay={300} className="w-full text-left md:text-right">
                                <Link href="/signup" className="text-2xl sm:text-4xl md:text-6xl font-serif hover:italic transition-all underline decoration-1 underline-offset-8 mb-6 sm:mb-10 inline-block decoration-purple-600">
                                    Find Your Flow &rarr;
                                </Link>
                                <p className="text-sm opacity-40 max-w-sm md:ml-auto leading-relaxed">
                                    Join the elite creators using Eixora to find clarity in the noise. <br className="hidden md:block" />
                                    Your partner in every scan.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8 font-mono text-[9px] tracking-widest uppercase opacity-30">
                        <div className="flex gap-8">
                            <Link href="https://instagram.com/eixora.store" className="hover:text-purple-500 transition-opacity">Instagram</Link>
                            <Link href="https://x.com/eixora_store" className="hover:text-purple-500 transition-opacity">Twitter</Link>
                            <Link href="https://tiktok.com/@eixora.store" className="hover:text-purple-500 transition-opacity">TikTok</Link>
                        </div>
                        <p>&copy; 2026 EIXORA. BORN FOR CREATIVES.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

