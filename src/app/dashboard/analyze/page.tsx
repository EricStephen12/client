'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto pt-24 text-center px-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-lg sm:text-xl italic text-slate-400">Preparing the Studio...</p>
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
    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('url');

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const userId = user?.id;

    const searchParams = useSearchParams();
    const sessionTier = (user?.publicMetadata as any)?.plan_type;
    const [planTier, setPlanTier] = useState<string>(sessionTier || 'free');
    const [scansUsed, setScansUsed] = useState(0);
    const [scanLimit, setScanLimit] = useState(3);
    const [isCheckingPlan, setIsCheckingPlan] = useState(true);

    useEffect(() => {
        const checkPlan = async () => {
            if (!userId) return;
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tier = data.plan_type || data.subscription_tier || 'free';
                    setPlanTier(tier);
                    setScansUsed(data.monthly_usage?.scans || 0);
                    const limits: Record<string, number> = { free: 3, creator: 30, studio: 250, agency: 250 };
                    setScanLimit(limits[tier] ?? 3);
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

    const [isChatMode, setIsChatMode] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRoastMode, setIsRoastMode] = useState(false);
    const [benchmarks, setBenchmarks] = useState<any>(null);

    const loadSession = async (id: string) => {
        setIsSending(true);
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
                
                let parsedMessages = data.messages;
                if (typeof parsedMessages === 'string') {
                    try { parsedMessages = JSON.parse(parsedMessages); } catch(e){}
                } else if (!parsedMessages) {
                    parsedMessages = [];
                }

                setResult({ analysis: parsedDna });
                setMessages(parsedMessages);
                setSessionId(data.id);
                setIsChatMode(true);
            }
        } catch (err) {
            console.error('Load session failed', err);
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        const queryUrl = searchParams.get('url');
        const querySessionId = searchParams.get('sessionId');

        if (querySessionId && !sessionId && !isAnalyzing) {
            loadSession(querySessionId);
            return;
        }

        if (queryUrl && !result && !isAnalyzing) {
            setUrl(queryUrl);
            setActiveTab('url');

            const triggerInitialScan = async () => {
                setIsAnalyzing(true);
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/analyze-video-url`, {
                        method: 'POST',
                        body: JSON.stringify({ videoUrl: queryUrl, userId }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setResult(data);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            triggerInitialScan();
        }
    }, [searchParams, userId, sessionId]);

    // Fetch niche benchmarks when analysis result arrives
    useEffect(() => {
        if (result?.analysis?.niche) {
            const fetchBenchmarks = async () => {
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/niche-benchmarks?niche=${encodeURIComponent(result.analysis.niche)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) setBenchmarks(await res.json());
                } catch (e) {}
            };
            fetchBenchmarks();
        }
    }, [result]);

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
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    const saveSessionState = async (updatedMessages: any[], currentId?: string | null) => {
        const idToUse = currentId || sessionId;
        if (!userId || !result) return null;

        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/save-lounge-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: idToUse,
                    userId,
                    videoUrl: url || file?.name || 'Uploaded Video',
                    dna: result.analysis,
                    messages: updatedMessages
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.id && !sessionId) setSessionId(data.id);

                window.dispatchEvent(new CustomEvent('session-updated'));
                return data.id as string;
            }
        } catch (err) {
            console.error('Save session failed', err);
        }
        return idToUse;
    };

    const startChat = async () => {
        setIsChatMode(true);
        setIsSending(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/creative-director-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [],
                    dna: result.analysis,
                    userId,
                    isRoastMode
                })
            });

            if (!res.ok) throw new Error('Intro failed');
            const data = await res.json();
            const initialMsg = { role: 'assistant', content: data.message };
            setMessages([initialMsg]);

            const savedId = await saveSessionState([initialMsg]);
            if (savedId) setSessionId(savedId);
        } catch (err) {
            console.error(err);
            setMessages([{ role: 'assistant', content: `I've deconstructed the DNA. What's the one thing you want your customers to feel when they see your product?` }]);
        } finally {
            setIsSending(false);
        }
    };

    const sendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setChatInput('');
        setIsSending(true);

        const MAX_ATTEMPTS = 2;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                const token = await getToken();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 45000);

                const res = await fetch(`/api/main/api/creative-director-chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        messages: newMessages,
                        dna: result.analysis,
                        userId,
                        isRoastMode
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.details || errData.error || `Server returned ${res.status}`);
                }
                const data = await res.json();
                if (!data.message) throw new Error('Empty response from AI');

                const assistantMsg = { role: 'assistant', content: data.message };
                const finalMessages = [...newMessages, assistantMsg];
                setMessages(finalMessages);

                const savedId = await saveSessionState(finalMessages);
                if (savedId) setSessionId(savedId);
                setIsSending(false);
                return; // success — exit
            } catch (err: any) {
                console.error(`Chat attempt ${attempt} failed:`, err);
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise(r => setTimeout(r, 1500)); // wait before retry
                    continue;
                }
                // Both attempts failed — show error in chat
                const errorMsg = {
                    role: 'assistant',
                    content: `⚠️ The Creative Director couldn't respond right now. This usually happens due to a brief AI service hiccup.\n\n**Try sending your message again** — it typically works on the next attempt.\n\n_Error: ${err.message || 'Connection timeout'}_`
                };
                setMessages([...newMessages, errorMsg]);
            }
        }
        setIsSending(false);
    };

    const handleFeedback = async (msgIdx: number, rating: 'up' | 'down') => {
        const newMessages = [...messages];
        newMessages[msgIdx] = { ...newMessages[msgIdx], feedback: rating };
        setMessages(newMessages);
        await saveSessionState(newMessages);
    };

    const forgeDirectorBrief = async () => {
        setIsSending(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/generate-final-script`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages,
                    dna: result.analysis,
                    userId
                })
            });

            if (!res.ok) throw new Error('Generation failed');
            const data = await res.json();

            const briefMsg = {
                role: 'assistant',
                type: 'brief',
                content: `🎬 **DIRECTOR BRIEF: ${data.title}**\n\n**Concept**: ${data.concept}\n\n${data.shot_list.map((s: any) => `**${s.time}**\n🎬 Visual: ${s.visual}\n🎙️ Audio: ${s.audio}\n📝 Overlay: ${s.overlay}`).join('\n\n')}`,
                raw: data
            };

            const updatedMessages = [...messages, briefMsg];
            setMessages(updatedMessages);
            const savedId = await saveSessionState(updatedMessages);
            if (savedId) setSessionId(savedId);

        } catch (err) {
            console.error(err);
            alert("The Forge is overheated. Try again in a second.");
        } finally {
            setIsSending(false);
        }
    };

    const handleAnalyze = async () => {
        if (activeTab === 'upload' && !file) return;
        if (activeTab === 'url' && !url) return;

        setIsAnalyzing(true);
        const formData = new FormData();

        if (activeTab === 'upload' && file) {
            formData.append('video', file);
        } else {
            formData.append('videoUrl', url);
        }

        if (userId) formData.append('userId', userId);

        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/analyze-video${activeTab === 'url' ? '-url' : ''}`, {
                method: 'POST',
                body: activeTab === 'upload' ? formData : JSON.stringify({ videoUrl: url, userId }),
                headers: {
                    ...(activeTab === 'url' ? { 'Content-Type': 'application/json' } : {}),
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
            setResult(data);

            if (userId && data.analysis) {
                await saveSessionState([], null);
            }

            setTimeout(() => {
                startChat();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            alert(`Analysis Error: ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <div className="max-w-6xl mx-auto animate-fade-in-up pb-20 -mt-2 sm:-mt-4 md:-mt-8 space-y-6 sm:space-y-8 px-1 sm:px-2">

                <div className="mb-6 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 pb-8 sm:pb-12">
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-600 mb-1 block italic">Studio Workspace</span>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-slate-900 leading-tight tracking-tight">
                            {isChatMode ? 'Strategy ' : 'Creative '}
                            <span className="italic font-serif text-slate-400">
                                {isChatMode ? 'Lounge.' : 'Analyzer.'}
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {isChatMode && (
                            <button
                                onClick={() => setIsChatMode(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        )}
                        {!isChatMode && result && (
                            <button
                                onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); }}
                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                            >
                                + New Scan
                            </button>
                        )}
                    </div>
                </div>

                {!isChatMode ? (
                    <>
                        {isCheckingPlan ? (
                            <div className="max-w-4xl mx-auto pt-24 text-center px-4">
                                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="font-serif text-lg italic text-slate-400">Verifying Creative License...</p>
                            </div>
                        ) : scansUsed >= scanLimit ? (
                            <div className="max-w-3xl mx-auto text-center space-y-8 py-16 bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-purple-900/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-50"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600 shadow-inner">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-3xl sm:text-5xl text-slate-900 italic">
                                        {planTier === 'free' ? 'Free Trial Complete' : 'Scan Limit Reached'}
                                    </h3>
                                    <p className="text-slate-500 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                        {planTier === 'free' 
                                            ? <>You've used all <strong>3 free scans</strong>. Upgrade to keep extracting viral DNA and unlock unlimited strategy sessions.</>
                                            : <>You've reached your <strong>{scanLimit} monthly scans</strong>. Upgrade your plan to increase your limit.</>
                                        }
                                    </p>
                                    <div className="pt-4 max-w-sm mx-auto">
                                        <Link
                                            href="/dashboard/upgrade"
                                            className="w-full py-5 block bg-slate-900 text-white font-bold uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-purple-500 hover:text-slate-950 transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95 text-center"
                                        >
                                            {planTier === 'free' ? 'Upgrade — Starting at $5/mo' : 'Upgrade Plan'}
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-6 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <span>30+ Scans/mo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <span>AI Strategy Lounge</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <span>Director Briefs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !result ? (
                            <div className="max-w-4xl mx-auto space-y-6 md:space-y-12">
                                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                    <button
                                        onClick={() => setActiveTab('url')}
                                        className={`flex-shrink-0 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] transition-all ${activeTab === 'url' ? 'bg-purple-500 text-slate-950 shadow-xl shadow-purple-500/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-purple-200'}`}
                                    >
                                        Reference Scan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className={`flex-shrink-0 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] transition-all ${activeTab === 'upload' ? 'bg-purple-500 text-slate-950 shadow-xl shadow-purple-500/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-purple-200'}`}
                                    >
                                        Draft Audit
                                    </button>
                                </div>

                                {planTier === 'free' && (
                                    <div className="flex items-center gap-3 px-5 py-3 bg-purple-50 border border-purple-100 rounded-2xl">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-purple-700">
                                            {scanLimit - scansUsed} of {scanLimit} free scans remaining
                                        </span>
                                        <span className="text-[10px] text-purple-400 hidden sm:inline">•</span>
                                        <Link href="/dashboard/upgrade" className="text-[10px] font-bold text-purple-500 hover:text-purple-700 transition-colors uppercase tracking-widest hidden sm:inline">
                                            Upgrade
                                        </Link>
                                    </div>
                                )}

                                {activeTab === 'url' ? (
                                    <div className="p-6 sm:p-10 md:p-20 bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-6 sm:space-y-8">
                                        <div className="space-y-3 sm:space-y-4">
                                            <h3 className="font-serif text-xl sm:text-3xl md:text-5xl text-slate-900 italic">Paste Viral Blueprint</h3>
                                            <p className="text-slate-400 font-light text-base sm:text-lg">Our engine will extract the psychological DNA from any public TikTok, Reels, or Shorts URL.</p>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Paste TikTok, Instagram Reels, or YouTube Shorts URL..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full p-4 sm:p-6 md:p-8 bg-slate-50 border-none rounded-xl sm:rounded-3xl focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm sm:text-lg md:text-xl"
                                        />
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !url}
                                            className="w-full py-5 sm:py-6 md:py-8 bg-indigo-950 text-white font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs rounded-xl sm:rounded-3xl hover:bg-purple-500 hover:text-slate-950 hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
                                        >
                                            {isAnalyzing ? 'Locating Viral DNA...' : 'Scan Masterclass'}
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sweet Spot: 15-60s Analysis</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className="h-[200px] sm:h-[280px] md:h-[400px] bg-white border-2 border-dashed border-purple-100 rounded-2xl sm:rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all"
                                    >
                                        <input {...getInputProps()} />
                                        <div className="text-center p-4 sm:p-8 space-y-3 sm:space-y-4">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-purple-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto text-purple-300">
                                                <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            <p className="text-gray-900 font-bold text-base sm:text-lg md:text-xl font-serif">Audit My mp4</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Sweet Spot: 15-60s</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="text-center p-8 sm:p-12 md:p-24 bg-gradient-to-br from-indigo-950 to-purple-950 rounded-2xl sm:rounded-[3rem] text-white animate-pulse relative overflow-hidden shadow-2xl">
                                        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-6 sm:mb-8"></div>
                                        <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic">AI Creative Director is Watching...</h3>
                                        <div className="absolute -bottom-20 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500 rounded-full blur-[80px] sm:blur-[100px] opacity-10"></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Result Dashboard */
                            <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 animate-fade-in px-1">
                                <div className="space-y-6 md:space-y-8">
                                    {/* Metrics Bar */}
                                    <div className="p-6 sm:p-10 md:p-16 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm relative overflow-hidden group">
                                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                                            <div className="text-center">
                                                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 mb-2 sm:mb-4">Hook Power</h3>
                                                <div className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold text-slate-900">{result.analysis.metrics?.hook_power || 8}<span className="text-sm sm:text-xl text-slate-300 font-light ml-1">/10</span></div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 mb-2 sm:mb-4">Retention</h3>
                                                <div className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold text-purple-500">{result.analysis.metrics?.retention_score || 7}<span className="text-sm sm:text-xl text-slate-200 font-light ml-1">/10</span></div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 mb-2 sm:mb-4">Conversion</h3>
                                                <div className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold text-slate-900">{result.analysis.metrics?.conversion_trigger || 6}<span className="text-sm sm:text-xl text-slate-300 font-light ml-1">/10</span></div>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap justify-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                            <span className="bg-slate-50 px-3 py-1.5 rounded-full">{result.analysis.niche || 'General'}</span>
                                            <span className="bg-purple-50 text-purple-500 px-3 py-1.5 rounded-full">{result.analysis.awareness_level || 'Problem-Aware'}</span>
                                            <span className="bg-slate-50 px-3 py-1.5 rounded-full">{result.analysis.vibe_assessment?.style || 'UGC'}</span>
                                        </div>
                                        {benchmarks && benchmarks.total_ads > 1 && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">vs Niche Avg</span>
                                                    <span className={`text-sm font-bold ${(result.analysis.metrics?.hook_power || 0) >= (benchmarks.avg_hook || 0) ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        {(result.analysis.metrics?.hook_power || 0) >= (benchmarks.avg_hook || 0) ? '↑' : '↓'} Hook avg: {benchmarks.avg_hook}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">vs Niche Avg</span>
                                                    <span className={`text-sm font-bold ${(result.analysis.metrics?.retention_score || 0) >= (benchmarks.avg_retention || 0) ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        {(result.analysis.metrics?.retention_score || 0) >= (benchmarks.avg_retention || 0) ? '↑' : '↓'} Ret avg: {benchmarks.avg_retention}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">vs Niche Avg</span>
                                                    <span className={`text-sm font-bold ${(result.analysis.metrics?.conversion_trigger || 0) >= (benchmarks.avg_conversion || 0) ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        {(result.analysis.metrics?.conversion_trigger || 0) >= (benchmarks.avg_conversion || 0) ? '↑' : '↓'} CTA avg: {benchmarks.avg_conversion}
                                                    </span>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className="text-[9px] text-slate-400">Based on {benchmarks.total_ads} {result.analysis.niche} ads analyzed</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Big Idea */}
                                    <div className="p-6 sm:p-10 md:p-12 bg-purple-50 border border-purple-100 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden group">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-600 mb-3 sm:mb-4">The Big Idea</h4>
                                        <p className="text-slate-900 text-lg sm:text-2xl md:text-3xl font-serif leading-relaxed italic">&quot;{result.analysis.big_idea}&quot;</p>
                                        <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 text-3xl sm:text-4xl">💡</div>
                                    </div>

                                    {/* Hook Verdict */}
                                    {result.analysis.hook_verdict && (
                                        <div className="p-6 sm:p-10 md:p-12 bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] shadow-sm space-y-4">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 italic">🎯 Hook Verdict</h4>
                                            <p className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">{result.analysis.hook_verdict.what_stops_the_scroll}</p>
                                            <div className="flex gap-4">
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full">Visual: {result.analysis.hook_verdict.visual_hook_grade}/10</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">Audio: {result.analysis.hook_verdict.spoken_hook_grade}/10</span>
                                            </div>
                                            {result.analysis.hook_verdict.improvement && (
                                                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 block mb-2">↑ How to Improve</span>
                                                    <p className="text-emerald-900 text-sm font-medium">{result.analysis.hook_verdict.improvement}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Retention Map */}
                                    {result.analysis.retention_map && (
                                        <div className="p-6 sm:p-10 md:p-12 bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] shadow-sm space-y-4">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 italic">📊 Retention Map</h4>
                                            {result.analysis.retention_map.attention_peaks?.length > 0 && (
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 block mb-2">Attention Peaks</span>
                                                    {result.analysis.retention_map.attention_peaks.map((peak: string, i: number) => (
                                                        <p key={i} className="text-sm text-slate-700 mb-1 pl-3 border-l-2 border-emerald-300">▲ {peak}</p>
                                                    ))}
                                                </div>
                                            )}
                                            {result.analysis.retention_map.dead_zones?.length > 0 && (
                                                <div className="mt-4">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 block mb-2">Dead Zones</span>
                                                    {result.analysis.retention_map.dead_zones.map((zone: string, i: number) => (
                                                        <p key={i} className="text-sm text-slate-700 mb-1 pl-3 border-l-2 border-red-300">▼ {zone}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-slate-600 text-sm leading-relaxed mt-4 pt-4 border-t border-slate-50">{result.analysis.retention_map.critique}</p>
                                        </div>
                                    )}

                                    {/* Steal-Worthy + Fatal Flaw */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {result.analysis.steal_worthy && (
                                            <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl sm:rounded-[2rem] space-y-3">
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 italic">✨ Steal This</h4>
                                                <p className="text-slate-900 font-medium text-sm leading-relaxed">{result.analysis.steal_worthy}</p>
                                            </div>
                                        )}
                                        {result.analysis.fatal_flaw && (
                                            <div className="p-6 sm:p-8 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl sm:rounded-[2rem] space-y-3">
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 italic">⚡ Fatal Flaw</h4>
                                                <p className="text-slate-900 font-medium text-sm leading-relaxed">{result.analysis.fatal_flaw}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Money Shot */}
                                    {result.analysis.money_shot && (
                                        <div className="p-6 sm:p-8 bg-amber-50 border border-amber-100 rounded-2xl sm:rounded-[2rem] flex items-start gap-4">
                                            <span className="text-2xl">📸</span>
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 italic mb-2">Money Shot — Frame {result.analysis.money_shot.frame_number} ({result.analysis.money_shot.timestamp})</h4>
                                                <p className="text-slate-900 font-medium text-sm leading-relaxed">{result.analysis.money_shot.why}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Secret Sauce */}
                                    <div className="p-6 sm:p-10 md:p-12 bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] space-y-3 sm:space-y-4 shadow-sm">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 italic">🔮 The Secret Sauce</h4>
                                        <p className="text-slate-900 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed">&quot;{result.analysis.the_secret_sauce}&quot;</p>
                                    </div>

                                    {/* Viral Checklist */}
                                    {result.analysis.viral_checklist && (
                                        <div className="p-6 sm:p-10 md:p-12 bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] shadow-sm">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6 italic">🧬 Viral DNA Checklist</h4>
                                            <div className="space-y-3">
                                                {result.analysis.viral_checklist.map((item: any, i: number) => (
                                                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.passed ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                                                        <span className={`text-sm mt-0.5 ${item.passed ? 'text-emerald-500' : 'text-red-400'}`}>{item.passed ? '✓' : '✗'}</span>
                                                        <div className="flex-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 block">{item.label}</span>
                                                            {item.note && <p className="text-[11px] text-slate-500 mt-1">{item.note}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actionable Directions */}
                                    {result.analysis.actionable_directions && (
                                        <div className="p-6 sm:p-10 md:p-12 bg-gradient-to-br from-indigo-950 to-purple-950 text-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-6 italic">🎬 Director's Orders</h4>
                                            <div className="space-y-4">
                                                {result.analysis.actionable_directions.map((dir: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-4">
                                                        <span className="text-purple-400 font-bold text-lg mt-0.5">{i + 1}.</span>
                                                        <p className="text-white/90 text-sm font-medium leading-relaxed">{dir}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <button
                                            onClick={startChat}
                                            className="flex-1 py-6 sm:py-8 bg-indigo-950 text-white rounded-xl sm:rounded-[2rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-purple-500 hover:text-slate-950 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-950/20 flex items-center justify-center gap-4 sm:gap-6 group"
                                        >
                                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            Strategy Lounge
                                            <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                                        </button>

                                        {profile?.plan_type === 'agency' && (
                                            <Link
                                                href={`/dashboard/report/${sessionId || ''}`}
                                                className="px-6 sm:px-10 py-6 sm:py-8 border border-slate-100 text-slate-400 rounded-xl sm:rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs hover:bg-white hover:text-purple-600 transition-all flex items-center justify-center gap-3"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                Expert Report
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* CHAT MODE: ChatGPT Style Lounge */
                    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in flex flex-col" style={{ height: 'calc(100dvh - 200px)', minHeight: '350px' }}>
                        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-1 md:pr-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm ${msg.type === 'brief'
                                        ? 'bg-gradient-to-br from-indigo-950 to-purple-950 text-white border-2 sm:border-4 border-purple-500/20'
                                        : msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none'
                                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                        }`}>
                                        {msg.type === 'brief' && (
                                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 text-slate-950 rounded-lg sm:rounded-xl flex items-center justify-center font-serif italic text-lg sm:text-xl shadow-lg">B</div>
                                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-purple-400">Director Brief Forged</span>
                                            </div>
                                        )}
                                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'brief' ? 'font-serif text-gray-100' : ''}`}>{msg.content}</p>
                                                 {msg.role === 'assistant' && msg.type !== 'brief' && (
                                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-50 flex gap-4 sm:gap-6 items-center">
                                                <button 
                                                    onClick={() => handleFeedback(idx, 'up')}
                                                    className={`hover:scale-110 transition-transform ${msg.feedback === 'up' ? 'text-purple-500' : 'text-slate-400'}`}
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={msg.feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708C19.746 10 20.5 10.852 20.5 11.852c0 .324-.078.636-.231.912l-2.455 4.39A2.5 2.5 0 0115.656 18H10V10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h5v8z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleFeedback(idx, 'down')}
                                                    className={`hover:scale-110 transition-transform ${msg.feedback === 'down' ? 'text-red-400' : 'text-slate-400'}`}
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={msg.feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.292C4.254 14 3.5 13.148 3.5 12.148c0-.324.078-.636.231-.912l2.455-4.39A2.5 2.5 0 018.344 6H14v8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6h5a2 2 0 012 2v4a2 2 0 01-2 2h-5V6z" /></svg>
                                                </button>
                                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Director Feedback</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2.5rem] rounded-tl-none border border-slate-100 shadow-sm flex gap-2">
                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full animate-bounce" />
                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group bg-slate-50 rounded-[2.5rem] border border-slate-100 p-2 focus-within:ring-2 focus-within:ring-purple-200 transition-all shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') sendMessage();
                                    }}
                                    placeholder="Discuss strategy with your Creative Director..."
                                    className="flex-1 bg-transparent border-none rounded-3xl px-6 py-4 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-0"
                                    disabled={isSending}
                                />
                                <div className="flex items-center justify-end gap-2 px-2 pb-2 sm:px-0 sm:pb-0">
                                    <button
                                        onClick={forgeDirectorBrief}
                                        disabled={isSending || messages.length < 1}
                                        title="Forge Director Brief"
                                        className="p-4 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors disabled:opacity-30 flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={isSending || !chatInput.trim()}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        Send
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="px-5 pb-3 pt-1 flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isRoastMode ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`} />
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {isRoastMode ? 'Roast Mode' : 'Creative Lounge'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3e8ff; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e9d5ff; }
            `}</style>
        </>
    );
}
