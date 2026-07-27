'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getPlanLimit, getPlanLabel } from '@/utils/plan';
import { Zap, ArrowRight, Play, ChevronDown, Sparkles, Clock, TrendingUp, Video } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } }
} as const;

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function CircularProgress({ value, max, size = 80 }: { value: number; max: number; size?: number }) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const offset = circumference * (1 - pct);
    const color = pct > 0.8 ? '#ef4444' : pct > 0.5 ? '#f59e0b' : '#84cc16';

    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
        </svg>
    );
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quickScanUrl, setQuickScanUrl] = useState('');
    const [quickScanMode, setQuickScanMode] = useState<'ad' | 'content' | 'product-intel'>('ad');
    const [inputFocused, setInputFocused] = useState(false);
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
                    // silent
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isLoaded, user, getToken, userId]);

    const firstName = user?.firstName || user?.username || 'Creator';
    const tier = profile?.plan_type || 'free';
    const scanCount = profile?.monthly_usage?.scans ?? 0;
    const scanLimit = getPlanLimit(tier);

    const handleQuickScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickScanUrl.trim()) {
            router.push(`/dashboard/analyze?url=${encodeURIComponent(quickScanUrl)}&mode=${quickScanMode}`);
        }
    };

    const modeLabels: Record<string, string> = {
        'ad': 'Ad Intel',
        'content': 'Content Intel',
        'product-intel': 'Product Intel',
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 pb-24">

            {/* ── HEADER ROW ── */}
            <motion.div
                className="pt-2 sm:pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate()}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                        {loading ? (
                            <span className="inline-block w-64 h-10 bg-slate-100 animate-pulse rounded-xl" />
                        ) : (
                            <>
                                {getGreeting()},{' '}
                                <span className="font-serif italic text-slate-400">{firstName}.</span>
                            </>
                        )}
                    </h1>
                </div>

                {/* Bento stat pills */}
                <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                    {/* Scan usage pill with circular progress */}
                    <motion.div
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-lime-200 transition-all cursor-default"
                    >
                        <div className="relative flex items-center justify-center">
                            <CircularProgress value={scanCount} max={scanLimit} size={54} />
                            <span className="absolute text-[10px] font-black text-slate-700 rotate-[90deg]">{loading ? '–' : scanCount}</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scans Used</p>
                            <p className="text-sm font-bold text-slate-900">{loading ? '...' : `${scanCount} / ${scanLimit}`}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {tier === 'studio' ? 'Max 30m video' : tier === 'creator' ? 'Max 5m video' : 'Max 90s video'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Plan badge */}
                    <motion.div
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="flex flex-col justify-center bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-xl transition-all cursor-default min-w-[120px]"
                    >
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Plan</p>
                        <p className="text-sm font-bold mt-0.5">{loading ? '...' : getPlanLabel(tier)}</p>
                        <Link
                            href="/dashboard/upgrade"
                            className="text-[9px] font-black uppercase tracking-widest text-lime-400 hover:text-lime-300 transition-colors mt-1 flex items-center gap-1"
                        >
                            Upgrade <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── AI COMMAND CENTER ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
            >
                {/* glow halo */}
                <div className={`absolute inset-0 rounded-3xl transition-all duration-700 ${inputFocused ? 'bg-lime-400/10 blur-2xl scale-105' : 'bg-slate-200/30 blur-xl'}`} />

                <form
                    onSubmit={handleQuickScan}
                    className={`relative flex flex-col sm:flex-row items-center bg-white border rounded-3xl p-2 shadow-xl gap-2 transition-all duration-300 ${inputFocused ? 'border-lime-400 shadow-lime-500/20 shadow-2xl' : 'border-slate-200'}`}
                >
                    {/* Icon + Input */}
                    <div className="flex-1 w-full flex items-center gap-4 px-4 py-3 sm:py-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${inputFocused ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/40' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap className="w-4 h-4" />
                        </div>
                        <input
                            type="url"
                            required
                            value={quickScanUrl}
                            onChange={e => setQuickScanUrl(e.target.value)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            placeholder="Paste a TikTok, Reels, or Shorts URL..."
                            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 font-medium text-base sm:text-lg focus:outline-none focus:ring-0"
                        />
                    </div>

                    {/* Mode selector */}
                    <div className="w-full sm:w-auto px-4 sm:px-5 sm:border-l border-slate-100 relative flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                        <select
                            value={quickScanMode}
                            onChange={e => setQuickScanMode(e.target.value as any)}
                            className="w-full bg-transparent border-none text-slate-700 font-bold uppercase tracking-widest text-[10px] sm:text-xs focus:ring-0 cursor-pointer appearance-none outline-none py-3 sm:py-0 pr-6"
                        >
                            <option value="ad">Ad Intel</option>
                            <option value="content">Content Intel</option>
                            <option value="product-intel">Product Intel</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
                    </div>

                    {/* CTA Button */}
                    <button
                        type="submit"
                        className="w-full sm:w-auto m-1 sm:m-0 px-8 h-14 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all duration-200 shadow-lg hover:shadow-lime-500/30 whitespace-nowrap active:scale-95"
                    >
                        Analyze →
                    </button>
                </form>
            </motion.div>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* Recent Scans — 2/3 width */}
                <motion.div
                    className="lg:col-span-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={itemVariants} className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Scans</h2>
                        </div>
                        <Link
                            href="/dashboard/analyze"
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-lime-600 transition-colors"
                        >
                            New Scan <ArrowRight className="w-3 h-3" />
                        </Link>
                    </motion.div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <motion.div key={i} variants={itemVariants} className="h-[72px] bg-slate-100 rounded-2xl animate-pulse" />
                            ))
                        ) : sessions && sessions.length > 0 ? (
                            sessions.slice(0, 6).map((session: any) => (
                                <motion.div key={session.id} variants={itemVariants}>
                                    <Link
                                        href={`/dashboard/report/${session.id}`}
                                        className="group flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl hover:border-lime-300 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                                                <Play className="w-4 h-4 fill-current" />
                                                {/* ready dot */}
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 truncate pr-4 text-sm sm:text-base leading-tight">
                                                    {session.title || 'Untitled Scan'}
                                                </h4>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    {new Date(session.created_at || session.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-center"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                    <Video className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1.5">No scans yet</h4>
                                <p className="text-sm text-slate-400 mb-6 max-w-xs">
                                    Paste a video URL in the command bar above to run your first intelligence report.
                                </p>
                                <Link
                                    href="/dashboard/analyze"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all"
                                >
                                    Start Analyzing <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Sidebar Bento Cards — 1/3 width */}
                <motion.div
                    className="space-y-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.h2 variants={itemVariants} className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-slate-500" />
                        </div>
                        Tools
                    </motion.h2>

                    {/* Upload card */}
                    <motion.div variants={itemVariants}>
                        <Link
                            href="/dashboard/analyze"
                            className="group block relative overflow-hidden p-6 bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-3xl hover:shadow-2xl hover:shadow-slate-950/30 hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* decorative circle */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
                            <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-lime-500/10 rounded-full" />

                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">Upload</span>
                            <h4 className="font-bold text-lg leading-tight mb-2">Manual<br />Upload</h4>
                            <p className="text-slate-400 text-xs mb-5 leading-relaxed">Drop an MP4 for a deep-dive analysis report.</p>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/30">
                                Upload Video <ArrowRight className="w-3 h-3" />
                            </span>
                        </Link>
                    </motion.div>

                    {/* Scan modes info card */}
                    <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-slate-200 hover:shadow-md transition-all">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">Scan Modes</span>
                        <div className="space-y-3">
                            {[
                                { icon: '📣', name: 'Ad Intel', desc: 'Decode ad hooks & CTAs' },
                                { icon: '🎬', name: 'Content Intel', desc: 'Analyze storytelling structure' },
                                { icon: '📦', name: 'Product Intel', desc: 'Extract product insights' },
                            ].map(m => (
                                <div key={m.name} className="flex items-center gap-3 group cursor-default">
                                    <span className="text-lg">{m.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-none">{m.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Upgrade CTA — only show on free/creator */}
                    {(!tier || tier === 'free' || tier === 'creator') && (
                        <motion.div variants={itemVariants}>
                            <Link
                                href="/dashboard/upgrade"
                                className="group block relative overflow-hidden p-5 bg-gradient-to-br from-lime-500 to-emerald-600 text-white rounded-3xl hover:shadow-xl hover:shadow-lime-500/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                                <Sparkles className="w-5 h-5 mb-3 text-lime-100" />
                                <h4 className="font-bold text-sm leading-tight mb-1">Unlock Unlimited</h4>
                                <p className="text-lime-100 text-[11px] mb-4 leading-relaxed">More scans, longer videos, and priority processing.</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Upgrade Now <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
