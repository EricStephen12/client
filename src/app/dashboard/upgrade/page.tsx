'use client';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import PricingSection from '@/components/PricingSection';

export default function UpgradePage() {
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';
    const currentTier = (user?.publicMetadata as any)?.plan_type || 'free';

    return (
        <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-24 space-y-8">
                <RevealOnScroll>
                    <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-amber-600 block mb-4 italic">Account Upgrades</span>
                    <h2 className="text-4xl md:text-8xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                        Subscription <span className="italic font-serif text-slate-400">Plans.</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto font-light text-xl mt-8 leading-relaxed">
                        Secure your seat in the Creative Studio. Access our Viral DNA engine and elite creative strategy brief generation.
                    </p>
                </RevealOnScroll>
            </div>

            <PricingSection 
                currentTier={currentTier}
                userEmail={userEmail}
            />

            <div className="text-center mt-20 opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    Eixora by EXRICX &bull; Early Access Beta &bull; 100% Free for Early Adopters
                </p>
            </div>
        </div>
    );
}
