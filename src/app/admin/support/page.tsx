'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AdminSupportPage() {
    const { getToken } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [getToken]);

    async function fetchTickets() {
        try {
            const token = await getToken();
            const res = await fetch('/api/main/api/admin/support', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    }

    async function resolveTicket(id: string) {
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/admin/support/${id}/resolve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Optimistically update
                setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
            }
        } catch (err) {
            console.error(err);
        }
    }

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
                    <h1 className="text-4xl font-serif text-slate-900 mb-2">Support Tickets</h1>
                    <p className="text-slate-500 text-sm">Manage user inquiries and technical issues.</p>
                </div>
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-xl font-bold text-sm">
                    Open: {tickets.filter(t => t.status !== 'resolved').length}
                </div>
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
                        <p className="text-slate-500">No support tickets. Everything is running smoothly!</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        ticket.status === 'resolved' ? 'text-slate-500 bg-slate-100' : 'text-rose-600 bg-rose-50'
                                    }`}>
                                        {ticket.status || 'open'}
                                    </span>
                                    <span className="text-sm text-slate-400 font-medium">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{ticket.subject}</h3>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap border border-slate-100">
                                    {ticket.message}
                                </p>
                                <div className="text-xs text-slate-500 pt-2 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400">
                                        {ticket.user_name ? ticket.user_name[0].toUpperCase() : '?'}
                                    </span>
                                    From: <span className="font-medium text-slate-700">{ticket.user_name || 'Anonymous'}</span> ({ticket.email})
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                {ticket.status !== 'resolved' && (
                                    <button 
                                        onClick={() => resolveTicket(ticket.id)}
                                        className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
