'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const { getToken, userId: clerkUserId } = useAuth();
    const router = useRouter();

    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'support' | 'health'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoaded) return;
            try {
                const token = localStorage.getItem('admin_token') || await getToken();
                if (!token && !clerkUserId) {
                    router.push('/admin-login');
                    return;
                }

                const res = await fetch(`/api/main/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const profileData = await res.json();
                    if (profileData.is_admin || profileData.is_master_admin || (user?.publicMetadata as any)?.is_admin) {
                        fetchAllData(token);
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    router.push('/admin-login');
                }
            } catch (err) {
                router.push('/dashboard');
            }
        };
        checkAccess();
    }, [isLoaded, clerkUserId, user]);

    const fetchAllData = async (explicitToken?: string | null) => {
        try {
            const token = explicitToken || localStorage.getItem('admin_token') || await getToken();
            const [statsRes, usersRes, ticketsRes, healthRes] = await Promise.all([
                fetch(`/api/main/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/main/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/main/api/admin/support`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/main/api/health`)
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (ticketsRes.ok) setTickets(await ticketsRes.json());
            if (healthRes.ok) setHealth(await healthRes.json());

            setLoading(false);
        } catch (err) {
            console.error('Fetch failed', err);
        }
    };

    // --- SUPERUSER ACTIONS ---
    const handleAddCredits = async (targetUserId: string) => {
        setActionLoading(targetUserId);
        try {
            const token = localStorage.getItem('admin_token') || await getToken();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/add-credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: 50 })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromote = async (targetUserId: string) => {
        setActionLoading(targetUserId);
        try {
            const token = localStorage.getItem('admin_token') || await getToken();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/update-tier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tier: 'agency' })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResolveTicket = async (ticketId: string) => {
        try {
            const token = localStorage.getItem('admin_token') || await getToken();
            const res = await fetch(`/api/main/api/admin/support/${ticketId}/resolve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchAllData(token);
        } catch (err) { }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-600 mb-2 block tracking-widest">Master Control 💎🛡️</span>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-gray-900 tracking-tight">Superuser Command Center.</h1>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-purple-100 shadow-sm">
                    {['overview', 'users', 'support', 'health'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-purple-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-purple-600' },
                            { label: 'Platform Scans', value: stats?.totalScans || 0, color: 'text-blue-600' },
                            { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, color: 'text-orange-600' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{stat.label}</p>
                                <p className={`text-5xl font-serif italic ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-purple-50/30 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-purple-50">
                                <th className="p-6">User / Identity</th>
                                <th className="p-6">Tier</th>
                                <th className="p-6">Usage</th>
                                <th className="p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-purple-50/20 transition-colors">
                                    <td className="p-6">
                                        <p className="text-sm font-bold text-gray-900">{u.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 font-mono italic">{u.email}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.plan_type === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-600'}`}>
                                            {u.plan_type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs text-gray-500 font-mono">{u.scans} scans</td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePromote(u.id)}
                                                disabled={actionLoading === u.id || u.plan_type === 'agency'}
                                                className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-[8px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all disabled:opacity-30"
                                            >
                                                {actionLoading === u.id ? '...' : 'Promote'}
                                            </button>
                                            <button
                                                onClick={() => handleAddCredits(u.id)}
                                                disabled={actionLoading === u.id}
                                                className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black uppercase hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                                            >
                                                +50 Credits
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SUPPORT TAB */}
            {activeTab === 'support' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {tickets.length === 0 && <div className="p-12 text-center text-gray-400 font-serif italic border-2 border-dashed border-purple-100 rounded-3xl">No support tickets found in the secure vault.</div>}
                    {tickets.map(t => (
                        <div key={t.id} className={`bg-white p-8 rounded-3xl border ${t.status === 'open' ? 'border-orange-200 shadow-orange-50' : 'border-purple-100'} shadow-sm flex justify-between items-start`}>
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                                    <h3 className="text-xl font-serif italic text-gray-900">{t.subject}</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{t.message}</p>
                                <div className="flex gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>From: {t.user_name || t.email || 'Anonymous'}</span>
                                    <span>•</span>
                                    <span>{new Date(t.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            {t.status === 'open' && (
                                <button
                                    onClick={() => handleResolveTicket(t.id)}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-105 transition-transform"
                                >
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* HEALTH TAB */}
            {activeTab === 'health' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm">
                        <h3 className="text-xl font-serif italic text-gray-900 mb-6">Security Engine Health</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-gray-400 uppercase tracking-widest">Status</span>
                                <span className="text-green-500 font-black">OPERATIONAL</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-gray-400 uppercase tracking-widest">Latency</span>
                                <span className="text-gray-900">{health?.latency || 'Calculating...'} ms</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-gray-400 uppercase tracking-widest">Database</span>
                                <span className="text-blue-500 font-black">NEON CLOUD ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
