'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Hourglass, Search, Smartphone, Apple, CheckCircle2 } from 'lucide-react';

export default function WaitlistAdminPage() {
    const { getToken } = useAuth();
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchWaitlist() {
            try {
                const token = await getToken();
                const res = await fetch('/api/main/api/admin/waitlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setWaitlist(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch waitlist", error);
            } finally {
                setLoading(false);
            }
        }
        fetchWaitlist();
    }, [getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading waitlist entries...</span>
                </div>
            </div>
        );
    }

    const filtered = waitlist.filter(item => 
        (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.platform || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const iosCount = waitlist.filter(i => (i.platform || '').toLowerCase() === 'ios').length;
    const androidCount = waitlist.filter(i => (i.platform || '').toLowerCase() === 'android').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Hourglass className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Early Access</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mobile Waitlist</h1>
                    <p className="text-slate-500 text-sm mt-1">Tracks users eager for the upcoming iOS & Android apps.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
                        <Apple className="w-3.5 h-3.5 text-slate-900" />
                        iOS: <span className="font-bold text-slate-900">{iosCount}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        Android: <span className="font-bold text-slate-900">{androidCount}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search waitlist emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all placeholder:text-slate-400"
                    />
                </div>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Showing {filtered.length} of {waitlist.length}</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Email Address</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Target Platform</th>
                                <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No waitlist signups found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((entry) => {
                                    const isIos = (entry.platform || '').toLowerCase() === 'ios';
                                    return (
                                        <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                                {entry.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                                                    isIos 
                                                    ? 'bg-slate-900 text-white' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                }`}>
                                                    {isIos ? <Apple className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                                                    {(entry.platform || 'General').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                                {new Date(entry.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
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

