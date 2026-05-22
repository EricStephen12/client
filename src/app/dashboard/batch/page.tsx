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

            alert('Failed to export report.');
        }
    };

    if (isCheckingPlan) {
        return (
            <div className="max-w-4xl mx-auto pt-24 text-center px-4">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-lg italic text-slate-400">Loading Batch Engine...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-2 sm:px-4">

            <div className="pt-2 sm:pt-6 mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-100 pb-8">
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600 block italic">Agency Workspace</span>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                        Batch <br className="hidden md:block" /><span className="italic font-serif text-slate-400">Processing.</span>
                    </h2>
                    <p className="text-slate-400 font-medium max-w-xl pt-2">Deep-scan up to 10 viral masterclasses simultaneously for high-velocity creative strategy.</p>
                </div>
                <Link 
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-purple-600 hover:border-purple-200 hover:shadow-lg transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Lounge
                </Link>
            </div>

            {!results && (
                <div className="space-y-6 max-w-4xl">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-purple-900/5 space-y-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-2">
                                <textarea
                                    value={urls}
                                    onChange={(e) => setUrls(e.target.value)}
                                    placeholder={"https://www.tiktok.com/@creator/video/123456789\nhttps://www.instagram.com/reel/Cw8Xyz1234/\nhttps://www.youtube.com/shorts/AbCdEfGhIj"}
                                    rows={6}
                                    className="w-full bg-transparent border-none p-4 sm:p-6 focus:ring-0 focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400 text-sm resize-none"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {urls.split('\n').filter(u => u.trim()).length}/10 URLs
                                    </span>
                                </div>

                                <button
                                    onClick={handleBatchAnalyze}
                                    disabled={isProcessing || !urls.trim()}
                                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs rounded-2xl hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing Engine Active...' : 'Initialize Batch Scan'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {logs.length > 0 && (
                        <div className="bg-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <div className="w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 sm:pb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/30" />
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500/30" />
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/30" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Diagnostic Protocol</span>
                                </div>
                                {isProcessing && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}
                            </div>
                            <div className="space-y-3 h-48 overflow-y-auto font-mono text-[10px] sm:text-[11px] custom-scrollbar pr-2 sm:pr-6 relative z-10">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 sm:gap-4 ${i === 0 ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}>
                                        <span className="opacity-20 flex-shrink-0">{(logs.length - i).toString().padStart(2, '0')}</span>
                                        <span className="break-all tracking-tight leading-relaxed">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {results && (
                <div className="space-y-6">

                    <div className="bg-slate-900 rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl border border-white/5">
                        <div className="grid grid-cols-3 gap-4 sm:gap-12 text-center">
                            <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/30 mb-2 sm:mb-4 italic">Total</p>
                                <p className="text-2xl sm:text-5xl font-sans font-bold text-white">{results.total}</p>
                            </div>
                            <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/30 mb-2 sm:mb-4 italic">Success</p>
                                <p className="text-2xl sm:text-5xl font-sans font-bold text-purple-500">{results.completed}</p>
                            </div>
                            <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/30 mb-2 sm:mb-4 italic">Failed</p>
                                <p className="text-2xl sm:text-5xl font-sans font-bold text-slate-700">{results.failed}</p>
                            </div>
                        </div>
                    </div>

                    {results.results?.map((r: any, idx: number) => (
                        <div key={idx} className={`bg-white rounded-xl sm:rounded-2xl border ${r.success ? 'border-purple-100' : 'border-red-100'} p-6 sm:p-8 space-y-6 shadow-sm`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Video {idx + 1}</p>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{r.url}</p>
                                </div>
                                <span className={`self-start sm:self-auto text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${r.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {r.success ? 'Success' : 'Failed'}
                                </span>
                            </div>

                            {r.success && r.analysis && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 sm:mb-2">Hook</p>
                                            <p className="text-2xl sm:text-3xl font-sans font-bold text-slate-900">{r.analysis.metrics?.hook_power || '—'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 sm:mb-2">Retention</p>
                                            <p className="text-2xl sm:text-3xl font-sans font-bold text-purple-500">{r.analysis.metrics?.retention_score || '—'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 sm:mb-2">CTA</p>
                                            <p className="text-2xl sm:text-3xl font-sans font-bold text-slate-900">{r.analysis.metrics?.conversion_trigger || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100 italic">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-2">Strategic Verdict</p>
                                        <p className="text-base sm:text-lg font-serif text-slate-900 leading-relaxed italic">&quot;{r.analysis.big_idea}&quot;</p>
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
                                    <p className="text-xs sm:text-sm font-medium text-red-600 italic">&quot;{r.error || 'Unknown extraction error occurred'}&quot;</p>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => { setResults(null); setUrls(''); }}
                        className="w-full py-6 sm:py-8 bg-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-purple-500 hover:text-slate-950 hover:scale-[1.01] transition-all shadow-2xl"
                    >
                        + Initialize New Batch
                    </button>
                </div>
            )}
        </div>
    );
}
