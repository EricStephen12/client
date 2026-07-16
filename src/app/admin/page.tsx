'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

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
            <div className="mb-8">
                <h1 className="text-4xl font-serif text-slate-900 mb-2">Platform Overview</h1>
                <p className="text-slate-500 text-sm">Real-time metrics for your Eixora studio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-serif text-6xl group-hover:scale-110 transition-transform">💰</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Total Revenue</p>
                    <p className="text-4xl font-bold text-slate-900">${stats.revenue.yearly.toLocaleString()}</p>
                    <p className="text-xs text-lime-600 mt-2 font-medium">+{stats.revenue.monthly.toLocaleString()} this month</p>
                </div>

                {/* Users Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-serif text-6xl group-hover:scale-110 transition-transform">👥</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Active Users</p>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-lime-600 mt-2 font-medium">+{stats.signups.monthly} this month</p>
                </div>

                {/* Waitlist Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-serif text-6xl group-hover:scale-110 transition-transform">⏳</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Waitlist Size</p>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalWaitlist?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Pending mobile launch</p>
                </div>

                {/* Scans Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-serif text-6xl group-hover:scale-110 transition-transform">👁️</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Total Scans</p>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalScans.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">AI extractions completed</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Subscription Breakdown</h3>
                    <div className="space-y-4">
                        {stats.planBreakdown.map((plan: any) => (
                            <div key={plan.name} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 capitalize">{plan.name}</span>
                                <span className="text-sm font-bold text-slate-900">{plan.value} users</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
