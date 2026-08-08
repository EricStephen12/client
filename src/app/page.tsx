'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import CursorEffect from '@/components/CursorEffect';
import RevealOnScroll from '@/components/RevealOnScroll';
import VideoCarousel from '@/components/VideoCarousel';
import BlueprintPreview from '@/components/BlueprintPreview';
import WaitlistModal from '@/components/WaitlistModal';
import AIComparisonSection from '@/components/AIComparisonSection';

export default function LandingPage() {
    const [url, setUrl] = useState('');
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const isLoggedIn = isLoaded && !!user;
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [waitlistPlatform, setWaitlistPlatform] = useState<'ios' | 'android'>('ios');

    useEffect(() => {
        if (isLoaded && user) {
            router.replace('/dashboard');
        }
    }, [isLoaded, user, router]);

    const goStartFree = () => {
        router.push('/signup?redirect=/dashboard/analyze');
    };

    const handleDirectAnalyze = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) {
            goStartFree();
            return;
        }
        if (!isLoggedIn) {
            router.push(`/signup?redirect=/dashboard/analyze&url=${encodeURIComponent(trimmed)}`);
            return;
        }
        router.push(`/dashboard/analyze?url=${encodeURIComponent(trimmed)}`);
    };

    return (
        <div className="min-h-screen bg-black text-stone-100 selection:bg-lime-400 selection:text-slate-950 overflow-x-hidden">
            <CursorEffect />

            {/* Nav */}
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <img src="/app-icon.png" alt="Eixora" className="w-8 h-8 object-contain" />
                        <span className="text-[15px] sm:text-base font-semibold tracking-[0.14em] text-white">EIXORA</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex px-4 py-2 text-sm text-[#c4c7c5] hover:text-white transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup?redirect=/dashboard/analyze"
                            className="px-4 sm:px-5 py-2 rounded-full bg-lime-400 text-slate-950 text-sm font-semibold hover:bg-lime-300 transition-colors"
                        >
                            Start free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero — full-bleed product film */}
            <section className="relative min-h-[100svh] flex flex-col justify-end sm:justify-center overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-105 animate-[heroDrift_28s_ease-in-out_infinite_alternate]"
                >
                    <source src="/videos/v1.webm" type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(163,230,53,0.12) 0%, transparent 55%)',
                    }}
                />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 pt-28 pb-16 sm:pb-24">
                    <p className="font-serif text-[clamp(3.5rem,12vw,8.5rem)] leading-none tracking-[-0.03em] text-white mb-6 sm:mb-8">
                        EIXORA
                    </p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-stone-100 max-w-xl mb-4 sm:mb-5 leading-snug">
                        Steal the hook DNA from any viral ad.
                    </h1>
                    <p className="text-sm sm:text-base text-stone-400 font-light max-w-md mb-8 sm:mb-10 leading-relaxed">
                        Ad, Content, or Product Intel — then talk the brief through out loud in Voice Lounge.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                        <Link
                            href="/signup?redirect=/dashboard/analyze"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-lime-400 text-slate-950 text-sm font-semibold hover:bg-lime-300 transition-colors active:scale-[0.98]"
                        >
                            Start free scan
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setWaitlistPlatform('ios');
                                setIsWaitlistOpen(true);
                            }}
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                        >
                            Get the mobile app
                        </button>
                    </div>

                    <form
                        onSubmit={handleDirectAnalyze}
                        className="w-full max-w-xl flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 pl-5 pr-2 py-2"
                    >
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Or paste a viral URL…"
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-0"
                        />
                        <button
                            type="submit"
                            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-white text-slate-950 text-xs font-semibold hover:bg-lime-300 transition-colors"
                        >
                            Analyze
                        </button>
                    </form>
                </div>
            </section>

            {/* Proof-first */}
            <section className="relative py-20 sm:py-28 px-5 sm:px-6 bg-black border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4">What you get</p>
                        <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-4 max-w-2xl">
                            Not vibes. A brief you can shoot.
                        </h2>
                        <p className="text-stone-500 text-base sm:text-lg font-light max-w-xl mb-12 sm:mb-16">
                            Same input as your competitors — a public URL. Different output: scores, hook rewrite, and direction.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <RevealOnScroll delay={100} className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 sm:p-8">
                            <p className="text-[11px] tracking-[0.2em] uppercase text-stone-500 mb-6">Sample scan</p>
                            <p className="font-serif text-5xl text-white mb-2">9.2</p>
                            <p className="text-sm text-lime-300 mb-8">Hook power / 10</p>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-stone-500">Retention logic</span>
                                    <span className="text-white">8.4</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-stone-500">Conversion trigger</span>
                                    <span className="text-white">8.9</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Time to brief</span>
                                    <span className="text-white">~60s</span>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={200} className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 sm:p-10 flex flex-col justify-between">
                            <div>
                                <p className="text-[11px] tracking-[0.2em] uppercase text-stone-500 mb-4">Hook rewrite</p>
                                <p className="font-serif text-xl sm:text-2xl text-stone-300 italic leading-relaxed mb-6">
                                    Original energy: “messy room → product reveal.”
                                </p>
                                <p className="text-lg sm:text-xl text-white leading-relaxed">
                                    “Stop scrolling — this is the {`{product}`} that finally fixed the thing you’ve been ignoring all week.”
                                </p>
                            </div>
                            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-sm text-stone-500 font-light">
                                    Built for dropshippers, media buyers, and creators who ship weekly.
                                </p>
                                <Link
                                    href="/signup?redirect=/dashboard/analyze"
                                    className="inline-flex self-start px-5 py-2.5 rounded-full bg-lime-400 text-slate-950 text-sm font-semibold hover:bg-lime-300 transition-colors"
                                >
                                    Try it free
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Modes + Voice */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[#0e0e0e] border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4">Four ways in</p>
                        <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-4 max-w-2xl">
                            Pick a mode. Then speak the brief.
                        </h2>
                        <p className="text-stone-500 text-base sm:text-lg font-light max-w-xl mb-12 sm:mb-16">
                            Three scan modes for different jobs — plus Voice Lounge to refine out loud like a real creative director session.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {[
                            {
                                name: 'Ad Intel',
                                desc: 'Reverse-engineer paid creatives — hooks, offers, and why the ad converts.',
                            },
                            {
                                name: 'Content',
                                desc: 'Break down organic Reels and TikToks for retention, pacing, and share triggers.',
                            },
                            {
                                name: 'Product Intel',
                                desc: 'Map market stage, saturation, and angles before you bet on a product.',
                            },
                            {
                                name: 'Voice Lounge',
                                desc: 'Talk through scripts and hooks by voice — hear your Creative Director answer back.',
                            },
                        ].map((item, i) => (
                            <RevealOnScroll key={item.name} delay={i * 80}>
                                <div className="h-full rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-7 flex flex-col">
                                    <p className="text-[11px] font-mono tracking-[0.2em] text-lime-400/80 mb-4">
                                        {String(i + 1).padStart(2, '0')}
                                    </p>
                                    <h3 className="text-lg sm:text-xl font-serif text-white mb-3">{item.name}</h3>
                                    <p className="text-sm text-stone-500 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            <VideoCarousel />

            {/* How it works */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-black">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-3">
                            From scan to brief.
                        </h2>
                        <p className="text-stone-500 text-base sm:text-lg font-light mb-12 sm:mb-16">
                            Three steps. No agency deck required.
                        </p>
                    </RevealOnScroll>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            {
                                step: '01',
                                title: 'Choose Ad, Content, or Product Intel',
                                desc: 'Paste a TikTok, Reel, Short, or Meta ad URL — then pick the mode that matches the job.',
                            },
                            {
                                step: '02',
                                title: 'Get the Strategy Brief',
                                desc: 'Hooks, pacing, psychology, and shoot-ready instructions — not a wall of AI fluff.',
                            },
                            {
                                step: '03',
                                title: 'Open Voice Lounge',
                                desc: 'Speak your questions. Your AI Creative Director answers out loud so you can refine scripts before you film.',
                            },
                        ].map((item) => (
                            <RevealOnScroll key={item.step}>
                                <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10">
                                    <span className="text-sm font-mono tracking-[0.2em] text-lime-400/80 pt-1">{item.step}</span>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">{item.title}</h3>
                                        <p className="text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-xl">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            <BlueprintPreview />
            <AIComparisonSection />

            {/* Social proof quote */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 bg-black border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto text-center">
                    <RevealOnScroll>
                        <p className="font-serif text-2xl sm:text-3xl text-stone-200 italic leading-relaxed mb-8">
                            “Before Eixora, I’d spend 3 hours reverse-engineering a viral video and still miss half the hooks. Now I paste the URL and my briefs actually convert.”
                        </p>
                        <p className="text-sm text-lime-300 font-medium">Rawlins Stephen</p>
                        <p className="text-xs text-stone-500 mt-1 tracking-wide">Founder, AsrdollarBeatz</p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[#0e0e0e]" id="pricing">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-3">Simple pricing.</h2>
                        <p className="text-stone-500 text-lg font-light mb-12 sm:mb-16">Start free. Scale when it pays for itself.</p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
                        {[
                            {
                                name: 'Free',
                                price: '$0',
                                desc: 'Test the engine.',
                                features: ['3 scans / month', 'Up to 90s videos', 'Ad, Content & Product Intel', 'Voice Lounge'],
                                cta: 'Start free',
                                href: '/signup?redirect=/dashboard/analyze',
                                highlight: false,
                            },
                            {
                                name: 'Creator',
                                price: '$5',
                                desc: 'For serious shippers.',
                                features: ['30 scans / month', 'Up to 5m videos', 'All three scan modes', 'Voice Lounge'],
                                cta: 'Get Creator',
                                href: '/signup?redirect=/dashboard/upgrade',
                                highlight: true,
                            },
                            {
                                name: 'Studio',
                                price: '$10',
                                desc: 'High-volume teams.',
                                features: ['100 scans / month', 'Up to 30m videos', 'Premium deep-dive AI', 'Voice Lounge'],
                                cta: 'Go Studio',
                                href: '/signup?redirect=/dashboard/upgrade',
                                highlight: false,
                            },
                        ].map((plan) => (
                            <div
                                key={plan.name}
                                className={`rounded-3xl p-8 flex flex-col border ${
                                    plan.highlight
                                        ? 'border-lime-400/35 bg-[#141a16]'
                                        : 'border-white/10 bg-white/[0.02]'
                                }`}
                            >
                                {plan.highlight && (
                                    <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-lime-300 mb-3">
                                        Most popular
                                    </span>
                                )}
                                <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-stone-500 mb-6">{plan.desc}</p>
                                <p className="mb-8">
                                    <span className="font-serif text-4xl text-white">{plan.price}</span>
                                    <span className="text-stone-500">/mo</span>
                                </p>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="text-sm text-stone-400 flex gap-2">
                                            <span className="text-lime-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={plan.href}
                                    className={`w-full py-3.5 rounded-full text-center text-sm font-semibold transition-colors ${
                                        plan.highlight
                                            ? 'bg-lime-400 text-slate-950 hover:bg-lime-300'
                                            : 'border border-white/15 text-white hover:bg-white/5'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-black">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-10">Questions</h2>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            {
                                q: 'How does it work?',
                                a: 'Paste a viral URL, pick Ad Intel, Content, or Product Intel, and get a Strategy Brief. Then open Voice Lounge to talk through hooks and scripts out loud.',
                            },
                            {
                                q: 'What’s the difference between the modes?',
                                a: 'Ad Intel reverse-engineers paid creatives. Content breaks down organic short-form. Product Intel maps market stage, saturation, and angles before you bet on a SKU.',
                            },
                            {
                                q: 'What is Voice Lounge?',
                                a: 'A spoken session with your AI Creative Director — you talk, it answers out loud so you can refine the brief before you film.',
                            },
                            {
                                q: 'Which platforms are supported?',
                                a: 'TikTok, Instagram Reels, YouTube Shorts, and Meta video ads.',
                            },
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes. Monthly plans are contract-free. Change tiers from your dashboard anytime.',
                            },
                        ].map((faq) => (
                            <details key={faq.q} className="group py-1">
                                <summary className="flex items-center justify-between py-6 cursor-pointer list-none">
                                    <h3 className="text-base sm:text-lg text-white pr-4 font-medium">{faq.q}</h3>
                                    <span className="text-stone-500 group-open:rotate-180 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <p className="pb-6 text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-2xl">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[#0e0e0e] border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-4">
                        Stop guessing. Start scanning.
                    </h2>
                    <p className="text-stone-500 mb-8 font-light">
                        Free trial. No card required to start.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/signup?redirect=/dashboard/analyze"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-lime-400 text-slate-950 text-sm font-semibold hover:bg-lime-300"
                        >
                            Start free scan
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setWaitlistPlatform('android');
                                setIsWaitlistOpen(true);
                            }}
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/15 text-white text-sm hover:bg-white/5"
                        >
                            Join mobile waitlist
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-black text-white pt-16 pb-10 px-5 sm:px-6 border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div>
                        <p className="text-[15px] font-semibold tracking-[0.14em] mb-3">EIXORA</p>
                        <p className="text-sm text-stone-500 max-w-xs font-light leading-relaxed">
                            AI Creative Director for short-form that actually converts.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-stone-500">
                        <Link href="/privacy" className="hover:text-lime-300 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-lime-300 transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-lime-300 transition-colors">Refunds</Link>
                        <a href="mailto:hello@eixora.store" className="hover:text-lime-300 transition-colors">
                            hello@eixora.store
                        </a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.06] text-[11px] tracking-widest uppercase text-stone-600">
                    © 2026 Eixora
                </div>
            </footer>

            <WaitlistModal
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
                defaultPlatform={waitlistPlatform}
            />

            <style jsx global>{`
                @keyframes heroDrift {
                    from { transform: scale(1.05) translate3d(0, 0, 0); }
                    to { transform: scale(1.1) translate3d(-1.5%, 1%, 0); }
                }
            `}</style>
        </div>
    );
}
