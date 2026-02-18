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
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [supabase, router]);

    const firstName = profile?.full_name?.split(' ')[0] || 'Creator';
    const isPro = profile?.plan_type === 'pro' || profile?.plan_type === 'agency';

    return (
        <DashboardLayout>
            <div className="space-y-16 lg:space-y-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <RevealOnScroll>
                            <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 block">Studio Control</span>
                        </RevealOnScroll>
                        <RevealOnScroll delay={100}>
                            <h2 className="text-5xl lg:text-7xl font-serif font-medium tracking-tighter text-gray-900 leading-[0.9]">
                                Welcome back,<br />
                                <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    {loading ? '...' : `${firstName}.`}
                                </span>
                            </h2>
                        </RevealOnScroll>
                    </div>
                    <RevealOnScroll delay={200}>
                        <div className="flex gap-4">
                            <div className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border shadow-sm flex items-center gap-3 ${isPro
                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                : 'bg-gray-50 text-gray-500 border-gray-100'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-purple-600 animate-pulse' : 'bg-gray-400'}`}></span>
                                {isPro ? 'Pro Plan Active' : 'Free Plan'}
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>


                {/* Statistics & Suggestions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Activity Stats */}
                    <RevealOnScroll delay={250}>
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-6 bg-white border border-purple-50 rounded-3xl shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Activity Hub</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Scripts</span>
                                        <span className="text-xl font-serif text-purple-600">{profile?.total_scripts || 0}</span>
                                    </div>
                                    <div className="h-px bg-gray-50"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Pins/Social</span>
                                        <span className="text-xl font-serif text-blue-600">{profile?.total_pins || 0}</span>
                                    </div>
                                    <div className="h-px bg-gray-50"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Video Scans</span>
                                        <span className="text-xl font-serif text-pink-600">{profile?.total_videos_analyzed || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Smart Suggestion Engine */}
                    <RevealOnScroll delay={300} className="lg:col-span-3">
                        <div className="h-full p-8 bg-gradient-to-br from-gray-900 to-black text-white rounded-[2.5rem] relative overflow-hidden group border border-white/10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                                    AI Director Suggestion
                                </span>

                                {loading ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-8 bg-white/10 w-3/4 rounded"></div>
                                        <div className="h-4 bg-white/10 w-1/2 rounded"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {profile?.total_scripts > 0 && (profile?.total_pins || 0) === 0 ? (
                                            <>
                                                <h3 className="text-3xl font-serif italic text-amber-400">"You've got the scripts. Now give them eyes."</h3>
                                                <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                                                    Our AI detected that you've generated amazing scripts but haven't created the visual assets yet.
                                                    Sync your brand DNA with the <span className="text-white italic">Social Curator</span> to manifest your Pinterest and Instagram content.
                                                </p>
                                                <Link href="/dashboard/content-generator" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">
                                                    Start Manifestation →
                                                </Link>
                                            </>
                                        ) : (profile?.total_scripts || 0) === 0 ? (
                                            <>
                                                <h3 className="text-3xl font-serif italic text-purple-400">"The first step is the viral hook."</h3>
                                                <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                                                    Ready to engineer your next winner? Let's analyze a viral ad or use your private DNA to craft a script that converts.
                                                </p>
                                                <Link href="/dashboard/script-generator" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500 text-purple-400">
                                                    Forge Your First Script →
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-3xl font-serif italic text-pink-400">"Optimize your output."</h3>
                                                <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                                                    You're in a creative flow. Upload your raw footage for a <span className="text-white italic">Private Analysis</span> to ensure your hook and pacing match viral benchmarks before publishing.
                                                </p>
                                                <Link href="/dashboard/analyze" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500 text-pink-400">
                                                    Deep Scan Video →
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Viral Library */}
                    <RevealOnScroll delay={400}>
                        <div className="group relative bg-white p-10 rounded-[2.5rem] border border-purple-100 shadow-[0_20px_50px_-20px_rgba(168,85,247,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.2)] transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-600/10 transition-colors"></div>
                            <div className="flex-1">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-serif text-gray-900 mb-4 tracking-tight">Viral Library</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium opacity-80">
                                    Curated high-converting creative benchmarks for every niche.
                                </p>
                            </div>
                            <Link href="/dashboard/ad-library" className="mt-10 flex items-center justify-between w-full p-5 bg-gray-50 rounded-2xl group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:text-white transition-all shadow-inner">
                                <span className="text-xs font-bold uppercase tracking-widest">Explore Trends</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Social Curator */}
                    <RevealOnScroll delay={500}>
                        <div className="group relative bg-white p-10 rounded-[2.5rem] border border-purple-100 shadow-[0_20px_50px_-20px_rgba(168,85,247,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.2)] transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-600/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-pink-600/10 transition-colors"></div>
                            <div className="flex-1">
                                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-serif text-gray-900 mb-4 tracking-tight">Social Curator</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium opacity-80">
                                    AI-powered visual synthesis for Instagram and Pinterest.
                                </p>
                            </div>
                            <Link href="/dashboard/content-generator" className="mt-10 flex items-center justify-between w-full p-5 bg-gray-50 rounded-2xl group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:text-white transition-all shadow-inner">
                                <span className="text-xs font-bold uppercase tracking-widest">Create Assets</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* Footer Section - System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                    <RevealOnScroll delay={600}>
                        <div className="p-8 rounded-[2rem] border border-purple-100 bg-white shadow-sm flex items-center gap-6 group">
                            <div className="relative flex h-4 w-4 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </div>
                            <div>
                                <h4 className="text-xl font-serif text-gray-900">Analysis Engine: Online</h4>
                                <p className="text-sm text-gray-400 font-medium">Syncing with TikTok viral trends in real-time.</p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={700}>
                        {isPro ? (
                            <div className="p-8 rounded-[2rem] border border-purple-100 bg-purple-50 flex flex-col items-start justify-center group h-full">
                                <h4 className="text-xl font-serif text-purple-900 mb-2">Pro Features Unlocked</h4>
                                <p className="text-sm text-purple-600/70 font-medium mb-4">You have access to elite viral insights and unlimited script generation.</p>
                                <button className="text-xs font-bold uppercase tracking-widest text-purple-600 hover:text-purple-800">Manage Subscription</button>
                            </div>
                        ) : (
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-purple-900 text-white flex flex-col items-start justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none"></div>
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 mb-3 block">Premium Feature</span>
                                <h4 className="text-2xl font-serif mb-6 leading-tight">Elite Viral Insights &<br />Custom Brand DNA.</h4>
                                <Link href="/dashboard/upgrade" className="px-8 py-3 bg-white text-purple-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-purple-50 transition-all shadow-xl hover:-translate-y-1">
                                    Upgrade Plan
                                </Link>
                            </div>
                        )}
                    </RevealOnScroll>
                </div>
            </div>


        </DashboardLayout >
    );
}
