'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function BatchPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const userId = user?.id;

    const [urls, setUrls] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState('');
    const sessionTier = (user?.publicMetadata as any)?.plan_type;
    const [planTier, setPlanTier] = useState<string>(sessionTier || 'free');
    const [isCheckingPlan, setIsCheckingPlan] = useState(!sessionTier);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    useEffect(() => {
        const checkPlan = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tier = data.plan_type || data.subscription_tier || 'free';
                    setPlanTier(tier);
                }
            } catch (err) {
                console.error('Plan check failed', err);
            } finally {
                setIsCheckingPlan(false);
            }
        };
        checkPlan();
    }, [sessionTier]);

    const handleBatchAnalyze = async () => {
        setError('');
        setResults(null);
        setLogs([]);
        addLog('🚀 Starting Elite Batch Analysis...');

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
            // Use AbortController for manual timeout (5 minutes for heavy batches)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min

            addLog(`🔗 Sent ${urlList.length} URLs to processing engine...`);
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/batch-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ urls: urlList }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                addLog(`❌ Server error: ${res.status} ${errorData.error || res.statusText}`);
                throw new Error('Batch analysis failed');
            }

            const data = await res.json();
            addLog(`✅ Analysis complete! ${data.completed} succeeded, ${data.failed} failed.`);
            setResults(data);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('Analysis timed out. Try a smaller batch (3-5 URLs).');
            } else {
                setError(err.message || 'Something went wrong');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportReport = async (analysis: any, videoUrl: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/export-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
            <div className="max-w-4xl mx-auto pt-24 text-center">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-xl italic text-slate-400">Loading Batch Engine...</p>
            </div>
        );
    }

    // All users have access during public launch
    if (false && planTier.toLowerCase() !== 'agency') {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-6 border-b border-slate-100 pb-12">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-600 block italic">Agency Workspace</span>
                <h2 className="text-3xl lg:text-7xl font-sans font-bold text-slate-900 leading-tight tracking-tight">
                    Batch <span className="italic font-serif text-slate-400">Processing.</span>
                </h2>
                <p className="text-slate-400 text-lg font-light max-w-xl">Deep-scan up to 10 viral masterclasses simultaneously for high-velocity creative strategy.</p>
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

                    {logs.length > 0 && (
                        <div className="bg-slate-900 rounded-[3rem] p-10 space-y-6 shadow-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <div className="w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500/30" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Diagnostic Protocol</span>
                                </div>
                                {isProcessing && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}
                            </div>
                            <div className="space-y-3 h-48 overflow-y-auto font-mono text-[11px] custom-scrollbar pr-6 relative z-10">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-4 ${i === 0 ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}>
                                        <span className="opacity-20 flex-shrink-0">{(logs.length - i).toString().padStart(2, '0')}</span>
                                        <span className="break-all tracking-tight leading-relaxed">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {results && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl border border-white/5">
                        <div className="grid grid-cols-3 gap-12 text-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4 italic">Total</p>
                                <p className="text-5xl font-sans font-bold text-white">{results.total}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4 italic">Success</p>
                                <p className="text-5xl font-sans font-bold text-purple-500">{results.completed}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4 italic">Failed</p>
                                <p className="text-5xl font-sans font-bold text-slate-700">{results.failed}</p>
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
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Hook</p>
                                            <p className="text-3xl font-sans font-bold text-slate-900">{r.analysis.metrics?.hook_power || '—'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Retention</p>
                                            <p className="text-3xl font-sans font-bold text-purple-500">{r.analysis.metrics?.retention_score || '—'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">CTA</p>
                                            <p className="text-3xl font-sans font-bold text-slate-900">{r.analysis.metrics?.conversion_trigger || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 italic">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-2">Strategic Verdict</p>
                                        <p className="text-lg font-serif text-slate-900 leading-relaxed italic">"{r.analysis.big_idea}"</p>
                                    </div>

                                    <button
                                        onClick={() => handleExportReport(r.analysis, r.url)}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-3 pt-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Strategy Brief
                                    </button>
                                </>
                            )}

                            {!r.success && (
                                <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Reason for Failure</p>
                                    <p className="text-sm font-medium text-red-600 italic">"{r.error || 'Unknown extraction error occurred'}"</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New Batch Button */}
                    <button
                        onClick={() => { setResults(null); setUrls(''); }}
                        className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-bold uppercase tracking-[0.4em] text-xs hover:bg-purple-500 hover:text-slate-950 hover:scale-[1.01] transition-all shadow-2xl"
                    >
                        + Initialize New Batch
                    </button>
                </div>
            )}
        </div>
    );
}
