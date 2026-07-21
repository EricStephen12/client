'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { DollarSign, Users, Hourglass, ScanLine, TrendingUp, Activity, ArrowRight } from 'lucide-react';

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
                <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return <p>Failed to load statistics.</p>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Platform Overview</h1>
                    <p className="text-slate-500 text-sm">Real-time metrics for your Eixora studio.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                    <Activity className="w-4 h-4 text-lime-500" />
                    Live View
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Total Revenue</p>
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-lime-600 transition-colors">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">${stats.revenue.yearly.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-lime-600 bg-lime-50 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{stats.revenue.monthly.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-slate-400">this month</span>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Active Users</p>
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-500 transition-colors">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{stats.signups.monthly}</span>
                        </div>
                        <span className="text-xs text-slate-400">this month</span>
                    </div>
                </div>

                {/* Waitlist Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Waitlist Size</p>
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-amber-500 transition-colors">
                            <Hourglass className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{stats.totalWaitlist?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500 font-medium">Pending mobile launch</p>
                </div>

                {/* Scans Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Total Scans</p>
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-purple-500 transition-colors">
                            <ScanLine className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{stats.totalScans.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-medium">AI extractions completed</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-1">
                    <h3 className="font-bold text-slate-900 mb-6">Subscription Breakdown</h3>
                    
                    {/* Visual Progress Bar */}
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 mb-6">
                        {stats.planBreakdown.map((plan: any, i: number) => (
                            <div 
                                key={plan.name}
                                style={{ width: `${(plan.value / stats.totalUsers) * 100}%` }}
                                className={`h-full ${i === 0 ? 'bg-slate-300' : 'bg-lime-500'}`}
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        {stats.planBreakdown.map((plan: any, i: number) => (
                            <div key={plan.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-slate-300' : 'bg-lime-500'}`} />
                                    <span className="text-sm font-medium text-slate-600 capitalize">{plan.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{plan.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Recent Activity</h3>
                        <button className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Activity className="w-8 h-8 text-slate-300 mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 mb-1">Live Feed Connecting...</h4>
                        <p className="text-xs text-slate-500 max-w-xs">Recent signups, scans, and waitlist entries will stream here in real-time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
