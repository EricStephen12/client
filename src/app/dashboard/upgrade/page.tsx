'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PricingSection from '@/components/PricingSection';
import { Zap, CheckCircle2 } from 'lucide-react';
import { getPlanLimit } from '@/utils/plan';

export default function UpgradePage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';
    const currentTier = profileData?.plan_type || (user?.publicMetadata as any)?.plan_type || 'free';
    const userId = user?.id;

    useEffect(() => {
        if (!userId || !user) return;
        const fetchProfile = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(user.fullName || '')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setProfileData(await res.json());
            } catch {}
        };
        fetchProfile();
    }, [userId, userEmail, user, getToken]);

    const scanCount = profileData?.monthly_usage?.scans ?? 0;
    const isFree = !currentTier || currentTier === 'free';
    const scanLimit = getPlanLimit(currentTier);
    const remaining = Math.max(0, scanLimit - scanCount);

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 font-sans">
            {/* Clean, spacious header */}
            <div className="text-center pt-8 pb-12 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#bdf522]">
                    Pricing & Quotas
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl text-white font-singsong font-serif tracking-tight">
                    Choose your plan.
                </h1>
                <p className="text-stone-400 max-w-md mx-auto text-sm sm:text-base font-normal leading-relaxed">
                    Scale your creative testing with higher scan capacity, deep vision analysis, and priority processing.
                </p>

                {/* Minimalist usage indicator */}
                {profileData && (
                    <div className="pt-2">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-stone-300">
                            <span className={`w-1.5 h-1.5 rounded-full ${isFree && remaining <= 1 ? 'bg-red-400' : 'bg-[#bdf522]'}`} />
                            {isFree ? 'Free Trial' : `${currentTier.toUpperCase()} Plan`}: {remaining} of {scanLimit} scans remaining
                        </span>
                    </div>
                )}
            </div>

            {/* Pricing cards */}
            <div className="w-full">
                <PricingSection
                    currentTier={currentTier}
                    userEmail={userEmail}
                />
            </div>

            {/* Subtle trust footer */}
            <div className="mt-16 text-center pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-stone-500">
                <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#bdf522]" /> Cancel anytime
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#bdf522]" /> Instant license activation
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#bdf522]" /> Secure checkout
                </span>
            </div>
        </div>
    );
}
