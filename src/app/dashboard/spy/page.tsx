'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';
import Link from 'next/link';

const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

interface SpyVideo {
    id: string;
    url: string;
    thumbnail: string;
    caption: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    date: string;
    music: string;
}

export default function CompetitorSpyPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [profileUrl, setProfileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<{ username: string; videos: SpyVideo[] } | null>(null);
    const sessionTier = (user?.publicMetadata as any)?.plan_type;
    const [planTier, setPlanTier] = useState<string>(sessionTier || 'free');
    const [isCheckingPlan, setIsCheckingPlan] = useState(!sessionTier);

    useEffect(() => {
        const checkPlan = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tier = data.plan_type || data.subscription_tier || 'free';
                    setPlanTier(tier);
                }
            } catch (err) {
                console.error('Plan check failed', err);
            } finally {
                setIsCheckingPlan(false);
            }
        };
        checkPlan();
    }, [sessionTier]);

    const handleSpy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileUrl.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/competitor-spy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileUrl: profileUrl.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to scan competitor');
                return;
            }

            setResults({ username: data.username, videos: data.videos || [] });
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = (videoUrl: string) => {
        window.location.href = `/dashboard/analyze?url=${encodeURIComponent(videoUrl)}`;
    };

    if (isCheckingPlan) {
        return (
            <div className="max-w-4xl mx-auto pt-24 text-center">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-xl italic text-slate-400">Syncing Intelligence...</p>
            </div>
        );
    }

    // Plan gating is handled by the server returning a 403
    // We just need to handle the error state in handleSpy
    const isAgency = planTier.toLowerCase() === 'agency';
    const isFounding = planTier.toLowerCase() === 'founding';
    const hasAccess = isAgency || isFounding;

    return (
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-16">
            {/* Header */}
            <div className="space-y-6 pt-6 md:pt-12 border-b border-slate-100 pb-12">
                <RevealOnScroll>
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-600 italic block">Expert Surveillance</span>
                </RevealOnScroll>
                <RevealOnScroll delay={100}>
                    <h2 className="text-4xl sm:text-7xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                        Know Their <span className="italic font-serif text-slate-400">Moves.</span>
                    </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={200}>
                    <p className="text-lg text-slate-400 font-light max-w-xl leading-relaxed">
                        Paste any public profile URL. Our engine will map their performance DNA and identify the high-velocity winners worth studying.
                    </p>
                </RevealOnScroll>
            </div>

            {/* Search Form */}
            <RevealOnScroll delay={300}>
                <form onSubmit={handleSpy} className="max-w-3xl">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 relative group p-1 bg-white rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
                            <input
                                type="text"
                                placeholder="Paste TikTok or Instagram profile URL..."
                                value={profileUrl}
                                onChange={(e) => setProfileUrl(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium px-6 py-5"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !profileUrl.trim()}
                            className="px-10 py-6 bg-indigo-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-slate-950 transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Infiltrating...
                                </span>
                            ) : (
                                'Initiate Scan →'
                            )}
                        </button>
                    </div>
                </form>
            </RevealOnScroll>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
                    <div className="w-16 h-16 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-8"></div>
                    <p className="text-slate-900 font-serif italic text-2xl">Mapping their Creative Strategy...</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-4">Direct Link established • Extraction in progress</p>
                </div>
            )}

            {/* Results */}
            {results && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-serif italic text-gray-900">@{results.username}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">{results.videos.length} videos found • Sorted by views</p>
                        </div>
                    </div>

                    {results.videos.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-purple-100 rounded-3xl">
                            <p className="text-gray-400 font-serif italic text-lg">No public videos found for this profile.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.videos.map((video, i) => (
                                <RevealOnScroll key={video.id || i} delay={i * 50}>
                                    <div className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-purple-200 transition-all duration-500">
                                        {/* Thumbnail */}
                                        <div className="relative aspect-[9/16] bg-slate-100 overflow-hidden">
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                    <span className="text-4xl italic font-serif">🎬</span>
                                                </div>
                                            )}
                                            {/* Rank Badge */}
                                            <div className="absolute top-6 left-6">
                                                <span className="text-[10px] font-bold bg-indigo-950 text-white px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                                                    Winner #{i + 1}
                                                </span>
                                            </div>
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                                <button
                                                    onClick={() => handleAnalyze(video.url)}
                                                    className="px-8 py-4 bg-purple-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-110 transition-all active:scale-95 shadow-2xl"
                                                >
                                                    Extract DNA →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="p-4 space-y-3">
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{video.caption || 'No caption'}</p>

                                            <div className="grid grid-cols-4 gap-2 py-2">
                                                {[
                                                    { label: 'Views', value: formatNumber(video.views) },
                                                    { label: 'Likes', value: formatNumber(video.likes) },
                                                    { label: 'Comments', value: formatNumber(video.comments) },
                                                    { label: 'Shares', value: formatNumber(video.shares) },
                                                ].map((stat, j) => (
                                                    <div key={j} className="text-center">
                                                        <p className="text-base font-bold text-slate-900">{stat.value}</p>
                                                        <p className="text-[8px] uppercase tracking-widest text-slate-300 font-bold">{stat.label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {video.music && (
                                                <p className="text-[10px] text-purple-600 truncate font-medium">♫ {video.music}</p>
                                            )}
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
