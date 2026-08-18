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
        <div className="min-h-screen bg-black text-stone-100 selection:bg-lime-400 selection:text-slate-950 overflow-x-hidden font-sans">
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

                <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 pt-28 pb-16 sm:pb-24 space-y-5">
                    <p className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-none tracking-[-0.03em] text-white">
                        EIXORA
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-stone-100 max-w-2xl leading-tight font-sans">
                        Understand why hooks work.
                        <span className="text-stone-400 block font-medium">Build what&apos;s yours.</span>
                    </h1>
                    <p className="text-sm sm:text-base text-stone-400 font-normal font-sans max-w-lg leading-relaxed">
                        Paste any TikTok, Reel, or Short. Extract psychological triggers and saturation reads in seconds.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <form
                            onSubmit={handleDirectAnalyze}
                            className="w-full max-w-md flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 pl-4 pr-1.5 py-1.5"
                        >
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste video link…"
                                className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-0 font-sans"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-full bg-lime-400 text-slate-950 text-xs font-bold hover:bg-lime-300 transition-colors font-sans"
                            >
                                Scan Free
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => {
                                setWaitlistPlatform('ios');
                                setIsWaitlistOpen(true);
                            }}
                            className="px-6 py-3 rounded-full border border-white/15 text-stone-300 text-xs font-medium hover:bg-white/5 transition-colors font-sans"
                        >
                            Mobile App
                        </button>
                    </div>
                </div>
            </section>

            {/* Proof-first */}
            <section className="relative py-20 sm:py-28 px-5 sm:px-6 bg-black border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4 font-mono font-bold">Niche Bending Engine</p>
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 max-w-2xl font-sans">
                            Don&apos;t copy saturated ads.<br />
                            <span className="italic font-serif text-lime-300">Bend the viral formula.</span>
                        </h2>
                        <p className="text-stone-400 text-base sm:text-lg font-normal max-w-xl mb-12 sm:mb-16">
                            Copycats rip surface videos and burn ad spend. Eixora extracts the psychological engine behind viral hits and bends it into a fresh, high-converting brief for your brand.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <RevealOnScroll delay={100} className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 sm:p-8">
                            <p className="text-[11px] tracking-[0.2em] uppercase text-stone-500 mb-6 font-mono font-bold">Radar Scan Gauges</p>
                            <p className="text-5xl font-bold text-white mb-2 font-sans">9.2</p>
                            <p className="text-sm text-lime-300 mb-8 font-medium">Virality Index / 10</p>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-stone-500">0–3s Thumb-Stop</span>
                                    <span className="text-white font-bold">8.8/10</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-stone-500">Retention Pacing</span>
                                    <span className="text-white font-bold">8.4/10</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-stone-500">Conversion Payoff</span>
                                    <span className="text-white font-bold">8.9/10</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Time to Shoot</span>
                                    <span className="text-[#bdf522] font-mono font-bold">~15s</span>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={200} className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 sm:p-10 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[11px] tracking-[0.2em] uppercase text-stone-500 font-mono font-bold">Bent 0–3s Hook Blueprint</p>
                                    <span className="text-[10px] font-mono font-bold uppercase text-[#bdf522] bg-[#bdf522]/10 px-2.5 py-1 rounded-full border border-[#bdf522]/20">
                                        Tailored to Your Brand DNA
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-stone-400 italic mb-4 font-serif">
                                    Extracted Viral Trigger: “Destructive stress test → Instant undeniable relief.”
                                </p>
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <p className="text-xs font-mono uppercase text-[#bdf522] mb-1.5 font-bold">Your Ready-to-Shoot Script (UGC / iPhone):</p>
                                    <p className="text-base sm:text-lg text-white leading-relaxed font-sans font-medium">
                                        “Stop rubbing your skin raw. Watch this single droplet melt 24-hour waterproof makeup in 2 seconds flat.”
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-xs sm:text-sm text-stone-400 font-normal">
                                    Built for DTC founders, creative directors, and operators building brands that scale.
                                </p>
                                <Link
                                    href="/signup?redirect=/dashboard/analyze"
                                    className="inline-flex self-start px-6 py-2.5 rounded-full bg-lime-400 text-slate-950 text-xs font-bold hover:bg-lime-300 transition-colors uppercase tracking-wider font-sans"
                                >
                                    Try it free
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Feature List Section (Replaced "Four ways in") */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[#0e0e0e] border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4 font-mono font-bold">Core Modes</p>
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 max-w-2xl font-sans">
                            Two dedicated intelligence engines.
                        </h2>
                        <p className="text-stone-400 text-base sm:text-lg font-normal max-w-xl mb-12 sm:mb-16">
                            Targeted insights built specifically for high-converting video and e-commerce execution.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RevealOnScroll delay={80}>
                            <div className="h-full rounded-3xl border border-white/10 bg-black/40 p-8 flex flex-col justify-between space-y-4">
                                <div>
                                    <p className="text-[11px] font-mono tracking-[0.2em] text-lime-400/80 mb-3">01</p>
                                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">Video Intel</h3>
                                    <p className="text-stone-300 text-base leading-relaxed">
                                        Reverse-engineer any paid or organic video. Hooks, pacing, psychology, and why it converts.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={160}>
                            <div className="h-full rounded-3xl border border-white/10 bg-black/40 p-8 flex flex-col justify-between space-y-4">
                                <div>
                                    <p className="text-[11px] font-mono tracking-[0.2em] text-lime-400/80 mb-3">02</p>
                                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">Product Intel</h3>
                                    <p className="text-stone-300 text-base leading-relaxed">
                                        Map market stage, saturation signal, and angle gaps before you bet on a product.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            <VideoCarousel />

            {/* How it works */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-black">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3 font-sans">
                            From scan to brief.
                        </h2>
                        <p className="text-stone-400 text-base sm:text-lg font-normal mb-12 sm:mb-16">
                            Two steps. No agency deck required.
                        </p>
                    </RevealOnScroll>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            {
                                step: '01',
                                title: 'Paste Any Viral Video URL',
                                desc: 'Drop any public TikTok, Reels, or Shorts link. Select Video Intel or Product Intel.',
                            },
                            {
                                step: '02',
                                title: 'Get Your Niche-Bent Script & Score Gauges',
                                desc: 'Instant virality index, 0–3s thumb-stop script, and retention pacing calibrated specifically to your brand setup.',
                            },
                        ].map((item) => (
                            <RevealOnScroll key={item.step}>
                                <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10">
                                    <span className="text-sm font-mono tracking-[0.2em] text-lime-400/80 pt-1 font-bold">{item.step}</span>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">{item.title}</h3>
                                        <p className="text-sm sm:text-base text-stone-400 font-normal leading-relaxed max-w-xl">
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

            {/* Pricing Section */}
            <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[#0e0e0e]" id="pricing">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3 font-sans">Simple pricing.</h2>
                        <p className="text-stone-400 text-lg font-normal mb-12 sm:mb-16">Start free. Scale when it pays for itself.</p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
                        {[
                            {
                                name: 'Free',
                                price: '$0',
                                desc: 'Test the engine.',
                                features: [
                                    '3 scans / month',
                                    'Up to 90s videos',
                                    'Video Intel & Product Intel',
                                ],
                                cta: 'Start free',
                                href: '/signup?redirect=/dashboard/analyze',
                                highlight: false,
                            },
                            {
                                name: 'Creator',
                                price: '$9',
                                desc: 'For serious shippers.',
                                features: [
                                    '30 scans / month',
                                    'Up to 5m videos',
                                    'Both scan modes',
                                    'Priority processing',
                                ],
                                cta: 'Get Creator',
                                href: '/signup?redirect=/dashboard/upgrade',
                                highlight: true,
                            },
                            {
                                name: 'Studio',
                                price: '$15',
                                desc: 'High-volume teams.',
                                features: [
                                    '100 scans / month',
                                    'Up to 30m videos',
                                    'Premium deep-dive AI',
                                    'Priority processing',
                                ],
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
                                    <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-lime-300 mb-3 font-mono">
                                        Most popular
                                    </span>
                                )}
                                <h3 className="text-xl font-bold text-white mb-1 font-sans">{plan.name}</h3>
                                <p className="text-sm text-stone-400 mb-6">{plan.desc}</p>
                                <p className="mb-8">
                                    <span className="text-4xl font-bold text-white font-sans">{plan.price}</span>
                                    <span className="text-stone-500 font-sans">/mo</span>
                                </p>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="text-sm text-stone-300 flex gap-2">
                                            <span className="text-lime-400 font-bold">✓</span> {f}
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
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-10 font-sans">Questions</h2>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {[
                            {
                                q: 'What is Niche Bending?',
                                a: 'Niche Bending is taking the underlying psychological engine of a viral hit in one industry and adapting it into a fresh, non-saturated hook script calibrated for your specific brand, product price point, and camera setup.',
                            },
                            {
                                q: 'How does it work?',
                                a: 'Paste any video URL, pick Video Intel or Product Intel, and get instant visual scores, psychological triggers, and angle-gap data in seconds.',
                            },
                            {
                                q: 'What’s the difference between the modes?',
                                a: 'Video Intel reverse-engineers any paid or organic video for hooks, pacing, and conversion psychology. Product Intel maps market stage, competitive saturation signals, and angle gaps before you bet on a product.',
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
                                    <h3 className="text-base sm:text-lg text-white pr-4 font-medium font-sans">{faq.q}</h3>
                                    <span className="text-stone-500 group-open:rotate-180 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <p className="pb-6 text-sm sm:text-base text-stone-400 font-normal leading-relaxed max-w-2xl font-sans">
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
                    <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-sans">
                        Stop guessing. Start scanning.
                    </h2>
                    <p className="text-stone-400 mb-8 font-normal">
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
                        <p className="text-sm text-stone-400 max-w-xs font-normal leading-relaxed">
                            EIXORA — Pattern intelligence for operators building brands that last.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-stone-400">
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
