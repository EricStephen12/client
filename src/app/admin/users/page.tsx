'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export default function AdminUsersPage() {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const token = await getToken();
                if (!token) {
                    console.error('Auth token unavailable');
                    setLoading(false);
                    return;
                }
                const res = await fetch('/api/main/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setUsers(await res.json());
                } else {
                    console.error(`Failed to fetch users: ${res.status} ${res.statusText}`);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading user directory...</span>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = planFilter === 'all' || (user.plan_type || 'free').toLowerCase() === planFilter.toLowerCase();
        return matchesSearch && matchesPlan;
    });

    const getInitials = (name: string, email: string) => {
        if (name) {
            const parts = name.split(' ');
            if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
            return name.substring(0, 2).toUpperCase();
        }
        return email ? email.substring(0, 2).toUpperCase() : '??';
    };

    const avatarGradients = [
        'from-lime-400 to-emerald-500 text-slate-900',
        'from-indigo-500 to-purple-600 text-white',
        'from-blue-500 to-cyan-500 text-white',
        'from-amber-400 to-orange-500 text-slate-900',
        'from-pink-500 to-rose-500 text-white'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-lime-500" />
                        <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Directory</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Users</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage members, view usage limits, and monitor accounts.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 shadow-sm self-start">
                    <span className="w-2 h-2 rounded-full bg-lime-500" />
                    Total Members: <span className="font-bold text-slate-900">{users.length}</span>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Filter by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                    <select 
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-slate-300 cursor-pointer"
                    >
                        <option value="all">All Tiers</option>
                        <option value="free">Free</option>
                        <option value="creator">Creator</option>
                        <option value="studio">Studio</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Member</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Plan Tier</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Scans Used</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Status</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No matching users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => {
                                    const grad = avatarGradients[idx % avatarGradients.length];
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                                                        {getInitials(user.name, user.email)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                                                            {user.name || 'Anonymous User'}
                                                            {user.is_admin && (
                                                                <ShieldCheck className="w-4 h-4 text-lime-600 shrink-0" aria-label="Admin User" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${
                                                    user.plan_type === 'studio' ? 'bg-purple-50 text-purple-700 border border-purple-200/60' :
                                                    user.plan_type === 'creator' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                                                    'bg-slate-100 text-slate-600 border border-slate-200/60'
                                                }`}>
                                                    {user.plan_type === 'studio' && <Sparkles className="w-3 h-3 mr-1 text-purple-500" />}
                                                    {user.plan_type || 'free'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800 text-sm">{user.scans || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    user.status === 'active' || !user.status ? 'text-lime-700 bg-lime-50' : 'text-slate-500 bg-slate-100'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' || !user.status ? 'bg-lime-500' : 'bg-slate-400'}`} />
                                                    {user.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

