'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function ReportPage() {
    const { sessionId } = useParams();
    const { getToken } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            if (!sessionId) return;
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/lounge-session/${sessionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error('Fetch report failed', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return <div className="p-20 text-center font-serif italic text-gray-400">Report not found. Verify session ID.</div>;

    const audit = data.dna;

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-6 sm:px-12 print:bg-white print:p-0">
            {/* Control Bar (Hidden on print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button
                    onClick={() => window.history.back()}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-2"
                >
                    &larr; Back to Studio
                </button>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print / Save as PDF
                </button>
            </div>

            {/* The Report */}
            <article className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none">
                {/* Header */}
                <header className="bg-gray-900 text-white p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 font-signature text-8xl">Eixora.</div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                            <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-400">Strategic Ad Audit</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif italic tracking-tight">{data.title || 'Viral Analysis Report'}</h1>
                        <p className="text-sm font-light opacity-50 uppercase tracking-widest border-t border-white/10 pt-4 inline-block">Ref: {sessionId?.toString().slice(0, 8)} • {new Date(data.created_at).toLocaleDateString()}</p>
                    </div>
                </header>

                <div className="p-12 md:p-16 space-y-16">
                    {/* Executive Summary */}
                    <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 pb-4">Executive Summary</h2>
                        <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 italic">
                            <p className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">"{audit.big_idea}"</p>
                        </div>
                    </section>

                    {/* Performance Metrics */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Hook Power', score: audit.metrics?.hook_power || 8, color: 'text-purple-600' },
                            { label: 'Retention Logic', score: audit.metrics?.retention_score || 7, color: 'text-blue-600' },
                            { label: 'Conversion Trigger', score: audit.metrics?.conversion_trigger || 6, color: 'text-emerald-600' }
                        ].map((m, i) => (
                            <div key={i} className="border border-gray-100 rounded-3xl p-8 text-center space-y-2">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">{m.label}</h3>
                                <div className={`text-5xl font-serif italic ${m.color}`}>{m.score}/10</div>
                            </div>
                        ))}
                    </section>

                    {/* Deep Dive Breakdown */}
                    <section className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Psychological Triggers</h2>
                            <ul className="space-y-4">
                                {audit.psychological_triggers?.map((t: string, i: number) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed font-serif italic">"{t}"</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The Secret Sauce</h2>
                            <div className="bg-gray-50 rounded-3xl p-8 text-sm text-gray-600 font-serif italic leading-relaxed">
                                {audit.hook_analysis?.critique}
                            </div>
                        </div>
                    </section>

                    {/* Masterclass Transcript */}
                    <section className="space-y-6 pt-8 border-t border-gray-100">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Full Audio Blueprint</h2>
                        <div className="text-gray-900 text-lg font-serif italic leading-loose opacity-80 decoration-purple-100 underline underline-offset-8">
                            {audit.transcript}
                        </div>
                    </section>

                    {/* Footer Branding */}
                    <footer className="pt-16 flex justify-between items-end border-t border-gray-100 opacity-40">
                        <div className="space-y-1">
                            <p className="text-lg font-signature italic">Eixora by EXRICX.</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest">Confidential Strategy Document • 2026</p>
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-right">
                            Generated by AI Creative Director
                        </div>
                    </footer>
                </div>
            </article>

            <style jsx>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                }
            `}</style>
        </div>
    );
}
