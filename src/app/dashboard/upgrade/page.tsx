'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PricingSection from '@/components/PricingSection';
import { Shield, Zap, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { getPlanLimit } from '@/utils/plan';

const features = [
    { icon: Zap,   label: 'Instant AI Analysis',   desc: 'Get viral DNA in seconds' },
    { icon: Star,  label: 'Strategy Briefs',        desc: 'Director-grade content plans' },
    { icon: Shield,label: 'Priority Processing',    desc: 'Jump the queue always' },
];

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
    }, [userId]);

    const scanCount  = profileData?.monthly_usage?.scans ?? 0;
    const scriptCount = profileData?.monthly_usage?.scripts ?? 0;
    const isFree = !currentTier || currentTier === 'free';
    const scanLimit = getPlanLimit(currentTier);

    return (
        <div className="max-w-6xl mx-auto pb-24">

            {/* ── HERO ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-16 sm:py-20 space-y-6"
            >
                <div className="inline-flex items-center gap-2 bg-lime-50 border border-lime-200 text-lime-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5" />
                    Plans & Pricing
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-slate-900 leading-[0.95]">
                    Unlock Your{' '}
                    <span className="font-serif italic text-slate-400">Full Studio.</span>
                </h1>

                <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
                    Access the complete Viral DNA engine, elite creative briefs, and priority AI processing — starting at just $5/mo.
                </p>

                {/* Feature highlights row */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {features.map((f) => (
                        <div key={f.label} className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-full px-5 py-2.5 shadow-sm">
                            <f.icon className="w-4 h-4 text-lime-500" />
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-900 leading-none">{f.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── USAGE BANNER (free users only) ── */}
            {isFree && profileData && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-wrap gap-6 items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm font-bold text-amber-800">You're on the Free Trial</span>
                        <span className="text-xs text-amber-600 font-medium">— {Math.max(0, scanLimit - scanCount)} scan{Math.max(0, scanLimit - scanCount) !== 1 ? 's' : ''} remaining this period</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                        <span>{scanCount} / {scanLimit} Scans Used</span>
                        <span>{scriptCount} / {scanLimit} Briefs Used</span>
                    </div>
                </motion.div>
            )}

            {/* ── PRICING CARDS ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <PricingSection
                    currentTier={currentTier}
                    userEmail={userEmail}
                />
            </motion.div>

            {/* ── TRUST FOOTER ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-20 text-center space-y-6"
            >
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {['Cancel Anytime', 'Instant Access', 'Secure Checkout', 'Live Support'].map(t => (
                        <div key={t} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-lime-500" />
                            <span>{t}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                    Eixora &bull; Powering the next generation of viral creators
                </p>
            </motion.div>
        </div>
    );
}
