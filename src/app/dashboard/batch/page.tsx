'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function BatchPage() {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    const [urls, setUrls] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState('');
    const [planTier, setPlanTier] = useState<string>('free');
    const [isCheckingPlan, setIsCheckingPlan] = useState(true);

    useEffect(() => {
        const checkPlan = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/me`);
                if (res.ok) {
                    const data = await res.json();
                    setPlanTier(data.plan_type || data.subscription_tier || 'free');
                }
            } catch (err) {
                console.error('Plan check failed', err);
            } finally {
                setIsCheckingPlan(false);
            }
        };
        checkPlan();
    }, []);

    const handleBatchAnalyze = async () => {
        setError('');
        setResults(null);

        const urlList = urls
            .split('\n')
            .map(u => u.trim())
            .filter(u => u.length > 0);

        if (urlList.length === 0) {
            setError('Please paste at least one URL.');
            return;
        }

        if (urlList.length > 10) {
            setError('Maximum 10 URLs per batch. Remove some and try again.');
            return;
        }

        setIsProcessing(true);
        setProgress({ current: 0, total: urlList.length });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/batch-analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: urlList }),
            });

            if (res.status === 403) {
                setError('Batch processing requires an Agency plan. Please upgrade.');
                setIsProcessing(false);
                return;
            }

            if (!res.ok) throw new Error('Batch analysis failed');

            const data = await res.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportReport = async (analysis: any, videoUrl: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/export-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysis, videoUrl }),
            });

            if (res.status === 403) {
                alert('Report export requires an Agency plan.');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eixora-report-${Date.now()}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export report.');
        }
    };

    if (isCheckingPlan) {
        return (
            <div className="max-w-4xl mx-auto pt-20 text-center">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-xl italic text-gray-400">Loading...</p>
            </div>
        );
    }

    if (planTier !== 'agency') {
        return (
            <div className="max-w-3xl mx-auto pt-12 space-y-8">
                <RevealOnScroll>
                    <div className="text-center space-y-6">
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 block">Agency Feature</span>
                        <h2 className="text-4xl md:text-6xl font-serif italic tracking-tight">
                            Batch <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Processing.</span>
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto font-light text-lg">
                            Analyze up to 10 competitor videos at once. Available exclusively on the Agency plan.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll delay={100}>
                    <div className="bg-gray-900 rounded-[2rem] p-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                            </svg>
                        </div>
                        <h3 className="text-white font-serif text-2xl italic">Unlock Batch Processing</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Paste multiple TikTok URLs and analyze them all at once. Export full DNA reports for your team.
                        </p>
                        <Link
                            href="/dashboard/upgrade"
                            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl"
                        >
                            Upgrade to Agency →
                        </Link>
                    </div>
                </RevealOnScroll>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-4 border-b border-purple-50 pb-8">
                <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 block">Agency Feature</span>
                <h2 className="text-3xl lg:text-5xl font-serif text-gray-900 leading-tight tracking-tighter">
                    Batch <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Processing.</span>
                </h2>
                <p className="text-gray-400 text-sm max-w-lg">Paste up to 10 TikTok URLs (one per line) and analyze them all at once.</p>
            </div>

            {/* Input */}
            {!results && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-purple-50 p-8 space-y-6 shadow-sm">
                        <textarea
                            value={urls}
                            onChange={(e) => setUrls(e.target.value)}
                            placeholder={"https://www.tiktok.com/@creator1/video/...\nhttps://www.tiktok.com/@creator2/video/...\nhttps://www.tiktok.com/@creator3/video/..."}
                            rows={6}
                            className="w-full bg-gray-50 border-none rounded-2xl p-6 focus:ring-2 focus:ring-purple-600 transition-all font-medium text-sm resize-none"
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {urls.split('\n').filter(u => u.trim()).length}/10 URLs
                                </span>
                            </div>

                            <button
                                onClick={handleBatchAnalyze}
                                disabled={isProcessing || !urls.trim()}
                                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
                            >
                                {isProcessing ? 'Processing...' : 'Batch Analyze All'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {isProcessing && (
                        <div className="text-center p-12 bg-gray-900 rounded-[2rem] text-white animate-pulse">
                            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="font-serif text-2xl italic">Batch Processing in Progress...</h3>
                            <p className="text-gray-400 mt-2 text-sm">This may take a few minutes depending on the number of videos.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {results && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
                        <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Total</p>
                                <p className="text-3xl font-serif italic text-white">{results.total}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Success</p>
                                <p className="text-3xl font-serif italic text-emerald-400">{results.completed}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Failed</p>
                                <p className="text-3xl font-serif italic text-red-400">{results.failed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Individual Results */}
                    {results.results?.map((r: any, idx: number) => (
                        <div key={idx} className={`bg-white rounded-2xl border ${r.success ? 'border-purple-100' : 'border-red-100'} p-8 space-y-4 shadow-sm`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Video {idx + 1}</p>
                                    <p className="text-sm font-medium text-gray-600 truncate">{r.url}</p>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${r.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {r.success ? 'Success' : 'Failed'}
                                </span>
                            </div>

                            {r.success && r.analysis && (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Hook</p>
                                            <p className="text-2xl font-serif italic text-purple-600">{r.analysis.metrics?.hook_power || '—'}/10</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Retention</p>
                                            <p className="text-2xl font-serif italic text-blue-600">{r.analysis.metrics?.retention_score || '—'}/10</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">CTA</p>
                                            <p className="text-2xl font-serif italic text-green-600">{r.analysis.metrics?.conversion_trigger || '—'}/10</p>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Big Idea</p>
                                        <p className="text-sm font-serif italic text-gray-900">{r.analysis.big_idea}</p>
                                    </div>

                                    <button
                                        onClick={() => handleExportReport(r.analysis, r.url)}
                                        className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export DNA Report
                                    </button>
                                </>
                            )}

                            {!r.success && (
                                <p className="text-sm text-red-500">{r.error}</p>
                            )}
                        </div>
                    ))}

                    {/* New Batch Button */}
                    <button
                        onClick={() => { setResults(null); setUrls(''); }}
                        className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.01] transition-all shadow-xl"
                    >
                        + New Batch
                    </button>
                </div>
            )}
        </div>
    );
}
