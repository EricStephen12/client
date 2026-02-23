'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const firstName = profile?.full_name?.split(' ')[0] || 'Creator';

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-16">
                {/* Mission Control Header */}
                <div className="space-y-4 pt-12">
                    <RevealOnScroll pb-4>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-600">Mission Control</span>
                    </RevealOnScroll>
                    <RevealOnScroll delay={100}>
                        <h2 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-gray-900 leading-[0.9]">
                            {loading ? 'Initializing...' : `Welcome, ${firstName}.`}
                        </h2>
                    </RevealOnScroll>
                </div>

                {/* Primary Action */}
                <RevealOnScroll delay={200}>
                    <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-serif italic text-purple-400">"The studio is ready for your next winner."</h3>
                                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                                    Deconstruct any viral reference and weaponize the math of their retention DNA.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/analyze"
                                className="px-12 py-6 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl text-center"
                            >
                                Enter Intelligence Studio &rarr;
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>

                {/* Subtle Vital Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'DNA Scans', value: profile?.total_videos_analyzed || 0 },
                        { label: 'Script Forge', value: profile?.total_scripts || 0 },
                        { label: 'Retention Pins', value: profile?.total_pins || 0 },
                        { label: 'Studio Level', value: profile?.plan_type || 'Free' }
                    ].map((stat, i) => (
                        <RevealOnScroll key={i} delay={300 + (i * 100)}>
                            <div className="p-8 border-t border-purple-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                                <p className="text-3xl font-serif italic text-gray-900 capitalize">{stat.value}</p>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
