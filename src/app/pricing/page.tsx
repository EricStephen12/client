'use client';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
    const { user } = useUser();
    const currentTier = (user?.publicMetadata as { plan_type?: string } | undefined)?.plan_type || 'free';

    return (
        <div className="min-h-screen bg-black text-stone-100 selection:bg-lime-400 selection:text-slate-950">
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-[15px] font-semibold tracking-[0.14em] text-white">
                        EIXORA
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/" className="hidden sm:inline text-sm text-stone-500 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/login" className="text-sm text-stone-400 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/signup?redirect=/dashboard/analyze"
                            className="px-4 py-2 rounded-full bg-lime-400 text-slate-950 text-sm font-semibold hover:bg-lime-300 transition-colors"
                        >
                            Start free
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-32 pb-28">
                <div className="mb-16 sm:mb-20 max-w-2xl">
                    <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4">Pricing</p>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-4">
                        Simple pricing.
                    </h1>
                    <p className="text-base sm:text-lg text-stone-500 font-light leading-relaxed">
                        Start free with Ad, Content, and Product Intel — plus Voice Lounge. Scale when the briefs pay for themselves.
                    </p>
                </div>

                <PricingSection
                    currentTier={currentTier}
                    userEmail={user?.primaryEmailAddress?.emailAddress || ''}
                    showQuotas={!!user}
                />

                <div className="mt-20 pt-12 border-t border-white/[0.06] max-w-xl">
                    <p className="text-sm text-stone-500 font-light leading-relaxed italic">
                        “By joining now, you lock in your rate for the life of your account. No hidden increases.”
                    </p>
                </div>
            </main>

            <footer className="border-t border-white/[0.06] py-12 px-5 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="text-[15px] font-semibold tracking-[0.14em] text-white">EIXORA</p>
                    <div className="flex flex-wrap gap-6 text-sm text-stone-500">
                        <Link href="/privacy" className="hover:text-lime-300 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-lime-300 transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-lime-300 transition-colors">Refunds</Link>
                        <a href="mailto:hello@eixora.store" className="hover:text-lime-300 transition-colors">
                            Support
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
