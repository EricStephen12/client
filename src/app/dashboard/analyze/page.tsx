'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { getPlanLimit } from '@/utils/plan';
import IxoraRadarScanner from '@/components/IxoraRadarScanner';
import IxoraIntelligenceDashboard from '@/components/IxoraIntelligenceDashboard';
import IxoraSetupFlow from '@/components/IxoraSetupFlow';
import { Sparkles, Link2, UploadCloud, ArrowRight, ShieldCheck } from 'lucide-react';

function framePreviewToDataUrl(frame: unknown): string | null {
    if (!frame) return null;
    if (typeof frame === 'string') {
        return frame.startsWith('data:') ? frame : `data:image/jpeg;base64,${frame}`;
    }
    if (typeof frame === 'object' && frame !== null && 'base64' in frame) {
        const f = frame as { base64?: string; mimeType?: string };
        if (!f.base64) return null;
        return `data:${f.mimeType || 'image/jpeg'};base64,${f.base64}`;
    }
    return null;
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto pt-24 text-center px-4">
                <div className="relative mx-auto w-12 h-12 mb-4">
                    <div className="absolute inset-0 bg-[#bdf522] rounded-2xl blur-lg opacity-30 animate-pulse" />
                    <div className="relative w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/10">
                        <Sparkles className="w-6 h-6 text-[#bdf522]" />
                    </div>
                </div>
                <p className="font-sans text-sm font-medium text-stone-400">Loading Radar Studio...</p>
            </div>
        }>
            <AnalyzeContent />
        </Suspense>
    );
}

