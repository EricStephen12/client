'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import {
    DollarSign, Users, ScanLine, Hourglass,
    TrendingUp, TrendingDown, Minus,
    ArrowUpRight, Sparkles, Clock, UserPlus, CreditCard,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Period = 'today' | 'weekly' | 'monthly' | 'yearly';

interface Stats {
    totalUsers: number;
    totalScans: number;
    totalWaitlist: number;
    planBreakdown: { name: string; value: number }[];
    signups: Record<Period, number> & { change: Record<Period, number> };
    revenue: Record<Period, number> & { change: Record<Period, number> };
    scans:   Record<Period, number> & { change: Record<Period, number> };
    signupTrend:  { date: string; count: number }[];
    revenueTrend: { date: string; amount: number }[];
    recentPayments: { amount: number; name: string; email: string; plan: string; date: string }[];
    recentSignups:  { name: string; email: string; plan: string; date: string }[];
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return <div className="w-20 h-8" />;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 80, h = 32;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs>
                <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── Change badge ──────────────────────────────────────────────────────────────
function ChangeBadge({ value }: { value: number }) {
    if (value === 0) return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            <Minus className="w-2.5 h-2.5" /> 0%
        </span>
    );
    const up = value > 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {up ? '+' : ''}{value}%
        </span>
    );
}

