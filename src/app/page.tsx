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
import WaitlistModal from '@/components/WaitlistModal';

export default function LandingPage() {
    const [url, setUrl] = useState('');
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const isLoggedIn = isLoaded && !!user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [waitlistPlatform, setWaitlistPlatform] = useState<'ios'|'android'>('ios');

    // Redirect logged-in users straight to dashboard
    useEffect(() => {
        if (isLoaded && user) {
            router.replace('/dashboard');
        }
    }, [isLoaded, user, router]);

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
        <div className="min-h-screen bg-gradient-to-br from-lime-50 via-lime-50 to-slate-50 text-gray-900 selection:bg-lime-600 selection:text-slate-900 overflow-x-hidden">
            <CursorEffect />

<nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-lime-100 transition-all duration-300">
                <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-70 transition-opacity flex items-center gap-3">
                        <img src="/app-icon.png" alt="Eixora Logo" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-black tracking-tighter">EIXORA</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-500 hover:text-slate-900 transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/signup" className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-500 hover:text-slate-900 transition-colors">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

<section className="pt-20 min-h-[85vh] flex flex-col md:grid md:grid-cols-2 border-b border-lime-200 overflow-hidden">
                <div className="flex flex-col justify-center px-5 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-24 border-b md:border-b-0 md:border-r border-lime-200 bg-white">
                    <RevealOnScroll delay={100}>
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase mb-4 md:mb-6 text-lime-500 block">Your AI Creative Director</span>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[1.1] mb-6 md:mb-8 tracking-tight">
                            Every video has a <br className="hidden sm:block" />
                            <span className="italic bg-gradient-to-r from-lime-600 via-rose-500 to-lime-500 bg-clip-text text-transparent underline decoration-lime-200 decoration-4 underline-offset-8">Secret.</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <p className="text-base sm:text-lg font-light leading-relaxed max-w-sm mb-8 md:mb-10 text-gray-500">
                            Eixora decodes it. See what others miss, frame by frame, insight by insight. Always on. Always watching.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <button onClick={() => { setWaitlistPlatform('ios'); setIsWaitlistOpen(true); }} className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-lime-600 transition-all shadow-lg active:scale-95 group">
                                <svg className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.48.04 2.68.64 3.4 1.63-3.13 1.83-2.61 6.13.38 7.39-.7 1.77-1.49 3.02-2.45 3.91zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                </svg>
                                <div className="text-left">
                                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Download on the</p>
                                    <p className="text-sm font-black tracking-tight">App Store</p>
                                </div>
                            </button>
                            <button onClick={() => { setWaitlistPlatform('android'); setIsWaitlistOpen(true); }} className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-lime-600 transition-all shadow-lg active:scale-95 group">
                                <svg className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.61 3 21.09 3 20.5zM14.77 10.93l4.56-2.58c.84-.48.84-1.26 0-1.74l-4.56-2.58L4.85 2.1l9.92 8.83zM14.77 13.07l-9.92 8.83 9.92-5.63 4.56-2.58c.84-.48.84-1.26 0-1.74l-4.56-2.58-9.92 8.83z"/>
                                </svg>
                                <div className="text-left">
                                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">GET IT ON</p>
                                    <p className="text-sm font-black tracking-tight">Google Play</p>
                                </div>
                            </button>
                        </div>
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
                    <div className="bg-gradient-to-br from-slate-950 via-lime-950 to-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-white relative overflow-hidden group border border-lime-500/20 shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 font-sans font-bold text-[20vw] sm:text-[12vw] pointer-events-none text-lime-200 select-none" aria-hidden="true">✦</div>
                        <div className="max-w-3xl relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 mb-8 block">Our Vision</span>
                            <h2 className="text-3xl sm:text-4xl md:text-7xl font-sans font-bold leading-tight tracking-tight mb-8 sm:mb-12">
                                Scale with <br />
                                <span className="italic text-lime-200/60 font-serif">Total Peace.</span>
                            </h2>
                            <p className="text-base sm:text-xl md:text-2xl font-light leading-relaxed text-white/80 mb-10 sm:mb-16">
                                We believe creative work should be rewarding, not exhausting. Eixora handles the heavy lifting of analysis so you can stay in your zone of genius—creating content that connects.
                            </p>
                            <div className="flex flex-wrap gap-8 sm:gap-12 border-t border-white/10 pt-8 sm:pt-12">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-lime-500/40 mb-2">Focus On</p>
                                    <p className="text-lg font-serif italic text-white">Creative Strategy</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-lime-500/40 mb-2">Leave Us The</p>
                                    <p className="text-lg font-serif italic text-white">Technical Blueprinting</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16 md:mb-24">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 mb-4 sm:mb-6">Built for High-Growth Teams.</h2>
                        <p className="text-base sm:text-lg text-slate-500 font-light px-2">From Studio Scan to Strategy Brief in 60 seconds.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { step: "01", title: "Studio Scan", desc: "Paste any viral TikTok, Reels, or YouTube Shorts URL. Choose Ad Intelligence or Content Intelligence mode. Our engine extracts every psychological trigger that drives performance." },
                            { step: "02", title: "Map Strategy Brief", desc: "We convert the scan into a structured Strategy Brief — direct shooting instructions, hook variations, and audio cues ready to hand to any creator." },
                            { step: "03", title: "Scale with Logic", desc: "Drop the brief into your Creative Lounge to refine it with AI. Stop guessing what works and start filming backed by real data." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                                <span className="text-5xl font-sans font-bold text-slate-100 group-hover:text-lime-100 transition-colors block mb-8">{item.step}</span>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-lime-600 transition-colors">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto border-t border-white/10 pt-16 sm:pt-24 md:pt-32">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 sm:gap-16 md:gap-20">
                        <div className="lg:col-span-5">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 mb-6 sm:mb-8">Performance Driven.</h2>
                            <p className="text-lg text-slate-500 font-light leading-relaxed mb-12">
                                Eixora is trained on millions in ad spend data — so every Strategy Brief you generate is backed by what's actually working right now, not guesswork.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-lime-50 rounded-full flex items-center justify-center text-lime-600 font-bold">✓</div>
                                    <p className="text-slate-700 font-medium tracking-tight">Enterprise-Grade Security</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-lime-50 rounded-full flex items-center justify-center text-lime-600 font-bold">✓</div>
                                    <p className="text-slate-700 font-medium tracking-tight">Dedicated Support for Agencies</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                <div className="bg-slate-50 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100">
                                    <p className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 mb-2 sm:mb-4">60s</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Strategy Brief from Any Viral URL</p>
                                </div>
                                <div className="bg-slate-50 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100">
                                    <p className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 mb-2 sm:mb-4">3→1</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hours of Research Replaced Per Brief</p>
                                </div>
                                <div className="bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] text-white sm:col-span-2">
                                    <p className="text-xl font-serif italic mb-6">"Before Eixora, I'd spend 3 hours reverse-engineering a viral video and still miss half the hooks. Now I paste the URL, get the full DNA in 60 seconds, and my briefs actually convert. My last campaign hit 2.1M views — I credit the hook structure directly to what Eixora extracted."</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
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
                            { q: "How does it work?", a: "Paste any viral TikTok, Reels, or YouTube Shorts URL into the Eixora app. Choose Ad Intelligence or Content Intelligence mode. Our AI extracts the hook, pacing, and psychological triggers — then generates a Strategy Brief you can take straight into your Creative Lounge or hand to any creator." },
                            { q: "Do I need technical skills?", a: "No. The briefs are written for creators and editors of all levels. If you can read, you can shoot." },
                            { q: "Which platforms are supported?", a: "We fully support TikTok, Instagram Reels, YouTube Shorts, and Facebook/Meta video ads. Paste any public URL and we'll extract the DNA." },
                            { q: "Can I cancel anytime?", a: "Yes. Monthly plans are contract-free. Scale up or down as your needs change." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-white border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-lime-400 transition-all duration-300">
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

<footer className="bg-gradient-to-br from-slate-950 via-lime-950 to-slate-900 text-white pt-16 sm:pt-24 md:pt-32 pb-12 px-4 sm:px-6 border-t border-lime-500/20">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-12 sm:gap-16 md:gap-32 mb-16 sm:mb-20 md:mb-32">
                        <div>
                            <RevealOnScroll>
                                <img src="/app-icon.png" alt="Eixora" className="w-32 h-32 md:w-48 md:h-48 object-contain opacity-20 grayscale brightness-200 contrast-200" />
                            </RevealOnScroll>
                        </div>

                        <div className="space-y-12">
                            <RevealOnScroll delay={200}>
                                <div>
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 text-lime-500/60">Navigation</h3>
                                    <div className="flex flex-col gap-6 text-sm font-light opacity-60">

                                        <Link href="/privacy" className="hover:text-lime-500 transition-colors">Privacy</Link>
                                        <Link href="/terms" className="hover:text-lime-500 transition-colors">Terms</Link>
                                        <Link href="/refund" className="hover:text-lime-500 transition-colors">Refund Policy</Link>
                                    </div>
                                </div>
                                <div className="mt-16">
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 text-lime-500/60">Connect</h3>
                                    <a href="mailto:hello@eixora.store" className="text-sm font-light opacity-60 hover:text-lime-500 transition-colors">hello@eixora.store</a>
                                </div>
                            </RevealOnScroll>
                        </div>

                        <div className="flex flex-col justify-end items-start md:items-end">
                            <RevealOnScroll delay={300} className="w-full text-left md:text-right">

                                <p className="text-sm opacity-40 max-w-sm md:ml-auto leading-relaxed">
                                    Join the elite creators using Eixora to find clarity in the noise. <br className="hidden md:block" />
                                    Your partner in every scan.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8 font-mono text-[9px] tracking-widest uppercase opacity-30">
                        <p className="md:ml-auto">&copy; 2026 EIXORA. BORN FOR CREATIVES.</p>
                    </div>
                </div>
            </footer>
            <WaitlistModal 
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
                defaultPlatform={waitlistPlatform}
            />
        </div>
    );
}

