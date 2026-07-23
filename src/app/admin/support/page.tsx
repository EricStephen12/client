'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, User, AlertCircle } from 'lucide-react';

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
            if (!token) {
                console.error('Auth token unavailable');
                setLoading(false);
                return;
            }
            const res = await fetch('/api/main/api/admin/support', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTickets(await res.json());
            } else {
                console.error(`Failed to fetch tickets: ${res.status} ${res.statusText}`);
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
            if (!token) {
                console.error('Auth token unavailable');
                return;
            }
            const res = await fetch(`/api/main/api/admin/support/${id}/resolve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading support tickets...</span>
                </div>
            </div>
        );
    }

    const openTickets = tickets.filter(t => t.status !== 'resolved');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LifeBuoy className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Helpdesk</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage user inquiries, technical reports, and account issues.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 shadow-sm self-start">
                    <AlertCircle className={`w-4 h-4 ${openTickets.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                    Open Tickets: <span className="font-bold text-slate-900">{openTickets.length}</span>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
                        <div className="p-3 rounded-full bg-slate-50 text-slate-400 mb-3">
                            <CheckCircle2 className="w-6 h-6 text-lime-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">No open tickets</h3>
                        <p className="text-slate-400 text-xs max-w-sm">All support requests have been addressed. Everything is running smoothly!</p>
                    </div>
                ) : (
                    tickets.map((ticket) => {
                        const isResolved = ticket.status === 'resolved';
                        return (
                            <div key={ticket.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            isResolved 
                                            ? 'text-slate-500 bg-slate-100' 
                                            : 'text-rose-600 bg-rose-50 border border-rose-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-slate-400' : 'bg-rose-500 animate-pulse'}`} />
                                            {ticket.status ? ticket.status.toUpperCase() : 'OPEN'}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{ticket.subject}</h3>
                                    
                                    <div className="bg-slate-50/80 p-4 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100/80">
                                        {ticket.message}
                                    </div>

                                    <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                            {ticket.user_name ? ticket.user_name[0].toUpperCase() : 'U'}
                                        </div>
                                        <span>From: <strong className="text-slate-800">{ticket.user_name || 'Anonymous User'}</strong> ({ticket.email})</span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end shrink-0 pt-2 md:pt-0">
                                    {!isResolved && (
                                        <button 
                                            onClick={() => resolveTicket(ticket.id)}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-lime-400" />
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

