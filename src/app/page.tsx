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
import AIComparisonSection from '@/components/AIComparisonSection';

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
        <div className="min-h-screen bg-[#0a0c0b] text-stone-100 selection:bg-lime-400 selection:text-slate-950 overflow-x-hidden">
            <CursorEffect />

<nav className="fixed w-full z-50 bg-[#0a0c0b]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
                        <img src="/app-icon.png" alt="Eixora Logo" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-black tracking-[0.12em] text-stone-50">EIXORA</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="px-6 py-2.5 bg-lime-400 text-slate-950 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/signup" className="px-6 py-2.5 bg-lime-400 text-slate-950 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

<section className="pt-20 min-h-[85vh] flex flex-col md:grid md:grid-cols-2 border-b border-white/5 overflow-hidden">
                <div className="relative flex flex-col justify-center px-5 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-24 border-b md:border-b-0 md:border-r border-white/5 bg-[#0e1210]">
                    <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(163,230,53,0.12), transparent 60%)' }} />
                    <RevealOnScroll delay={100}>
                        <span className="relative text-[11px] sm:text-xs font-bold tracking-[0.45em] uppercase mb-5 md:mb-7 text-lime-400/90 block">Eixora · AI Creative Director</span>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-[4.6rem] font-serif leading-[1.15] md:leading-[1.08] mb-6 md:mb-8 tracking-tight text-stone-50">
                            Every video has a <br className="hidden sm:block" />
                            <span className="italic text-lime-300">Secret.</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <p className="relative text-base sm:text-lg font-light leading-relaxed max-w-sm mb-8 md:mb-10 text-stone-400">
                            Decode the hook, pacing, and psychology — then leave with a Strategy Brief you can shoot.
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
                                <svg className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
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

