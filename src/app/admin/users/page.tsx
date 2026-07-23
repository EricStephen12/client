'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import {
    Users, Search, ShieldCheck, Sparkles, Filter,
    X, ChevronRight, ScanLine,
    ShieldOff, Ban, CheckCircle2, Trash2,
} from 'lucide-react';

type User = {
    id: string;
    name: string;
    email: string;
    plan_type: string;
    scans: number;
    credits_remaining: number;
    is_admin: boolean;
    status: string;
    created_at: string;
    brand_niche: string;
    primary_goal: string;
    source: string;
};

const PLAN_STYLES: Record<string, string> = {
    studio:  'bg-purple-50 text-purple-700 border-purple-200/60',
    creator: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    free:    'bg-slate-100 text-slate-600 border-slate-200/60',
};

const AVATAR_GRADS = [
    'from-lime-400 to-emerald-500 text-slate-900',
    'from-indigo-500 to-purple-600 text-white',
    'from-blue-500 to-cyan-500 text-white',
    'from-amber-400 to-orange-500 text-slate-900',
    'from-pink-500 to-rose-500 text-white',
];

function initials(name: string, email: string) {
    if (name) {
        const p = name.split(' ');
        return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : '??';
}

// ── User Drawer ───────────────────────────────────────────────────────────────
function UserDrawer({
    user, onClose, onUpdate, getToken,
}: {
    user: User;
    onClose: () => void;
    onUpdate: (updated: User) => void;
    getToken: () => Promise<string | null>;
}) {
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [scanAmount, setScanAmount] = useState(10);

    const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    async function api(path: string, method = 'POST', body?: object) {
        setBusy(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/admin${path}`, {
                method,
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
        } finally {
            setBusy(false);
        }
    }

    async function changePlan(tier: string) {
        await api(`/users/${user.id}/update-tier`, 'POST', { tier });
        onUpdate({ ...user, plan_type: tier });
        notify(`Plan changed to ${tier}`);
    }

    async function addScans() {
        await api(`/users/${user.id}/add-credits`, 'POST', { amount: scanAmount });
        onUpdate({ ...user, credits_remaining: (user.credits_remaining || 0) + scanAmount });
        notify(`Added ${scanAmount} scans`);
    }

    async function toggleAdmin() {
        const next = !user.is_admin;
        await api(`/users/${user.id}/make-admin`, 'POST', { is_admin: next });
        onUpdate({ ...user, is_admin: next });
        notify(next ? 'Admin access granted' : 'Admin access removed');
    }

    async function toggleStatus() {
        const next = user.status === 'suspended' ? 'active' : 'suspended';
        await api(`/users/${user.id}/update-status`, 'POST', { status: next });
        onUpdate({ ...user, status: next });
        notify(next === 'suspended' ? 'Account suspended' : 'Account reactivated');
    }

    async function deleteUser() {
        if (!confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return;
        await api(`/users/${user.id}`, 'DELETE');
        notify('User deleted');
        setTimeout(onClose, 800);
    }

    const isSuspended = user.status === 'suspended';

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
                {/* Toast */}
                {toast && (
                    <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
                        {toast}
                    </div>
                )}

                {/* Drawer header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">User Details</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* User identity */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                            {initials(user.name, user.email)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 text-base">{user.name || 'Anonymous'}</p>
                                {user.is_admin && <ShieldCheck className="w-4 h-4 text-lime-600" />}
                            </div>
                            <p className="text-sm text-slate-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${PLAN_STYLES[user.plan_type] ?? PLAN_STYLES.free}`}>
                                    {user.plan_type || 'free'}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isSuspended ? 'bg-red-50 text-red-600' : 'bg-lime-50 text-lime-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-lime-500'}`} />
                                    {isSuspended ? 'Suspended' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                        {[
                            { label: 'Scans',        value: user.scans || 0 },
                            { label: 'Bonus Scans',  value: user.credits_remaining || 0 },
                            { label: 'Joined',       value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                        ].map(s => (
                            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                                <p className="text-base font-bold text-slate-900">{s.value}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan upgrade / downgrade */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Change Plan</p>
                    <div className="grid grid-cols-3 gap-2">
                        {['free', 'creator', 'studio'].map(tier => (
                            <button key={tier}
                                disabled={busy || user.plan_type === tier}
                                onClick={() => changePlan(tier)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                    ${user.plan_type === tier
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                    }`}>
                                {tier}
                                {user.plan_type === tier && ' ✓'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add scans */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Add Scans</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button onClick={() => setScanAmount(Math.max(1, scanAmount - 5))}
                                className="px-3 py-2 text-slate-500 hover:bg-slate-100 text-sm font-bold transition-colors">−</button>
                            <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-[3rem] text-center">{scanAmount}</span>
                            <button onClick={() => setScanAmount(scanAmount + 5)}
                                className="px-3 py-2 text-slate-500 hover:bg-slate-100 text-sm font-bold transition-colors">+</button>
                        </div>
                        <button onClick={addScans} disabled={busy}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm">
                            <ScanLine className="w-3.5 h-3.5" />
                            Grant Scans
                        </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                        {[5, 10, 25, 50].map(n => (
                            <button key={n} onClick={() => setScanAmount(n)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${scanAmount === n ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account actions */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Account Actions</p>
                    <div className="space-y-2">
                        <button onClick={toggleAdmin} disabled={busy}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50">
                            {user.is_admin
                                ? <><ShieldOff className="w-4 h-4 text-amber-500" /> Remove Admin Access</>
                                : <><ShieldCheck className="w-4 h-4 text-lime-600" /> Grant Admin Access</>
                            }
                        </button>
                        <button onClick={toggleStatus} disabled={busy}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50">
                            {isSuspended
                                ? <><CheckCircle2 className="w-4 h-4 text-lime-600" /> Reactivate Account</>
                                : <><Ban className="w-4 h-4 text-amber-500" /> Suspend Account</>
                            }
                        </button>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="px-6 py-5">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Danger Zone</p>
                    <button onClick={deleteUser} disabled={busy}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all text-sm font-bold text-red-600 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                        Permanently Delete User
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">This removes all their data and cannot be undone.</p>
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const { getToken } = useAuth();
    const [users, setUsers]         = useState<User[]>([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [planFilter, setPlan]     = useState('all');
    const [selected, setSelected]   = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const res = await fetch('/api/main/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setUsers(await res.json());
            } catch (e) {
                console.error('Failed to fetch users', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [getToken]);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        const matchPlan   = planFilter === 'all' || (u.plan_type || 'free') === planFilter;
        return matchSearch && matchPlan;
    });

    function handleUpdate(updated: User) {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setSelected(updated);
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Loading users...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {selected && (
                <UserDrawer
                    user={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={handleUpdate}
                    getToken={getToken}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-lime-500" />
                        <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Directory</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Users</h1>
                    <p className="text-slate-500 text-sm mt-1">Click any row to manage a user's plan, scans, and access.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 shadow-sm self-start">
                    <span className="w-2 h-2 rounded-full bg-lime-500" />
                    {users.length} Members
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search name or email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all placeholder:text-slate-400" />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                    <select value={planFilter} onChange={e => setPlan(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-medium text-slate-700 focus:outline-none cursor-pointer">
                        <option value="all">All Tiers</option>
                        <option value="free">Free</option>
                        <option value="creator">Creator</option>
                        <option value="studio">Studio</option>
                    </select>
                </div>
                <div className="ml-auto text-xs text-slate-400 font-medium hidden sm:block">
                    {filtered.length} of {users.length}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Member</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Plan</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Scans</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Credits</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Status</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">Joined</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-slate-400"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">No users found.</td></tr>
                            ) : filtered.map((user, idx) => (
                                <tr key={user.id}
                                    onClick={() => setSelected(user)}
                                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_GRADS[idx % AVATAR_GRADS.length]} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                                                {initials(user.name, user.email)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                                                    {user.name || 'Anonymous'}
                                                    {user.is_admin && <ShieldCheck className="w-3.5 h-3.5 text-lime-600 shrink-0" />}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${PLAN_STYLES[user.plan_type] ?? PLAN_STYLES.free}`}>
                                            {user.plan_type === 'studio' && <Sparkles className="w-3 h-3 text-purple-500" />}
                                            {user.plan_type || 'free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{user.scans || 0}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{user.credits_remaining || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === 'suspended' ? 'text-red-600 bg-red-50' : 'text-lime-700 bg-lime-50'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'suspended' ? 'bg-red-500' : 'bg-lime-500'}`} />
                                            {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