function AnalyzeContent() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [url, setUrl] = useState('');
    const [mode, setMode] = useState<'ad' | 'product-intel'>('ad');
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionVideoUrl, setSessionVideoUrl] = useState<string | null>(null);

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const userId = user?.id;

    const searchParams = useSearchParams();
    const sessionTier = (user?.publicMetadata as any)?.plan_type;
    const [planTier, setPlanTier] = useState<string>(sessionTier || 'free');
    const [scansUsed, setScansUsed] = useState(0);
    const [scanLimit, setScanLimit] = useState(3);
    const [isCheckingPlan, setIsCheckingPlan] = useState(true);
    const [onboardingDone, setOnboardingDone] = useState(true);

    useEffect(() => {
        const checkPlan = async () => {
            if (!userId) return;
            try {
                const token = await getToken();
                const email = user?.primaryEmailAddress?.emailAddress || '';
                const name = user?.fullName || '';
                const res = await fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tier = data.plan_type || 'free';
                    setPlanTier(tier);
                    setScansUsed(data.monthly_usage?.scans ?? 0);
                    setScanLimit(getPlanLimit(tier));

                    if (data.onboarding_completed === false) {
                        const localDone = typeof window !== 'undefined' && localStorage.getItem(`eixora_onboarding_done_${userId}`);
                        if (!localDone) {
                            setOnboardingDone(false);
                        }
                    }
                }
            } catch (err) {
            } finally {
                setIsCheckingPlan(false);
            }
        };
        if (isLoaded && userId) {
            checkPlan();
        }
    }, [isLoaded, userId]);

    const refreshScanUsage = useCallback(async () => {
        if (!userId) return;
        try {
            const token = await getToken();
            const email = user?.primaryEmailAddress?.emailAddress || '';
            const name = user?.fullName || '';
            const res = await fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setScansUsed(data.monthly_usage?.scans ?? 0);
                setScanLimit(getPlanLimit(data.plan_type || 'free'));
            }
        } catch {
            /* non-fatal */
        }
        window.dispatchEvent(new CustomEvent('session-updated'));
    }, [userId, getToken, user]);

    const loadSession = async (id: string, attempt = 0) => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/lounge-session/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                let parsedDna = data.dna;
                if (typeof parsedDna === 'string') {
                    try { parsedDna = JSON.parse(parsedDna); } catch(e){}
                }

                // If background processing is active, exponential backoff re-poll
                // Delays: 2s → 4s → 8s → 16s → cap at 30s (industry standard)
                if (parsedDna && parsedDna.status === 'processing') {
                    setIsAnalyzing(true);
                    setSessionId(data.id);
                    const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
                    setTimeout(() => loadSession(id, attempt + 1), delay);
                    return;
                }

                if (parsedDna && parsedDna.status === 'failed') {
                    setIsAnalyzing(false);
                    setSessionId(null);
                    setResult(null);
                    window.history.pushState({}, '', window.location.pathname);
                    alert(`Analysis failed: ${parsedDna.error || 'Video analysis encountered an error'}`);
                    return;
                }

                const rawMode = data.mode || parsedDna?.mode || mode || 'ad';
                const sessionMode: 'ad' | 'product-intel' = rawMode === 'product-intel' ? 'product-intel' : 'ad';
                const sessionThumb = framePreviewToDataUrl(parsedDna?.frames?.[0]) || data.thumbnail || null;
                const sessionTitle = data.title || 'Analysis Session';

                setResult({ 
                    analysis: parsedDna,
                    title: sessionTitle,
                    thumbnail: sessionThumb,
                    mode: sessionMode
                });
                const rawVideoUrl = typeof data.video_url === 'string' ? data.video_url : null;
                setSessionVideoUrl(
                  rawVideoUrl && !rawVideoUrl.startsWith('local:') ? rawVideoUrl : null
                );
                if (rawVideoUrl && !rawVideoUrl.startsWith('local:') && rawVideoUrl !== 'Direct Upload') {
                  setUrl(rawVideoUrl);
                }
                setSessionId(data.id);
                setIsAnalyzing(false);
                window.dispatchEvent(new CustomEvent('session-updated'));
            }
        } catch (err) {
            console.error('Load session failed', err);
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        const queryUrl = searchParams.get('url');
        const querySessionId = searchParams.get('sessionId');
        const queryMode = searchParams.get('mode') as any;

        if (querySessionId && !sessionId && !isAnalyzing) {
            loadSession(querySessionId);
            return;
        }

        if (queryUrl && !result && !isAnalyzing) {
            setUrl(queryUrl);
            setActiveTab('url');
            
            const activeMode: 'ad' | 'product-intel' = queryMode === 'product-intel' ? 'product-intel' : 'ad';
            setMode(activeMode);

            const triggerInitialScan = async () => {
                setIsAnalyzing(true);
                try {
                    const token = await getToken();
                    const endpoint = activeMode === 'product-intel' ? '/api/main/api/product-intel' : '/api/main/api/analyze';
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        body: JSON.stringify({ 
                            sourceUrl: queryUrl, 
                            userId, 
                            userName: user?.firstName || user?.username || 'Creator', 
                            mode: activeMode,
                            niche: user?.unsafeMetadata?.role || ''
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.sessionId) {
                            window.history.pushState({}, '', `?sessionId=${data.sessionId}`);
                            setSessionId(data.sessionId);
                            void refreshScanUsage();
                            loadSession(data.sessionId);
                        } else {
                            setIsAnalyzing(false);
                        }
                    } else {
                        setIsAnalyzing(false);
                    }
                } catch (err) {
                    console.error(err);
                    setIsAnalyzing(false);
                }
            };
            triggerInitialScan();
        }
    }, [searchParams, userId, sessionId]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': [] },
        maxFiles: 1,
        maxSize: planTier === 'studio' ? 500 * 1024 * 1024 : planTier === 'creator' ? 200 * 1024 * 1024 : 50 * 1024 * 1024
    });

    const handleAnalyze = async (overrideMode?: 'ad' | 'product-intel') => {
        const currentMode = overrideMode || mode;

        if (activeTab === 'upload') {
            if (!file) return;
            setIsAnalyzing(true);
            try {
                const token = await getToken();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', userId || user?.id || '');
                formData.append('userEmail', user?.primaryEmailAddress?.emailAddress || '');
                formData.append('userName', user?.fullName || user?.firstName || '');
                formData.append('mode', currentMode);
                formData.append('niche', (user?.unsafeMetadata?.role as string) || '');

                const res = await fetch('/api/main/api/upload', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                let errorMessage = 'Failed to upload video. Please try again.';
                if (!res.ok) {
                    try {
                        const text = await res.text();
                        try {
                            const errData = JSON.parse(text);
                            errorMessage = errData.details || errData.error || errorMessage;
                        } catch (e) {
                            errorMessage = `Server Error (${res.status}): ${text.substring(0, 100)}`;
                        }
                    } catch (e) {}
                    throw new Error(errorMessage);
                }

                const data = await res.json();
                if (data.sessionId) {
                    window.history.pushState({}, '', `?sessionId=${data.sessionId}`);
                    setSessionId(data.sessionId);
                    void refreshScanUsage();
                    loadSession(data.sessionId);
                }
            } catch (err: any) {
                console.error(err);
                alert(`Upload Error: ${err.message}`);
                setIsAnalyzing(false);
            }
            return;
        }

        if (activeTab === 'url' && !url) return;

        setIsAnalyzing(true);

        try {
            const token = await getToken();
            const endpoint = currentMode === 'product-intel' ? '/api/main/api/product-intel' : '/api/main/api/analyze';
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ 
                    sourceUrl: url, 
                    userId: userId || user?.id, 
                    userEmail: user?.primaryEmailAddress?.emailAddress || '',
                    userName: user?.fullName || user?.firstName || '',
                    mode: currentMode,
                    niche: user?.unsafeMetadata?.role || ''
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            let errorMessage = 'Failed to analyze video. Please try again.';
            if (!res.ok) {
                try {
                    const text = await res.text();
                    try {
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.details || errorData.error || errorMessage;
                    } catch(e) {
                        errorMessage = `Server Error (${res.status}): ${text.substring(0, 100)}`;
                    }
                } catch(e) {}
                throw new Error(errorMessage);
            }

            const data = await res.json();
            if (data.sessionId) {
                window.history.pushState({}, '', `?sessionId=${data.sessionId}`);
                setSessionId(data.sessionId);
                void refreshScanUsage();
                loadSession(data.sessionId);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Analysis Error: ${err.message}`);
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setIsAnalyzing(false);
        setSessionId(null);
        setUrl('');
        setFile(null);
        setPreviewUrl(null);
        window.history.replaceState({}, '', '/dashboard/analyze');
    };

    return (
        <div className="w-full flex-1 flex flex-col justify-center items-center py-10 px-4">
            {isCheckingPlan ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-[#bdf522] rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-stone-500 font-sans">Checking license status…</p>
                </div>
            ) : scansUsed >= scanLimit ? (
                <div className="max-w-xl mx-auto text-center space-y-6 py-12 bg-[#0e1210] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl">
                    <div className="w-16 h-16 bg-[#bdf522]/10 rounded-2xl flex items-center justify-center mx-auto text-[#bdf522] border border-[#bdf522]/20">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                        {planTier === 'free' ? 'Free Scans Limit Reached' : 'Monthly Scans Limit Reached'}
                    </h3>
                    <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto font-sans">
                        {planTier === 'free' 
                            ? "You've used all 3 free video scans. Upgrade to unlock unlimited deep video radar intelligence."
                            : `You've reached your ${scanLimit} monthly scan limit. Upgrade your subscription to continue analyzing.`
                        }
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/dashboard/upgrade"
                            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#bdf522] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#aee618] transition-all shadow-[0_0_20px_rgba(189,245,34,0.3)] font-sans"
                        >
                            Upgrade License
                        </Link>
                    </div>
                </div>
            ) : !onboardingDone ? (
                /* ── Cal AI Style 3-Step Setup ── */
                <IxoraSetupFlow
                    userId={userId}
                    userEmail={user?.primaryEmailAddress?.emailAddress || ''}
                    userName={user?.fullName || ''}
                    getToken={getToken}
                    onComplete={() => setOnboardingDone(true)}
                />
            ) : isAnalyzing ? (
                /* ── Circular Radar Scanner ── */
                <IxoraRadarScanner
                    thumbnailUrl={previewUrl || result?.thumbnail || null}
                    videoUrl={url}
                    mode={mode}
                />
            ) : result ? (
                /* ── Instant Visual Intelligence Dashboard ── */
                <IxoraIntelligenceDashboard
                    analysis={result.analysis}
                    title={result.title}
                    thumbnail={result.thumbnail}
                    videoUrl={sessionVideoUrl || url}
                    mode={result.mode || mode}
                    sessionId={sessionId}
                    onReset={handleReset}
                />
            ) : (
                /* ── Clean Minimalist Input ── */
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5 text-center animate-fade-in-up">
                    
                    {/* Mode Selector Tabs — ONLY 2 MODES */}
                    <div className="flex items-center p-1 bg-stone-900/90 border border-white/10 rounded-2xl shadow-lg">
                        {[
                            { id: 'ad', label: 'Video Intel' },
                            { id: 'product-intel', label: 'Product Intel' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setMode(item.id as any)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all font-sans ${
                                    mode === item.id
                                        ? 'bg-[#bdf522] text-black shadow-md'
                                        : 'text-stone-400 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* URL Input / File Upload Box */}
                    <div className="w-full bg-[#0e1210] border border-white/15 rounded-3xl p-3 sm:p-4 shadow-2xl">
                        {activeTab === 'url' ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-stone-400 flex-shrink-0">
                                    <Link2 className="w-5 h-5 text-[#bdf522]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste video link..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && url) handleAnalyze(); }}
                                    className="flex-1 bg-transparent border-none text-white placeholder-stone-500 text-sm sm:text-base focus:outline-none py-2 font-sans"
                                />
                                <button
                                    onClick={() => handleAnalyze()}
                                    disabled={!url || isAnalyzing}
                                    className="px-6 py-3 rounded-2xl bg-[#bdf522] hover:bg-[#aee618] disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(189,245,34,0.3)] flex-shrink-0 font-sans"
                                >
                                    <span>Scan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                {...getRootProps()}
                                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                    isDragActive ? 'border-[#bdf522] bg-[#bdf522]/5' : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <UploadCloud className="w-10 h-10 text-stone-400 mb-2" />
                                <p className="text-sm font-medium text-stone-200 font-sans">
                                    {file ? file.name : 'Drop MP4 video file here or click to browse'}
                                </p>
                                {file && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                        className="mt-4 px-6 py-2.5 rounded-xl bg-[#bdf522] text-black font-bold text-xs uppercase tracking-wider font-sans"
                                    >
                                        Scan Uploaded File
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sub-bar toggles */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 px-2 text-xs text-stone-500 font-sans">
                            <button
                                onClick={() => setActiveTab(activeTab === 'url' ? 'upload' : 'url')}
                                className="hover:text-stone-300 transition-colors flex items-center gap-1.5"
                            >
                                {activeTab === 'url' ? '📁 Direct MP4 Upload' : '🔗 Paste Video URL'}
                            </button>
                            <span className="font-mono text-[11px] text-[#bdf522]/80">
                                {scanLimit - scansUsed} scans remaining
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
