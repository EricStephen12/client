'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useState, useEffect } from 'react';

export default function HistoryPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = user?.id;

    useEffect(() => {
        if (isLoaded && user) {
            const fetchSessions = async () => {
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/user-sessions?userId=${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSessions(data);
                    }
                } catch (err) {

                } finally {
                    setIsLoading(false);
                }
            };
            fetchSessions();
        }
    }, [isLoaded, user, getToken, userId]);

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to permanently delete this extraction history?')) return;
        
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/lounge-session/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            } else {
                alert('Failed to delete history');
            }
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pb-20 px-2 sm:px-4">
            <div className="pt-2 sm:pt-6 mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-100 pb-8">
                <RevealOnScroll>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-600 block italic">History</span>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                            Scan <br className="hidden md:block" /><span className="italic font-serif text-slate-400">History.</span>
                        </h2>
                        <p className="text-slate-400 font-medium max-w-xl pt-2">Access your past video analyses and reports.</p>
                    </div>
                </RevealOnScroll>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-[1.5rem] animate-pulse"></div>
                    ))
                ) : sessions && sessions.length > 0 ? (
                    sessions.map((session: any) => (
                        <RevealOnScroll key={session.id} delay={100}>
                            <Link href={`/dashboard/analyze?sessionId=${session.id}`} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-100 rounded-[1.5rem] hover:border-lime-300 hover:shadow-lg hover:shadow-lime-500/10 transition-all gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">{session.title || 'Untitled Scan'}</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {new Date(session.created_at || session.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 self-end sm:self-auto">
                                    <div className="flex items-center gap-2 text-lime-600">
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">View Report</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(e, session.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete Session"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </Link>
                        </RevealOnScroll>
                    ))
                ) : (
                    <div className="col-span-full p-16 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h4 className="font-serif italic text-3xl text-slate-900 mb-3">No history found</h4>
                        <p className="text-base text-slate-400 mb-8 max-w-sm mx-auto">Your extraction vault is currently empty. Run your first scan to populate this area.</p>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-600 transition-all shadow-xl">
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
