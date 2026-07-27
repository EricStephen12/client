'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const { getToken, userId: clerkUserId } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'support' | 'intel' | 'health'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [health, setHealth] = useState<any>(null);
    const [prompt, setPrompt] = useState<any>({
        roleDescriptionAd: "You are the most expensive Creative Director in digital advertising. You charge $2,000/hour. Clients pay because you see what others miss.",
        roleDescriptionContent: "You are the most sought-after Viral Content Strategist and Storyteller. You charge $2,000/hour. Clients pay because you decode virality and pacing.",
        modeInstructionAd: "YOU ARE WATCHING A VIDEO AD. Your goal is to analyze its hook power, pacing, conversion triggers, and ad strength.",
        modeInstructionContent: "YOU ARE WATCHING A STORYTELLING/ORGANIC VIDEO (TikTok, Reel, or Short). Your goal is to analyze its hook power, narrative pacing, engagement triggers, and virality potential.",
        structureInstructions: "Your analysis must be structured exactly around the following sections..."
    });
    const [isSavingPrompt, setIsSavingPrompt] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken();
                if (!token && !clerkUserId) {
                    router.push('/login');
                    return;
                }

                const res = await fetch(`/api/main/api/me?userId=${clerkUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const profileData = await res.json();
                    if (profileData.is_admin || (user?.publicMetadata as any)?.is_admin) {
                        fetchAllData(token);
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    router.push('/login');
                }
            } catch (err) {
                router.push('/dashboard');
            }
        };
        checkAccess();
    }, [isLoaded, clerkUserId, user]);

    const fetchAllData = async (explicitToken?: string | null) => {
        try {
            const token = explicitToken || await getToken();
            const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
            const [statsRes, usersRes, ticketsRes, healthRes, promptRes] = await Promise.all([
                fetch(`/api/main/api/admin/stats`, { headers }),
                fetch(`/api/main/api/admin/users`, { headers }),
                fetch(`/api/main/api/admin/support`, { headers }),
                fetch(`/api/main/api/health`),
                fetch(`/api/main/api/admin/prompt`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (ticketsRes.ok) setTickets(await ticketsRes.json());
            if (healthRes.ok) setHealth(await healthRes.json());
            if (promptRes.ok) {
                const p = await promptRes.json();
                if (p.prompt) setPrompt(p.prompt);
            }

            setLoading(false);
        } catch (err) {

        }
    };

    const getAdminHeaders = async () => {
        const token = await getToken();
        const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
        return { token, headers };
    };

    const handleAddCredits = async (targetUserId: string) => {
        setActionLoading(targetUserId);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/add-credits`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 50 })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromote = async (targetUserId: string, tier: string) => {
        setActionLoading(targetUserId);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/update-tier`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleAdmin = async (targetUserId: string, isAdmin: boolean) => {
        setActionLoading(targetUserId);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/make-admin`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_admin: isAdmin })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateStatus = async (targetUserId: string, status: string) => {
        setActionLoading(targetUserId);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}/update-status`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (targetUserId: string) => {
        if (!confirm('Are you sure you want to completely delete this user and all their data? This cannot be undone.')) return;
        setActionLoading(targetUserId);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/users/${targetUserId}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) fetchAllData(token);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResolveTicket = async (ticketId: string) => {
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/support/${ticketId}/resolve`, {
                method: 'PATCH',
                headers
            });
            if (res.ok) fetchAllData(token);
        } catch (err) { }
    };

    const handleSavePrompt = async () => {
        setIsSavingPrompt(true);
        try {
            const { token, headers } = await getAdminHeaders();
            const res = await fetch(`/api/main/api/admin/prompt`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(prompt)
            });
            if (!res.ok) alert('Failed to save prompt');
            else alert('Prompt saved successfully!');
        } catch (err) {
            alert('Error saving prompt');
        } finally {
            setIsSavingPrompt(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lime-600"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Securing Access...</p>
        </div>
    );

    return (
        <div className="space-y-8 sm:space-y-12 pb-20 px-1 sm:px-2">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 pt-2 sm:pt-6 border-b border-slate-100 pb-8">
                <div className="space-y-3">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-lime-600 mb-1 block">Master Control 💎🛡️</span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif italic text-gray-900 tracking-tight leading-tight">Superuser <br className="sm:hidden" /> Command Center.</h1>
                </div>
                <div className="flex bg-white p-1 rounded-xl sm:rounded-2xl border border-lime-100 shadow-sm overflow-x-auto hide-scrollbar self-start md:self-auto w-full sm:w-auto">
                    {['overview', 'users', 'support', 'intel', 'health'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-shrink-0 px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lime-600 text-white shadow-lg' : 'text-gray-400 hover:text-lime-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' && (
                <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-lime-600', desc: 'Total accounts registered' },
                            { label: 'Platform Scans', value: stats?.totalScans || 0, color: 'text-lime-600', desc: 'Viral blueprints extracted' },
                            { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, color: 'text-orange-600', desc: 'Requires support attention' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-lime-100 shadow-sm relative overflow-hidden group hover:border-lime-300 transition-all duration-300">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-4">{stat.label}</p>
                                <p className={`text-3xl sm:text-5xl font-serif italic ${stat.color} relative z-10`}>{stat.value}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-light">{stat.desc}</p>
                                <div className="absolute right-0 bottom-0 opacity-5 text-8xl font-serif select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">✦</div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Performance dossier */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-500/20 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-[15vw] font-serif pointer-events-none select-none">$$</div>
                        <div className="relative z-10 mb-8 border-b border-white/10 pb-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 mb-2 block">Premium Financial Dossier</span>
                            <h2 className="text-xl sm:text-2xl font-serif italic font-bold">Revenue Stream Tracker</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
                            {[
                                { period: 'Daily Revenue', value: stats?.revenue?.daily, color: 'text-green-400' },
                                { period: 'Weekly Revenue', value: stats?.revenue?.weekly, color: 'text-emerald-400' },
                                { period: 'Monthly Revenue', value: stats?.revenue?.monthly, color: 'text-teal-400' },
                                { period: 'Yearly Revenue', value: stats?.revenue?.yearly, color: 'text-cyan-400' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-lime-500/30 transition-all">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{item.period}</p>
                                    <p className={`text-2xl sm:text-3xl font-mono font-bold ${item.color}`}>
                                        ${typeof item.value === 'number' ? item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User growth stats */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-lime-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 mb-8 border-b border-lime-50 pb-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-600 mb-2 block">Acquisition Engine</span>
                            <h2 className="text-xl sm:text-2xl font-serif italic text-gray-900">User Growth Speed</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
                            {[
                                { period: 'Daily Signups', value: stats?.signups?.daily, color: 'text-lime-600', unit: 'new users' },
                                { period: 'Weekly Signups', value: stats?.signups?.weekly, color: 'text-slate-600', unit: 'new users' },
                                { period: 'Monthly Signups', value: stats?.signups?.monthly, color: 'text-lime-600', unit: 'new users' },
                                { period: 'Yearly Signups', value: stats?.signups?.yearly, color: 'text-pink-600', unit: 'new users' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-lime-50/20 p-5 sm:p-6 rounded-2xl border border-lime-50/50 hover:border-lime-200 transition-all">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{item.period}</p>
                                    <p className={`text-3xl font-serif italic font-bold ${item.color}`}>
                                        +{item.value || 0}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-1 font-light">{item.unit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-lime-100 shadow-sm overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-lime-50/30 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-lime-50">
                                <th className="p-4 sm:p-6">User / Identity</th>
                                <th className="p-4 sm:p-6">Tier & Scans</th>
                                <th className="p-4 sm:p-6">Role & Status</th>
                                <th className="p-4 sm:p-6">Onboarding Data</th>
                                <th className="p-4 sm:p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-lime-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-lime-50/20 transition-colors">
                                    <td className="p-4 sm:p-6">
                                        <p className="text-sm font-bold text-gray-900">{u.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 font-mono italic">{u.email}</p>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`self-start px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.plan_type === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-lime-100 text-lime-600'}`}>
                                                {u.plan_type}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono mt-1">{u.credits_remaining || 0} creds / {u.scans || 0} scans</span>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <div className="flex flex-col gap-1 text-[10px] uppercase font-bold tracking-wider">
                                            <span className={u.is_admin ? 'text-lime-600' : 'text-gray-400'}>{u.is_admin ? 'Admin' : 'User'}</span>
                                            <span className={u.status === 'blocked' ? 'text-red-500' : u.status === 'suspended' ? 'text-orange-500' : 'text-green-500'}>{u.status || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                                            {u.brand_niche && <span><strong className="text-lime-600 uppercase">Niche:</strong> {u.brand_niche}</span>}
                                            {u.primary_goal && <span><strong className="text-lime-600 uppercase">Goal:</strong> {u.primary_goal}</span>}
                                            {u.source && <span><strong className="text-lime-600 uppercase">Source:</strong> {u.source}</span>}
                                            {!u.brand_niche && !u.primary_goal && !u.source && <span className="italic text-gray-400">Incomplete</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handlePromote(u.id, u.plan_type === 'studio' ? 'free' : 'studio')}
                                                    disabled={actionLoading === u.id}
                                                    className="px-3 py-1 bg-lime-100 text-lime-600 rounded-lg text-[8px] font-black uppercase hover:bg-lime-600 hover:text-white transition-all disabled:opacity-30"
                                                >
                                                    {u.plan_type === 'studio' ? 'Revoke Pro' : 'Make Pro'}
                                                </button>
                                                <button
                                                    onClick={() => handleAddCredits(u.id)}
                                                    disabled={actionLoading === u.id}
                                                    className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black uppercase hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                                                >
                                                    +50 Credits
                                                </button>
                                                <button
                                                    onClick={() => handleToggleAdmin(u.id, !u.is_admin)}
                                                    disabled={actionLoading === u.id}
                                                    className="px-3 py-1 bg-lime-100 text-lime-600 rounded-lg text-[8px] font-black uppercase hover:bg-lime-600 hover:text-white transition-all disabled:opacity-30"
                                                >
                                                    {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                {u.status !== 'suspended' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(u.id, 'suspended')}
                                                        disabled={actionLoading === u.id}
                                                        className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[8px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all disabled:opacity-30"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {u.status !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(u.id, 'blocked')}
                                                        disabled={actionLoading === u.id}
                                                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                                {u.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(u.id, 'active')}
                                                        disabled={actionLoading === u.id}
                                                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black uppercase hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                                                    >
                                                        Unblock/Restore
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={actionLoading === u.id}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase hover:bg-red-700 transition-all disabled:opacity-30 ml-auto"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'support' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {tickets.length === 0 && <div className="p-12 text-center text-gray-400 font-serif italic border-2 border-dashed border-lime-100 rounded-2xl sm:rounded-3xl">No support tickets found in the secure vault.</div>}
                    {tickets.map(t => (
                        <div key={t.id} className={`bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${t.status === 'open' ? 'border-orange-200 shadow-orange-50' : 'border-lime-100'} shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6`}>
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                                    <h3 className="text-lg sm:text-xl font-serif italic text-gray-900">{t.subject}</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{t.message}</p>
                                <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>From: {t.user_name || t.email || 'Anonymous'}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{new Date(t.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            {t.status === 'open' && (
                                <button
                                    onClick={() => handleResolveTicket(t.id)}
                                    className="w-full sm:w-auto px-6 py-3 bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-100 hover:scale-105 transition-transform"
                                >
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'intel' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-lime-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-serif italic text-gray-900">AI Vision Analyzer Core Prompt</h2>
                                <p className="text-xs text-gray-500 mt-1">Change the psychological principles and grading matrix used by the AI engine.</p>
                            </div>
                            <button onClick={handleSavePrompt} disabled={isSavingPrompt} className="px-6 py-3 bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-100 hover:scale-105 transition-transform disabled:opacity-50">
                                {isSavingPrompt ? 'Saving...' : 'Save AI Intel'}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Role Description (Ad Mode)</label>
                                <textarea value={prompt.roleDescriptionAd} onChange={e => setPrompt({...prompt, roleDescriptionAd: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[80px]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Role Description (Content Mode)</label>
                                <textarea value={prompt.roleDescriptionContent} onChange={e => setPrompt({...prompt, roleDescriptionContent: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[80px]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Mode Instruction (Ad Mode)</label>
                                <textarea value={prompt.modeInstructionAd} onChange={e => setPrompt({...prompt, modeInstructionAd: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[80px]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Mode Instruction (Content Mode)</label>
                                <textarea value={prompt.modeInstructionContent} onChange={e => setPrompt({...prompt, modeInstructionContent: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[80px]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Structure & Matrix Rules</label>
                                <textarea value={prompt.structureInstructions} onChange={e => setPrompt({...prompt, structureInstructions: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[400px] font-mono whitespace-pre" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'health' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-lime-100 shadow-sm">
                        <h3 className="text-lg sm:text-xl font-serif italic text-gray-900 mb-6">Security Engine Health</h3>
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
                                <span className="text-lime-500 font-black">NEON CLOUD ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
