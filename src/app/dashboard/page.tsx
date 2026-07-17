'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlanLimit, getPlanLabel } from '@/utils/plan';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quickScanUrl, setQuickScanUrl] = useState('');
    const router = useRouter();
    const loading = !isLoaded || isLoading;
    const userId = user?.id;

    useEffect(() => {
        if (isLoaded && user) {
            const fetchData = async () => {
                try {
                    const token = await getToken();
                    
                    const [resMe, resSessions] = await Promise.all([
                        fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || '')}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch(`/api/main/api/user-sessions?userId=${userId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                    ]);
                    
                    if (resMe.ok) setProfile(await resMe.json());
                    if (resSessions.ok) setSessions(await resSessions.json());
                } catch (err) {

                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isLoaded, user, getToken, userId]);

    const firstName = user?.firstName || user?.username || 'Creator';

    const handleQuickScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickScanUrl.trim()) {
            router.push(`/dashboard/analyze?url=${encodeURIComponent(quickScanUrl)}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pb-20">
            {}
            <div className="pt-2 sm:pt-6">
                <RevealOnScroll>
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-8">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-lime-600 block">Dashboard</span>
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                {loading ? 'Loading dashboard...' : (
                                    <>Welcome back, <br className="hidden md:block" /><span className="italic font-serif text-slate-400">{firstName}.</span></>
                                )}
                            </h2>
                        </div>

                        {}
                        <div className="flex flex-wrap lg:flex-nowrap gap-3 sm:gap-4 flex-1 xl:max-w-xl justify-start xl:justify-end">
                            {[
                                {
                                    label: 'Scans Used',
                                    value: (() => {
                                        const tier = profile?.plan_type || 'free';
                                        const scans = profile?.monthly_usage?.scans ?? 0;
                                        return `${scans} / ${getPlanLimit(tier)}`;
                                    })(),
                                    subtext: (() => {
                                        const tier = profile?.plan_type || 'free';
                                        if (tier === 'studio') return 'Max 30m video length';
                                        if (tier === 'creator') return 'Max 5m video length';
                                        return 'Max 90s video length';
                                    })()
                                },
                                {
                                    label: 'Current Plan',
                                    value: getPlanLabel(profile?.plan_type || 'free'),
                                }
                            ].map((stat, i) => (
                                <div key={i} className="flex-1 min-w-[120px] p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:border-lime-200 transition-all group shadow-sm">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-lime-600 transition-colors">{stat.label}</p>
                                    <p className="text-lg sm:text-2xl font-sans font-bold text-slate-900">{stat.value}</p>
                                    {stat.subtext && <p className="text-[10px] font-medium text-slate-500 mt-1">{stat.subtext}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            {}
            <RevealOnScroll delay={100}>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-slate-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <form onSubmit={handleQuickScan} className="relative flex flex-col sm:flex-row items-center bg-white border border-slate-100 rounded-3xl p-2 shadow-xl shadow-lime-900/5">
                        <div className="flex-1 w-full flex items-center px-6 py-4">
                            <span className="text-2xl mr-4 opacity-50">⚡</span>
                            <input 
                                type="url" 
                                required
                                value={quickScanUrl}
                                onChange={(e) => setQuickScanUrl(e.target.value)}
                                placeholder="Paste TikTok, Reels, or Shorts URL to analyze..."
                                className="w-transparent bg-transparent border-none text-slate-900 placeholder-slate-400 font-medium text-base sm:text-lg focus:outline-none focus:ring-0"
                            />
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-8 py-5 sm:py-0 h-full sm:h-16 m-1 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-lime-600 transition-all shadow-lg hover:shadow-lime-500/30 whitespace-nowrap">
                            Analyze Video
                        </button>
                    </form>
                </div>
            </RevealOnScroll>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 pt-8">
                {}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-serif italic text-slate-900 font-bold">Recent Scans</h3>
                        <Link href="/dashboard/analyze" className="text-[10px] font-black uppercase tracking-widest text-lime-600 hover:text-lime-800 transition-colors">
                            Analyze Video &rarr;
                        </Link>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))
                        ) : sessions && sessions.length > 0 ? (
                            sessions.slice(0, 6).map((session: any) => (
                                <Link key={session.id} href={`/dashboard/analyze?sessionId=${session.id}`} className="group flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl hover:border-lime-300 hover:shadow-lg hover:shadow-lime-500/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 truncate pr-4 text-base">{session.title || 'Untitled Scan'}</h4>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{new Date(session.created_at || session.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-slate-300 group-hover:text-lime-600 transition-colors">
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-1 sm:col-span-2 p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">No scans run yet</h4>
                                <p className="text-sm text-slate-400 mb-6">Paste a video link above to run your first report.</p>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="space-y-6">
                    <h3 className="text-2xl font-serif italic text-slate-900 font-bold">More Tools</h3>
                    
                    <div className="space-y-4">

                        <Link href="/dashboard/analyze" className="block p-6 bg-lime-50 text-lime-900 rounded-3xl border border-lime-100 hover:border-lime-300 hover:shadow-lg transition-all group">
                            <h4 className="font-bold text-xl mb-2">Manual Upload</h4>
                            <p className="text-lime-600/70 text-sm mb-6">Upload an MP4 file for a detailed analysis.</p>
                            <span className="inline-block px-4 py-2 bg-white text-lime-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Upload Video &rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