// ── Plan pill ─────────────────────────────────────────────────────────────────
function PlanPill({ plan }: { plan: string }) {
    const styles: Record<string, string> = {
        studio:  'bg-purple-50 text-purple-700 border-purple-200/60',
        creator: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
        free:    'bg-slate-100 text-slate-600 border-slate-200/60',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${styles[plan] ?? styles.free}`}>
            {plan}
        </span>
    );
}

// ── Relative time ─────────────────────────────────────────────────────────────
function reltime(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Donut chart ───────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#94a3b8', '#84cc16', '#6366f1', '#f59e0b', '#a855f7'];

function Donut({ data, total }: { data: { name: string; value: number }[]; total: number }) {
    let offset = 0;
    return (
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {data.map((p, i) => {
                const pct = (p.value / total) * 100;
                const el = (
                    <circle key={p.name} cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                        strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={`-${offset}`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                    />
                );
                offset += pct;
                return el;
            })}
        </svg>
    );
}

// ── Period labels ─────────────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string }[] = [
    { key: 'today',   label: 'Today' },
    { key: 'weekly',  label: '7 days' },
    { key: 'monthly', label: '30 days' },
    { key: 'yearly',  label: '12 months' },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
    const { getToken } = useAuth();
    const [stats, setStats]       = useState<Stats | null>(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);
    const [period, setPeriod]     = useState<Period>('monthly');
    const [tab, setTab]           = useState<'signups' | 'payments'>('signups');

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (!token) { setError('Auth token unavailable — refresh the page.'); setLoading(false); return; }
                const res = await fetch('/api/main/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setStats(await res.json());
                } else {
                    const body = await res.json().catch(() => ({}));
                    setError(`Server returned ${res.status}: ${body?.error || res.statusText}`);
                }
            } catch (e: any) {
                setError(`Network error: ${e.message}`);
            } finally {
                setLoading(false);
            }
        })();
    }, [getToken]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Loading metrics...</span>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-slate-700 font-semibold">Failed to load statistics</p>
            <p className="text-xs text-red-500 font-mono bg-red-50 px-3 py-1.5 rounded-lg">
                {error || 'Unknown error — check browser console and server logs'}
            </p>
        </div>
    );

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const totalForDonut = stats.planBreakdown.reduce((s, p) => s + p.value, 0) || 1;
    const revSparkData  = stats.revenueTrend?.map(t => t.amount) ?? [];
    const sigSparkData  = stats.signupTrend?.map(t => t.count)  ?? [];

    // Safe accessors — handle old API shape (no .change) and new shape
    const revChange  = (p: Period) => stats.revenue?.change?.[p]  ?? 0;
    const sigChange  = (p: Period) => stats.signups?.change?.[p]  ?? 0;
    const scanChange = (p: Period) => stats.scans?.change?.[p]    ?? 0;
    const revVal     = (p: Period) => stats.revenue?.[p]          ?? stats.revenue?.monthly ?? 0;
    const sigVal     = (p: Period) => stats.signups?.[p]          ?? stats.signups?.monthly ?? 0;
    const scanVal    = (p: Period) => stats.scans?.[p]            ?? 0;

    // ── Metric cards driven by selected period ────────────────────────────────
    const metricCards = [
        {
            label:      'Revenue',
            value:      `$${revVal(period).toLocaleString()}`,
            change:     revChange(period),
            sub:        period === 'today' ? 'today' : period === 'weekly' ? 'last 7 days' : period === 'monthly' ? 'last 30 days' : 'last 12 months',
            icon:       DollarSign,
            sparkData:  revSparkData,
            sparkColor: '#84cc16',
            iconBg:     'bg-lime-50',
            iconColor:  'text-lime-600',
            accent:     'from-lime-400 to-emerald-400',
        },
        {
            label:      'New Users',
            value:      sigVal(period).toLocaleString(),
            change:     sigChange(period),
            sub:        `vs previous ${period === 'today' ? 'day' : period === 'weekly' ? '7 days' : period === 'monthly' ? '30 days' : 'year'}`,
            icon:       Users,
            sparkData:  sigSparkData,
            sparkColor: '#6366f1',
            iconBg:     'bg-indigo-50',
            iconColor:  'text-indigo-600',
            accent:     'from-indigo-400 to-violet-400',
        },
        {
            label:      'Scans',
            value:      scanVal(period).toLocaleString(),
            change:     scanChange(period),
            sub:        'AI extractions',
            icon:       ScanLine,
            sparkData:  [],
            sparkColor: '#a855f7',
            iconBg:     'bg-purple-50',
            iconColor:  'text-purple-600',
            accent:     'from-purple-400 to-pink-400',
        },
        {
            label:      'Waitlist',
            value:      (stats.totalWaitlist ?? 0).toLocaleString(),
            change:     0,
            sub:        'pending mobile launch',
            icon:       Hourglass,
            sparkData:  [],
            sparkColor: '#f59e0b',
            iconBg:     'bg-amber-50',
            iconColor:  'text-amber-600',
            accent:     'from-amber-400 to-orange-400',
        },
    ];

    return (
        <div className="space-y-8">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-lime-500" />
                        <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">{greeting}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening with your Eixora studio.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shadow-sm self-start">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* ── Period selector ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-1 w-fit shadow-sm">
                {PERIODS.map(p => (
                    <button
                        key={p.key}
                        onClick={() => setPeriod(p.key)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            period === p.key
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* ── KPI cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {metricCards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label}
                            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                {card.sparkData.length > 1 && (
                                    <Sparkline data={card.sparkData} color={card.sparkColor} />
                                )}
                            </div>

                            <p className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{card.value}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <ChangeBadge value={card.change} />
                                <span className="text-[11px] text-slate-400 font-medium">{card.sub}</span>
                            </div>

                            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400 mt-3">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── Totals summary bar ────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Users',  value: stats.totalUsers.toLocaleString(),  color: 'text-indigo-600' },
                    { label: 'Total Scans',  value: stats.totalScans.toLocaleString(),  color: 'text-purple-600' },
                    { label: 'Total Revenue',value: `$${(stats.revenue?.yearly ?? stats.revenue?.monthly ?? 0).toLocaleString()}`, color: 'text-lime-600' },
                ].map(item => (
                    <div key={item.label} className="bg-white rounded-2xl px-6 py-4 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div>
                            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bottom grid ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Subscription mix */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-5">Subscription Mix</h3>
                    <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32">
                            <Donut data={stats.planBreakdown} total={totalForDonut} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-900">{totalForDonut}</span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Users</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {stats.planBreakdown.map((plan, i) => (
                            <div key={plan.name} className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                    <span className="text-sm font-medium text-slate-700 capitalize">{plan.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{plan.value}</span>
                                    <span className="text-[10px] text-slate-400 font-medium w-8 text-right">
                                        {Math.round((plan.value / totalForDonut) * 100)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity feed */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col">
                    {/* Tab header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <button onClick={() => setTab('signups')}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${tab === 'signups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                Signups
                            </button>
                            <button onClick={() => setTab('payments')}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${tab === 'payments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                Payments
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-lime-600 bg-lime-50 px-2.5 py-1 rounded-full">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-500" />
                            </span>
                            Live
                        </div>
                    </div>

                    {/* Signups tab */}
                    {tab === 'signups' && (
                        <div className="space-y-2 flex-1">
                            {(stats.recentSignups ?? []).length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                                    No signups yet
                                </div>
                            ) : (stats.recentSignups ?? []).map((u, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{u.name || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <PlanPill plan={u.plan} />
                                        <span className="text-[10px] text-slate-400">{reltime(u.date)}</span>
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payments tab */}
                    {tab === 'payments' && (
                        <div className="space-y-2 flex-1">
                            {(stats.recentPayments ?? []).length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                                    No payments yet
                                </div>
                            ) : (stats.recentPayments ?? []).map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{p.name || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-400 truncate">{p.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-sm font-bold text-emerald-600">${p.amount.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400">{reltime(p.date)}</span>
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-lime-500 transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
