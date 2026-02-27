'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const loading = status === 'loading' || isLoading;

    useEffect(() => {
        if (status === 'authenticated') {
            const fetchStats = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/me`);
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
    }, [status]);

    const firstName = session?.user?.name?.split(' ')[0] || 'Creator';

    return (
        <div className="max-w-5xl mx-auto space-y-10 md:space-y-16">
            {/* Mission Control Header */}
            <div className="space-y-4 pt-6 md:pt-12">
                <RevealOnScroll pb-4>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-600">Mission Control</span>
                </RevealOnScroll>
                <RevealOnScroll delay={100}>
                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter text-gray-900 leading-[0.9]">
                        {loading ? 'Initializing...' : `Welcome, ${firstName}.`}
                    </h2>
                </RevealOnScroll>
            </div>

            {/* Primary Action */}
            <RevealOnScroll delay={200}>
                <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
                        <div className="space-y-3 md:space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif italic text-purple-400">"The studio is ready for your next winner."</h3>
                            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                                Deconstruct any viral reference and weaponize the math of their retention DNA.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/analyze"
                            className="w-full md:w-auto text-center px-8 md:px-12 py-5 md:py-6 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap"
                        >
                            Enter Intelligence Studio &rarr;
                        </Link>
                    </div>
                </div>
            </RevealOnScroll>

            {/* Subtle Vital Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                    { label: 'DNA Scans', value: profile?.total_videos_analyzed || 0 },
                    { label: 'Script Forge', value: profile?.total_scripts || 0 },
                    { label: 'Retention Pins', value: profile?.total_pins || 0 },
                    { label: 'Studio Level', value: profile?.plan_type || 'Free' }
                ].map((stat, i) => (
                    <RevealOnScroll key={i} delay={300 + (i * 100)}>
                        <div className="p-4 md:p-8 border-t border-purple-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-serif italic text-gray-900 capitalize">{stat.value}</p>
                        </div>
                    </RevealOnScroll>
                ))}
            </div>
        </div>
    );
}
