'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const loading = !isLoaded || isLoading;

    useEffect(() => {
        if (isLoaded && user) {
            const fetchStats = async () => {
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                    }
                } catch (err) {
                    console.error('Fetch stats failed', err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        }
    }, [isLoaded, user, getToken]);

    const firstName = user?.firstName || user?.username || 'Creator';

    return (
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-20">
            {/* Header Section */}
            <div className="pt-6 md:pt-12">
                <RevealOnScroll>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 mb-2 block">Director's Suite</span>
                            <h2 className="text-4xl md:text-7xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                {loading ? 'Preparing your lounge...' : (
                                    <>Welcome back, <br /><span className="italic font-serif text-slate-400">{firstName}.</span></>
                                )}
                            </h2>
                        </div>
                        {profile?.plan_type && profile.plan_type !== 'free' && (
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                                    {profile.plan_type === 'founding' ? 'Founding Partner' : `${profile.plan_type.toUpperCase()} Access`}
                                </span>
                            </div>
                        )}
                    </div>
                </RevealOnScroll>
            </div>

            {/* Primary Action Card - The "Studio" */}
            <RevealOnScroll delay={200}>
                <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden group shadow-2xl border border-purple-500/10">
                    <div className="absolute top-0 right-0 p-12 opacity-5 font-sans font-bold text-[15vw] pointer-events-none text-amber-200">FLOW</div>
                    
                    <div className="max-w-2xl relative z-10 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-3xl md:text-5xl font-serif italic text-amber-200 leading-tight">
                                Ready to find your <br /> next winning flow?
                            </h3>
                            <p className="text-white/60 text-lg font-light leading-relaxed">
                                Our creative engine is primed. Upload any reference to extract the psychological blueprints behind today's viral winners.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link
                                href="/dashboard/analyze"
                                className="px-10 py-6 bg-amber-500 text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-xl shadow-amber-950/20 text-center"
                            >
                                Enter Intelligence Studio &rarr;
                            </Link>
                            <Link
                                href="/dashboard/batch"
                                className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all text-center"
                            >
                                Batch Processing
                            </Link>
                        </div>
                    </div>

                    {/* Aesthetic Glow */}
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500 rounded-full blur-[140px] opacity-10" />
                </div>
            </RevealOnScroll>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    {
                        label: 'Creative Scans',
                        value: profile?.plan_type === 'free'
                            ? `${profile?.monthly_usage?.scans || 0} / 3`
                            : (profile?.total_videos_analyzed || 0),
                        sub: 'Viral DNA extractions'
                    },
                    {
                        label: 'Production Briefs',
                        value: profile?.plan_type === 'free'
                            ? `${profile?.monthly_usage?.scripts || 0} / 3`
                            : (profile?.total_scripts || 0),
                        sub: 'Actionable shooting plans'
                    },
                    { label: 'Retention Pins', value: profile?.total_pins || 0, sub: 'Saved pattern interrupts' },
                    { 
                        label: 'Partnership', 
                        value: profile?.plan_type ? (profile.plan_type === 'founding' ? 'Founding' : profile.plan_type.charAt(0).toUpperCase() + profile.plan_type.slice(1)) : 'Free',
                        sub: 'Current account status'
                    }
                ].map((stat, i) => (
                    <RevealOnScroll key={i} delay={300 + (i * 100)}>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:shadow-lg transition-all group">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 group-hover:text-amber-600 transition-colors">{stat.label}</p>
                            <p className="text-4xl font-sans font-bold text-slate-900 mb-2">{stat.value}</p>
                            <p className="text-[10px] text-slate-400 font-medium italic opacity-60">{stat.sub}</p>
                        </div>
                    </RevealOnScroll>
                ))}
            </div>
        </div>
    );
}
