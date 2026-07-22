'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { DollarSign, Users, Hourglass, ScanLine, TrendingUp, TrendingDown, Activity, ArrowUpRight, Sparkles, Clock, UserPlus } from 'lucide-react';

function MiniSparkline({ data, color }: { data: number[], color: string }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 80, h = 32;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${h} ${points} ${w},${h}`;
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-${color})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function AdminDashboardPage() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = await getToken();
                const res = await fetch('/api/main/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading metrics...</span>
                </div>
            </div>
        );
    }

    if (!stats) return <p className="text-slate-500 text-center py-20">Failed to load statistics.</p>;

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Build sparkline data from trends
    const revSparkData = stats.revenueTrend?.map((t: any) => t.amount) || [];
    const signupSparkData = stats.signupTrend?.map((t: any) => t.count) || [];

    const metricCards = [
        {
            label: 'Total Revenue',
            value: `$${stats.revenue.yearly.toLocaleString()}`,
            change: `+$${stats.revenue.monthly.toLocaleString()}`,
            subtitle: 'this month',
            icon: DollarSign,
            trend: 'up' as const,
            sparkData: revSparkData,
            sparkColor: '#84cc16',
            iconBg: 'bg-lime-50',
            iconColor: 'text-lime-600',
            borderColor: 'from-lime-400 to-emerald-400',
        },
        {
            label: 'Active Users',
            value: stats.totalUsers.toLocaleString(),
            change: `+${stats.signups.monthly}`,
            subtitle: 'this month',
            icon: Users,
            trend: 'up' as const,
            sparkData: signupSparkData,
            sparkColor: '#6366f1',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            borderColor: 'from-indigo-400 to-violet-400',
        },
        {
            label: 'Waitlist',
            value: (stats.totalWaitlist || 0).toLocaleString(),
            change: null,
            subtitle: 'pending mobile launch',
            icon: Hourglass,
            trend: null,
            sparkData: [],
            sparkColor: '#f59e0b',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            borderColor: 'from-amber-400 to-orange-400',
        },
        {
            label: 'Total Scans',
            value: stats.totalScans.toLocaleString(),
            change: null,
            subtitle: 'AI extractions',
            icon: ScanLine,
            trend: null,
            sparkData: [],
            sparkColor: '#a855f7',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'from-purple-400 to-pink-400',
        },
    ];

    // Subscription donut
    const totalForDonut = stats.planBreakdown.reduce((sum: number, p: any) => sum + p.value, 0) || 1;
    const donutColors = ['#94a3b8', '#84cc16', '#6366f1', '#f59e0b', '#a855f7'];

    return (
        <div className="space-y-8">
            {/* Greeting Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-lime-500" />
                        <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">{greeting}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening with your Eixora studio today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shadow-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {metricCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                            {/* Top gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                {card.sparkData.length > 1 && (
                                    <MiniSparkline data={card.sparkData} color={card.sparkColor} />
                                )}
                            </div>
                            
                            <p className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">{card.value}</p>
                            
                            <div className="flex items-center gap-2">
                                {card.change && card.trend === 'up' && (
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-lime-600 bg-lime-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        {card.change}
                                    </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-medium">{card.subtitle}</span>
                            </div>
                            
                            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400 mt-3">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-5">Subscription Mix</h3>
                    
                    {/* Donut Chart */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {(() => {
                                    let offset = 0;
                                    return stats.planBreakdown.map((plan: any, i: number) => {
                                        const pct = (plan.value / totalForDonut) * 100;
                                        const dashArray = `${pct} ${100 - pct}`;
                                        const el = (
                                            <circle
                                                key={plan.name}
                                                cx="18" cy="18" r="15.915"
                                                fill="none"
                                                stroke={donutColors[i % donutColors.length]}
                                                strokeWidth="3"
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={`-${offset}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-700"
                                            />
                                        );
                                        offset += pct;
                                        return el;
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-900">{totalForDonut}</span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Users</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {stats.planBreakdown.map((plan: any, i: number) => (
                            <div key={plan.name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutColors[i % donutColors.length] }} />
                                    <span className="text-sm font-medium text-slate-700 capitalize">{plan.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{plan.value}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{Math.round((plan.value / totalForDonut) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-lime-600 bg-lime-50 px-2.5 py-1 rounded-full">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-500"></span>
                            </span>
                            Live
                        </div>
                    </div>

                    {stats.signupTrend && stats.signupTrend.length > 0 ? (
                        <div className="space-y-3 flex-1">
                            {stats.signupTrend.slice(-6).reverse().map((entry: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500 group-hover:scale-110 transition-transform">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {entry.count} new signup{entry.count !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                            <Activity className="w-8 h-8 text-slate-300 mb-3" />
                            <h4 className="text-sm font-bold text-slate-700 mb-1">No activity yet</h4>
                            <p className="text-xs text-slate-500 max-w-xs">Signups and scans will appear here as they happen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

