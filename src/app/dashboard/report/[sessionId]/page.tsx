'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
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
                const res = await fetch(`/api/main/api/lounge-session/${sessionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {

            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white px-4">
                <div className="w-8 h-8 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return <div className="p-10 sm:p-20 text-center font-serif italic text-gray-400 px-4">Report not found. Verify session ID.</div>;

    const audit = data.dna;
    // Mode can be on the session directly or nested inside the DNA object
    const mode = data.mode || audit?.mode || 'ad';
    const isProductIntel = mode === 'product-intel';

    // Clean title — strip the "Product Intel: " prefix and raw URLs
    const rawTitle = data.title || '';
    const cleanTitle = (() => {
        if (isProductIntel) return audit?.productName || rawTitle.replace(/^Product Intel:\s*/i, '').trim() || 'Product Evaluation';
        return rawTitle.replace(/^Analysis:\s*/i, '').trim() || 'Viral Analysis Report';
    })();

    // Truncate long URLs shown as titles
    const displayTitle = cleanTitle.startsWith('http')
        ? cleanTitle.split('/').filter(Boolean).pop()?.replace(/[?#].*/, '') || 'Video Analysis'
        : cleanTitle;

    return (
        <div className="min-h-screen bg-neutral-50 py-6 sm:py-12 px-4 sm:px-6 md:px-12 print:bg-white print:p-0">

            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <Link
                    href="/dashboard/analyze"
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-lime-600 transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                    &larr; Back to Studio
                </Link>
                <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print / Save PDF
                </button>
            </div>

            <article className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl sm:rounded-[3rem] overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none">

                <header className="bg-gray-900 text-white p-8 sm:p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 font-signature text-6xl sm:text-8xl">Eixora.</div>
                    <div className="relative z-10 space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="w-6 sm:w-8 h-1 bg-lime-500 rounded-full"></span>
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-lime-400">
                                {isProductIntel ? 'Product Intelligence Report' : 'Strategic Ad Audit'}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-tight">
                            {displayTitle}
                        </h1>
                        <p className="text-[9px] sm:text-sm font-light opacity-50 uppercase tracking-widest border-t border-white/10 pt-4 inline-block">Ref: {sessionId?.toString().slice(0, 8)} • {new Date(data.created_at).toLocaleDateString()}</p>
                    </div>
                </header>

                {isProductIntel ? (
                    <div className="p-8 sm:p-12 md:p-16 space-y-12 sm:space-y-16">
                        {/* Verdict Dashboard */}
                        <section className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 pb-3 sm:pb-4">The Verdict</h2>
                            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-lime-500 rounded-full blur-[100px] opacity-20"></div>
                                <div className="relative z-10">
                                    <p className="text-2xl sm:text-4xl font-serif italic text-white leading-tight mb-8">
                                        "{audit.verdict}"
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Market Stage</p>
                                            <p className="text-lg font-bold text-lime-400">{audit.marketStage}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Saturation</p>
                                            <p className="text-lg font-bold text-white">{audit.saturationScore}/10</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pain Fit</p>
                                            <p className="text-lg font-bold text-white">{audit.audiencePainFitScore}/10</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Profit Viability</p>
                                            <p className="text-lg font-bold text-white">{audit.profitViabilityScore}/10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Consultant's Breakdown */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Market Position & Saturation</h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Trend Direction</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{audit.marketPosition}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Saturation Reality</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{audit.saturationReality}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Audience & Authenticity</h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Pain Point Resolution</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{audit.audienceAndPainPoint}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Authenticity Check</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{audit.authenticityCheck}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Money Risk & Actionable Steps */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 pt-8 border-t border-slate-100">
                            <div className="space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">The Money Risk</h2>
                                <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-100">
                                    <p className="text-sm text-red-900 leading-relaxed font-serif italic">
                                        {audit.moneyRisk}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Actionable Steps</h2>
                                <ul className="space-y-4">
                                    {audit.actionableSteps?.map((step: string, i: number) => (
                                        <li key={i} className="flex gap-4 items-start">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-6 pt-8 border-t border-slate-100">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The Bottom Line</h2>
                            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8">
                                <p className="text-lg sm:text-xl font-bold text-slate-900 mb-4">{audit.bottomLine?.truth}</p>
                                <div className="flex gap-3 items-start p-4 bg-white rounded-xl border border-slate-200">
                                    <span className="text-lg">👀</span>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">What to watch for</p>
                                        <p className="text-sm text-slate-600">{audit.bottomLine?.watchFor}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <footer className="pt-12 sm:pt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-gray-100 opacity-40">
                            <div className="space-y-1">
                                <p className="text-base sm:text-lg font-signature italic">Eixora by EXRICX.</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest">Confidential Strategy Document • 2026</p>
                            </div>
                            <div className="text-[8px] font-bold uppercase tracking-widest text-left sm:text-right">
                                Generated by AI Sourcing Consultant
                            </div>
                        </footer>
                    </div>
                ) : (

                <div className="p-8 sm:p-12 md:p-16 space-y-12 sm:space-y-16">

                    <section className="space-y-4 sm:space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 pb-3 sm:pb-4">Executive Summary</h2>
                        <div className="bg-lime-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-lime-100 italic">
                            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-gray-900 leading-tight">&quot;{audit.big_idea}&quot;</p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { label: 'Hook Power', score: audit.metrics?.hook_power || 8, color: 'text-lime-600' },
                            { label: 'Retention Logic', score: audit.metrics?.retention_score || 7, color: 'text-lime-600' },
                            { label: 'Conversion Trigger', score: audit.metrics?.conversion_trigger || 6, color: 'text-emerald-600' }
                        ].map((m, i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-2">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">{m.label}</h3>
                                <div className={`text-3xl sm:text-5xl font-serif italic ${m.color}`}>{m.score}/10</div>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Psychological Triggers</h2>
                            <ul className="space-y-3 sm:space-y-4">
                                {audit.psychological_triggers?.map((t: string, i: number) => (
                                    <li key={i} className="flex gap-3 sm:gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime-600 mt-2 flex-shrink-0"></div>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed font-serif italic">&quot;{t}&quot;</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The Secret Sauce</h2>
                            <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-sm text-gray-600 font-serif italic leading-relaxed">
                                {audit.hook_analysis?.critique}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 border-t border-gray-100">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Full Audio Blueprint</h2>
                        <div className="text-gray-900 text-base sm:text-lg font-serif italic leading-loose opacity-80 decoration-lime-100 underline underline-offset-8">
                            {audit.transcript}
                        </div>
                    </section>

                    <footer className="pt-12 sm:pt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-gray-100 opacity-40">
                        <div className="space-y-1">
                            <p className="text-base sm:text-lg font-signature italic">Eixora by EXRICX.</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest">Confidential Strategy Document • 2026</p>
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-left sm:text-right">
                            Generated by AI Creative Director
                        </div>
                    </footer>
                </div>
                )}
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
