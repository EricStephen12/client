'use client';
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import PricingSection from "@/components/PricingSection";
import CheckoutButton from "@/components/CheckoutButton";
import { motion } from "framer-motion";

export default function PricingPage() {
    const { user } = useUser();
    const currentTier = (user?.publicMetadata as any)?.plan_type || 'free';
    
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
            {/* Navigation - Unified Warm Partner Style */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-serif italic font-bold text-slate-900">
                        Eixora<span className="text-purple-600">.</span>
                    </Link>
                    <div className="flex gap-10 text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <Link href="/login" className="hover:text-purple-600 transition-colors">Sign In</Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
                <div className="text-center mb-32">
                    <RevealOnScroll>
                        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-purple-600 mb-6 block">The Investment</span>
                        <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-slate-900 mb-8">
                            Clarity for every <br className="hidden md:block" />
                            <span className="italic text-transparent bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text underline decoration-purple-100 underline-offset-8">creative cycle.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                            Professional creative strategy doesn't happen by accident. Choose the plan that gives your team the data, speed, and clarity needed to dominate the feed.
                        </p>
                    </RevealOnScroll>
                </div>

                <PricingSection 
                    currentTier={currentTier}
                    userEmail={user?.primaryEmailAddress?.emailAddress || ''}
                    showQuotas={!!user}
                />

                <div className="mt-32 text-center max-w-2xl mx-auto border-t border-slate-100 pt-20">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-600 mb-4 block">The Founding Promise</span>
                    <p className="text-sm text-slate-400 font-light leading-relaxed italic">
                        "We are building Eixora to be the standard for creative media buying. By joining now, you lock in your rate for the life of your account. No hidden increases, ever."
                    </p>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="bg-white border-t border-slate-100 py-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                    <Link href="/" className="text-2xl font-serif italic font-bold text-slate-900 opacity-60 hover:opacity-100 transition-opacity">Eixora<span className="text-purple-600">.</span></Link>
                    <div className="flex flex-wrap justify-center gap-12 text-[9px] font-bold tracking-[0.4em] uppercase text-slate-400">
                        <Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-purple-600 transition-colors">Terms</Link>
                        <a href="mailto:hello@eixora.store" className="hover:text-purple-600 transition-colors">Support</a>
                    </div>
                    <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-slate-300">&copy; 2026 EIXORA. BORN FOR CREATIVES.</p>
                </div>
            </footer>
        </div>
    );
}