<AIComparisonSection />

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#0a0c0b]">
                <div className="max-w-7xl mx-auto border-y border-white/10 py-16 sm:py-24">
                    <div className="max-w-3xl">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400/80 mb-8 block">Our Vision</span>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif leading-tight tracking-tight mb-8 sm:mb-10 text-stone-50">
                            Scale with <span className="italic text-lime-300/90">Total Peace.</span>
                        </h2>
                        <p className="text-base sm:text-xl font-light leading-relaxed text-stone-400 mb-10 sm:mb-14 max-w-2xl">
                            Creative work should be rewarding, not exhausting. Eixora handles the analysis so you stay in the zone — creating content that connects.
                        </p>
                        <div className="flex flex-wrap gap-10 sm:gap-16 border-t border-white/10 pt-8 sm:pt-10">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Focus On</p>
                                <p className="text-lg font-serif italic text-stone-100">Creative Strategy</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Leave Us The</p>
                                <p className="text-lg font-serif italic text-stone-100">Technical Blueprinting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#0e1210]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 sm:mb-16 md:mb-20 max-w-2xl">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-stone-50 mb-4 sm:mb-5">From scan to brief.</h2>
                        <p className="text-base sm:text-lg text-stone-500 font-light">Studio Scan → Strategy Brief in about a minute.</p>
                    </div>

                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            { step: "01", title: "Studio Scan", desc: "Paste any viral TikTok, Reels, or YouTube Shorts URL. Choose Ad Intelligence or Content Intelligence mode. Our engine extracts every psychological trigger that drives performance." },
                            { step: "02", title: "Map Strategy Brief", desc: "We convert the scan into a structured Strategy Brief — direct shooting instructions, hook variations, and audio cues ready to hand to any creator." },
                            { step: "03", title: "Scale with Logic", desc: "Drop the brief into your Creative Lounge to refine it with AI. Stop guessing what works and start filming backed by real data." }
                        ].map((item) => (
                            <div key={item.step} className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10 group">
                                <span className="text-sm font-mono tracking-[0.2em] text-lime-400/70 pt-1">{item.step}</span>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-serif text-stone-50 mb-3 group-hover:text-lime-300 transition-colors">{item.title}</h3>
                                    <p className="text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-xl">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#0a0c0b] overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 sm:gap-16 md:gap-20">
                        <div className="lg:col-span-5">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-stone-50 mb-6 sm:mb-8">Performance Driven.</h2>
                            <p className="text-lg text-stone-500 font-light leading-relaxed mb-12">
                                Every Strategy Brief is backed by what&apos;s actually working — not guesswork.
                            </p>
                            <div className="space-y-5">
                                <p className="text-stone-300 font-medium tracking-tight flex gap-3"><span className="text-lime-400">✓</span> Enterprise-grade security</p>
                                <p className="text-stone-300 font-medium tracking-tight flex gap-3"><span className="text-lime-400">✓</span> Dedicated support for agencies</p>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="p-6 sm:p-10 border border-white/10 bg-white/[0.02]">
                                    <p className="text-4xl sm:text-5xl font-serif text-stone-50 mb-2 sm:mb-4">60s</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Full Strategy Brief from any viral URL</p>
                                </div>
                                <div className="p-6 sm:p-10 border border-white/10 bg-white/[0.02]">
                                    <p className="text-4xl sm:text-5xl font-serif text-stone-50 mb-2 sm:mb-4">3→1</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Hours of research replaced per brief</p>
                                </div>
                                <div className="p-6 sm:p-10 border border-lime-400/20 bg-lime-400/[0.04] text-stone-100 sm:col-span-2">
                                    <p className="text-xl font-serif italic mb-6 text-stone-200">&ldquo;Before Eixora, I&apos;d spend 3 hours reverse-engineering a viral video and still miss half the hooks. Now I paste the URL, get the full DNA in 60 seconds, and my briefs actually convert.&rdquo;</p>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-lime-300">Rawlins Stephen</p>
                                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Founder, AsrdollarBeatz</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#0e1210]" id="pricing">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 sm:mb-20 max-w-2xl">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-stone-50 mb-5">Simple pricing.</h2>
                        <p className="text-lg text-stone-500 font-light">Predictable costs. Cancel anytime.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <div className="bg-white/[0.03] rounded-2xl p-8 sm:p-10 border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold text-stone-50 mb-2">Free Trial</h3>
                            <p className="text-sm text-stone-500 mb-8">Test the engine.</p>
                            <div className="mb-8">
                                <span className="text-4xl font-serif text-stone-50">$0</span>
                                <span className="text-stone-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> 3 Scans / Month</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Max 90s Video Length</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Ad & Content Intelligence</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Product Intelligence</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Standard AI Engine</li>
                            </ul>
                            <Link href="/signup" className="w-full py-4 rounded-xl border border-white/15 text-stone-300 font-bold text-center uppercase tracking-widest text-xs hover:border-lime-400/50 hover:text-lime-300 transition-colors">
                                Start Free
                            </Link>
                        </div>

                        <div className="bg-[#141a16] rounded-2xl p-8 sm:p-10 border border-lime-400/30 flex flex-col relative md:-translate-y-2">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-lime-400 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-bold text-stone-50 mb-2">Creator</h3>
                            <p className="text-sm text-stone-500 mb-8">For serious dropshippers.</p>
                            <div className="mb-8">
                                <span className="text-4xl font-serif text-stone-50">$5</span>
                                <span className="text-stone-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm text-stone-300"><span className="text-lime-400">✓</span> 30 Scans / Month</li>
                                <li className="flex items-center gap-3 text-sm text-stone-300"><span className="text-lime-400">✓</span> Max 5m Video Length</li>
                                <li className="flex items-center gap-3 text-sm text-stone-300"><span className="text-lime-400">✓</span> Ad & Content Intelligence</li>
                                <li className="flex items-center gap-3 text-sm text-stone-300"><span className="text-lime-400">✓</span> Product Intelligence Unlocked</li>
                                <li className="flex items-center gap-3 text-sm text-stone-300"><span className="text-lime-400">✓</span> Strategy Lounge Chat</li>
                            </ul>
                            <Link href="/signup" className="w-full py-4 rounded-xl bg-lime-400 text-slate-950 font-bold text-center uppercase tracking-widest text-xs hover:bg-lime-300 transition-colors">
                                Upgrade to Creator
                            </Link>
                        </div>

                        <div className="bg-white/[0.03] rounded-2xl p-8 sm:p-10 border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold text-stone-50 mb-2">The Studio</h3>
                            <p className="text-sm text-stone-500 mb-8">For high-volume creators.</p>
                            <div className="mb-8">
                                <span className="text-4xl font-serif text-stone-50">$10</span>
                                <span className="text-stone-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> 100 Scans / Month</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Max 30m Video Length</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Ad, Content & Product Intel</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Premium AI Deep-Dive Engine</li>
                                <li className="flex items-center gap-3 text-sm text-stone-400"><span className="text-lime-400">✓</span> Strategy Lounge Chat</li>
                            </ul>
                            <Link href="/signup" className="w-full py-4 rounded-xl border border-white/15 text-stone-100 font-bold text-center uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
                                Go Studio
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

<section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#0a0c0b]">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-stone-50">Questions & Answers.</h2>
                    </div>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            { q: "How does it work?", a: "Paste any viral TikTok, Reels, or YouTube Shorts URL into the Eixora app. Choose Ad Intelligence or Content Intelligence mode. Our AI extracts the hook, pacing, and psychological triggers — then generates a Strategy Brief you can take straight into your Creative Lounge or hand to any creator." },
                            { q: "Do I need technical skills?", a: "No. The briefs are written for creators and editors of all levels. If you can read, you can shoot." },
                            { q: "Which platforms are supported?", a: "We fully support TikTok, Instagram Reels, YouTube Shorts, and Facebook/Meta video ads. Paste any public URL and we'll extract the DNA." },
                            { q: "What happens when I hit my scan limit?", a: "Your scans reset at the beginning of your billing cycle. If you hit your limit early, you can instantly upgrade your plan in the dashboard to unlock more capacity." },
                            { q: "Can I cancel anytime?", a: "Yes. Monthly plans are completely contract-free. Scale up or down as your needs change directly from your dashboard." }
                        ].map((faq, i) => (
                            <details key={i} className="group py-1">
                                <summary className="flex items-center justify-between py-6 sm:py-8 cursor-pointer list-none">
                                    <h3 className="text-base sm:text-lg font-medium text-stone-100 pr-4">{faq.q}</h3>
                                    <span className="text-stone-500 group-open:rotate-180 transition-transform duration-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                </summary>
                                <div className="pb-6 sm:pb-8 text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-2xl">
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

