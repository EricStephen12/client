'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function WaitlistAdminPage() {
    const { getToken } = useAuth();
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif text-slate-900 mb-2">Waitlist Tracking</h1>
                    <p className="text-slate-500 text-sm">Users eagerly waiting for the mobile app launch.</p>
                </div>
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-xl font-bold text-sm">
                    Total: {waitlist.length}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Email Address</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Platform Request</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Signup Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {waitlist.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No waitlist signups yet. Keep marketing!
                                    </td>
                                </tr>
                            ) : (
                                waitlist.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">{entry.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                entry.platform === 'ios' ? 'bg-slate-900 text-white' : 
                                                entry.platform === 'android' ? 'bg-green-100 text-green-800' : 
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {entry.platform.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500">
                                                {new Date(entry.created_at).toLocaleDateString(undefined, { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
