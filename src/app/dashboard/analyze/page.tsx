'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { getPlanLimit } from '@/utils/plan';

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto pt-24 text-center px-4">
                <div className="relative mx-auto w-14 h-14 mb-6">
                    <div className="absolute inset-0 bg-lime-500 rounded-2xl blur-lg opacity-30 animate-pulse" />
                    <div className="relative w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                </div>
                <p className="font-serif text-lg sm:text-xl italic text-slate-400">Loading Video Analyzer...</p>
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
    const [mode, setMode] = useState<'ad' | 'content' | 'product-intel'>('ad');
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

                // If background processing is active, poll again after delay
                if (parsedDna && parsedDna.status === 'processing') {
                    setIsAnalyzing(true);
                    setSessionId(data.id);
                    setResult(null);
                    setTimeout(() => loadSession(id), 3000);
                    return;
                }

                if (parsedDna && parsedDna.status === 'failed') {
                    setIsAnalyzing(false);
                    setSessionId(null);
                    setResult(null);
                    window.history.pushState({}, '', window.location.pathname);
                    alert(`Analysis failed: ${parsedDna.error || 'Unknown error'}`);
                    return;
                }

                const sessionMode = data.mode || parsedDna?.mode || mode || 'ad';
                const sessionThumb = parsedDna?.frames?.[0] || data.thumbnail || null;
                const sessionTitle = data.title || 'Analysis Session';

                setResult({ 
                    analysis: parsedDna,
                    title: sessionTitle,
                    thumbnail: sessionThumb,
                    mode: sessionMode
                });
                setMessages(parsedMessages);
                setSessionId(data.id);
                setIsAnalyzing(false);
                setIsChatMode(parsedMessages.length > 0);
                window.dispatchEvent(new CustomEvent('session-updated'));
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
        const queryMode = searchParams.get('mode') as any;

        if (querySessionId && !sessionId && !isAnalyzing) {
            loadSession(querySessionId);
            return;
        }

        if (queryUrl && !result && !isAnalyzing) {
            setUrl(queryUrl);
            setActiveTab('url');
            
            let activeMode = mode;
            if (queryMode && ['ad', 'content', 'product-intel'].includes(queryMode)) {
                activeMode = queryMode;
                setMode(queryMode);
            }

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
        const firstName = user?.firstName || user?.username || 'there';
        const dna = result?.analysis;

        // Build a rich summary message from the actual analysis data
        const hook       = dna?.metrics?.hook_power       ?? '—';
        const retention  = dna?.metrics?.retention_score  ?? '—';
        const conversion = dna?.metrics?.conversion_trigger ?? '—';
        const bigIdea    = dna?.big_idea || dna?.verdict || null;
        const hookCrit   = dna?.hook_analysis?.critique   || null;
        const triggers   = dna?.psychological_triggers?.slice(0, 3) || [];
        const mode       = result?.mode || 'ad';
        const isProduct  = mode === 'product-intel';

        let summaryContent = `Hey ${firstName}! I've finished analyzing this video. Here's what I found:\n\n`;

        if (isProduct) {
            summaryContent += `**📦 Product Intelligence Report**\n\n`;
            if (bigIdea) summaryContent += `> "${bigIdea}"\n\n`;
            if (dna?.marketStage)   summaryContent += `**Market Stage:** ${dna.marketStage}\n`;
            if (dna?.saturationScore !== undefined) summaryContent += `**Saturation:** ${dna.saturationScore}/10\n`;
            if (dna?.audiencePainFitScore !== undefined) summaryContent += `**Pain Fit:** ${dna.audiencePainFitScore}/10\n`;
            if (dna?.profitViabilityScore !== undefined) summaryContent += `**Profit Viability:** ${dna.profitViabilityScore}/10\n`;
        } else {
            summaryContent += `**📊 Performance Scores**\n`;
            summaryContent += `• Hook Power: **${hook}/10**\n`;
            summaryContent += `• Retention Logic: **${retention}/10**\n`;
            summaryContent += `• Conversion Trigger: **${conversion}/10**\n\n`;

            if (bigIdea) summaryContent += `**💡 Big Idea**\n> "${bigIdea}"\n\n`;

            if (hookCrit) summaryContent += `**🎣 Hook Analysis**\n${hookCrit}\n\n`;

            if (triggers.length > 0) {
                summaryContent += `**🧠 Key Psychological Triggers**\n`;
                triggers.forEach((t: string) => { summaryContent += `• ${t}\n`; });
            }
        }

        summaryContent += `\n---\nAsk me anything — why the hook works, how to replicate it, script ideas, or a full strategy brief.`;

        const initialMsg = { role: 'assistant', content: summaryContent };
        setMessages([initialMsg]);

        const savedId = await saveSessionState([initialMsg]);
        if (savedId) setSessionId(savedId);
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
                        userName: user?.firstName || user?.username || 'Creator',
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

    const generateHookVariations = async (briefData: any) => {
        if (!briefData) return;
        setIsSending(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/generate-hook-variations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    brief: briefData,
                    userId
                })
            });

            if (!res.ok) throw new Error('Hook variations generation failed');
            const data = await res.json();

            if (!data.variations || data.variations.length === 0) {
                throw new Error('No hook variations returned');
            }

            const hookContent = `⚡ **ALTERNATIVE HOOK VARIATIONS**\n\nHere are 3 high-converting hook variations (0-3s) using different psychological triggers for your script:\n\n` + 
                data.variations.map((v: any, index: number) => 
                    `${index + 1}. **${v.trigger}**\n🎬 **Visual**: ${v.visual}\n🎙️ **Audio**: ${v.audio}\n📝 **Overlay**: ${v.overlay}`
                ).join('\n\n');

            const hookMsg = {
                role: 'assistant',
                type: 'hooks',
                content: hookContent
            };

            const updatedMessages = [...messages, hookMsg];
            setMessages(updatedMessages);
            await saveSessionState(updatedMessages);

        } catch (err) {
            console.error(err);
            alert("Could not generate hook variations right now. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleAnalyze = async (overrideMode?: 'ad' | 'content' | 'product-intel') => {
        const currentMode = overrideMode || mode;

        if (activeTab === 'upload') {
            // — File upload path —
            if (!file) return;
            setIsAnalyzing(true);
            try {
                const token = await getToken();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', userId || '');
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
                    loadSession(data.sessionId);
                }
            } catch (err: any) {
                console.error(err);
                alert(`Upload Error: ${err.message}`);
                setIsAnalyzing(false);
            }
            return;
        }

        // — URL analysis path —
        if (activeTab === 'url' && !url) return;

        setIsAnalyzing(true);

        try {
            const token = await getToken();
            const endpoint = currentMode === 'product-intel' ? '/api/main/api/product-intel' : '/api/main/api/analyze';
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ 
                    sourceUrl: url, 
                    userId, 
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
                loadSession(data.sessionId);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Analysis Error: ${err.message}`);
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        const mobileHeader = document.getElementById('global-mobile-header');
        const desktopHeader = document.getElementById('global-desktop-header');
        
        if (mobileHeader) mobileHeader.style.display = isChatMode ? 'none' : '';
        if (desktopHeader) desktopHeader.style.display = isChatMode ? 'none' : '';
        
        return () => {
            if (mobileHeader) mobileHeader.style.display = '';
            if (desktopHeader) desktopHeader.style.display = '';
        };
    }, [isChatMode]);

    const switchMode = (newMode: 'ad' | 'content' | 'product-intel') => {
        if (newMode === result?.mode) return;
        setMode(newMode);
        setIsChatMode(false);
        setResult(null);
        setSessionId(null);
        if (url || file) {
            setTimeout(() => handleAnalyze(newMode), 100);
        }
    };

    return (
        <>
            <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-20 -mt-2 sm:-mt-4 md:-mt-8 space-y-6 sm:space-y-8 px-1 sm:px-2">

                <div className={`mb-6 sm:mb-12 flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 pb-8 sm:pb-12 ${isChatMode ? 'hidden lg:flex' : 'flex'}`}>
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-lime-600 mb-1 block italic">Workspace</span>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-slate-900 leading-tight tracking-tight">
                            {isChatMode ? 'Strategy ' : 'Creative '}
                            <span className="italic font-serif text-slate-400">
                                {isChatMode ? 'Lounge.' : 'Studio.'}
                            </span>
                        </h2>
                        {!isChatMode && (
                            <p className="text-slate-400 font-medium text-sm mt-3 max-w-lg">
                                Analyze any short-form video for ad intelligence, content structure, or product insights.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {!isChatMode && result && (
                            <button
                                onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); }}
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-lime-500 hover:text-slate-950 hover:scale-105 shadow-sm"
                            >
                                + New Scan
                            </button>
                        )}
                    </div>
                </div>

                {isCheckingPlan ? (
                            <div className="max-w-5xl mx-auto pt-24 text-center px-4">
                                <div className="w-10 h-10 border-4 border-lime-100 border-t-lime-500 rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="font-serif text-lg italic text-slate-400">Checking scans limit...</p>
                            </div>
                        ) : scansUsed >= scanLimit ? (
                            <div className="max-w-4xl mx-auto text-center space-y-8 py-16 bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-lime-900/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-slate-500/5 opacity-50"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="w-20 h-20 bg-lime-50 rounded-full flex items-center justify-center mx-auto text-lime-600 shadow-inner">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-3xl sm:text-5xl text-slate-900 italic">
                                        {planTier === 'free' ? 'Trial Limit Reached' : 'Scans Limit Reached'}
                                    </h3>
                                    <p className="text-slate-500 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                        {planTier === 'free' 
                                            ? <>You've used all <strong>3 free scans</strong>. Upgrade to keep running analyses and unlock unlimited strategy sessions.</>
                                            : <>You've reached your <strong>{scanLimit} monthly scans</strong>. Upgrade your plan to increase your limit.</>
                                        }
                                    </p>
                                    <div className="pt-4 max-w-sm mx-auto">
                                        <Link
                                            href="/dashboard/upgrade"
                                            className="w-full py-5 block bg-slate-900 text-white font-bold uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-lime-500 hover:text-slate-950 transition-all shadow-xl hover:shadow-lime-500/20 active:scale-95 text-center"
                                        >
                                            {planTier === 'free' ? 'Upgrade — Starting at $5/mo' : 'Upgrade Plan'}
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-6 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                                            <span>30+ Scans/mo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                                            <span>AI Strategy Assistant</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                                            <span>Director Reports</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !result ? (
                            <div className="max-w-5xl mx-auto space-y-6 md:space-y-12">
                                {!sessionId && (
                                    <>
                                        {planTier === 'free' && (
                                            <div className="flex items-center gap-3 px-5 py-3 bg-lime-50 border border-lime-100 rounded-2xl">
                                                <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                                                <span className="text-[11px] font-bold text-lime-700">
                                                    {scanLimit - scansUsed} of {scanLimit} free scans remaining
                                                </span>
                                                <span className="text-[10px] text-lime-400 hidden sm:inline">•</span>
                                                <Link href="/dashboard/upgrade" className="text-[10px] font-bold text-lime-500 hover:text-lime-700 transition-colors uppercase tracking-widest hidden sm:inline">
                                                    Upgrade
                                                </Link>
                                            </div>
                                        )}

                                        {/* Premium scan panel */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-lime-50 rounded-[2.5rem] sm:rounded-[3rem] blur-sm opacity-60" />
                                            <div className="relative bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-6 sm:p-10 md:p-14 space-y-6 sm:space-y-8">
                                                <div className="space-y-2">
                                                    <h3 className="font-serif text-xl sm:text-3xl md:text-4xl text-slate-900 italic font-bold">Studio Scan</h3>
                                                    <p className="text-slate-400 font-medium text-sm sm:text-base">Our AI engine will analyze structure and signals from any public TikTok, Reels, or Shorts URL.</p>
                                                </div>

                                                {/* Mode pills */}
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: 'ad', label: 'Ad Intel', icon: '📣' },
                                                        { id: 'content', label: 'Content Intel', icon: '🎬' },
                                                        { id: 'product-intel', label: 'Product Intel', icon: '📦' },
                                                    ].map(m => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setMode(m.id as any)}
                                                            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                                                                mode === m.id
                                                                    ? 'bg-slate-950 text-white shadow-md'
                                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            <span>{m.icon}</span>
                                                            {m.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* URL input */}
                                                <div className={`flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-4 border-2 transition-all duration-200 ${url ? 'border-lime-400' : 'border-transparent focus-within:border-lime-300'}`}>
                                                    <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Paste TikTok, Instagram Reels, or YouTube Shorts URL..."
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-0"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => handleAnalyze()}
                                                    disabled={isAnalyzing || !url}
                                                    className="w-full py-5 sm:py-6 bg-slate-950 text-white font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs rounded-2xl hover:bg-lime-500 hover:text-slate-950 hover:shadow-2xl hover:shadow-lime-500/20 transition-all duration-200 disabled:opacity-40 active:scale-95"
                                                >
                                                    {isAnalyzing ? (
                                                        <span className="flex items-center justify-center gap-3">
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Processing...
                                                        </span>
                                                    ) : 'Start Studio Scan'}
                                                </button>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sweet Spot: 15–60s Analysis</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isAnalyzing && (
                                    <div className="text-center p-8 sm:p-12 md:p-24 bg-gradient-to-br from-slate-950 to-lime-950 rounded-2xl sm:rounded-[3rem] text-white animate-pulse relative overflow-hidden shadow-2xl">
                                        <div className="w-10 h-10 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mx-auto mb-6 sm:mb-8"></div>
                                        <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic">AI Video Analyzer is processing...</h3>
                                        <div className="absolute -bottom-20 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-lime-500 rounded-full blur-[80px] sm:blur-[100px] opacity-10"></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Unified Studio Layout */
                            <div className="flex flex-col xl:flex-row gap-8 w-full items-start">
                                
                                {/* CTA Button if not in chat mode */}
                                {!isChatMode && (
                                    <div className="w-full max-w-2xl mx-auto text-center space-y-8 py-20 animate-fade-in-up">
                                        <div className="text-6xl mb-6">🎉</div>
                                        <h3 className="text-3xl sm:text-4xl font-serif italic text-slate-900">Analysis Complete.</h3>
                                        <p className="text-slate-500 font-medium">Your video's DNA has been fully extracted. Ready to discuss strategy?</p>
                                        
                                        <button
                                            onClick={startChat}
                                            className="w-full py-6 sm:py-8 bg-slate-950 text-white rounded-xl sm:rounded-[2rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-lime-500 hover:text-slate-950 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-4 sm:gap-6 group mx-auto"
                                        >
                                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-lime-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            Enter Strategy Lounge
                                            <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                                        </button>
                                    </div>
                                )}
                                
                                {/* Strategy Lounge Chat */}
                                {isChatMode && (
                                    <div className="w-full flex flex-col animate-fade-in relative z-20" style={{ minHeight: 'calc(100vh - 220px)' }}>
                                        <div className="flex-1 w-full pb-48 sm:pb-52">
                                            {result && (
                                                <div className="max-w-7xl mx-auto w-full mb-4 sm:mb-8 bg-white border-b sm:border border-slate-100 p-3 sm:p-4 sm:rounded-[1.5rem] shadow-sm flex items-center justify-between sticky top-0 lg:top-4 z-30">
                                                    {/* Center/Left: Model Switcher & Thumbnail */}
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <button 
                                                            onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
                                                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                                                            title="Menu"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                                        </button>
                                                        {result.thumbnail ? (
                                                            <img src={result.thumbnail} alt="Thumbnail" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover bg-slate-900 shadow-sm" />
                                                        ) : (
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                                                            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
                                                            <span className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-widest">
                                                                {result.mode === 'content' ? 'Content Intel' : result.mode === 'product-intel' ? 'Product Intel' : 'Ad Intel'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); window.history.replaceState({}, '', '/dashboard/analyze'); }}
                                                            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group"
                                                            title="New Scan"
                                                        >
                                                            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">New Scan</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setIsChatMode(false)}
                                                            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Close Lounge"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
                                                {/* Analysis Summary Card */}
                                                {result.analysis && (
                                                    <div className="w-full mb-8">
                                                        {result.mode === 'product-intel' ? (
                                                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                                                <h3 className="text-2xl font-serif italic font-bold text-slate-900 mb-6">{result.analysis.productName || 'Product Analysis'}</h3>
                                                                <div className="mb-8">
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-lime-600 mb-2">Verdict</p>
                                                                    <p className="text-slate-700 leading-relaxed font-medium">{result.analysis.verdict || 'Analysis pending.'}</p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Saturation</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.saturationScore || '-'}/10</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Profitability</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.profitViabilityScore || '-'}/10</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pain Fit</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.audiencePainFitScore || '-'}/10</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                                                <h3 className="text-xl font-serif italic font-bold text-slate-900 mb-6">Performance Metrics</h3>
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hook Power</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.metrics?.hook_power || '-'}/100</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Retention</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.metrics?.retention_score || '-'}/100</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conversion</p>
                                                                        <p className="text-xl font-bold text-slate-900">{result.analysis.metrics?.conversion_trigger || '-'}/100</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm ${msg.type === 'brief'
                                                            ? 'bg-gradient-to-br from-slate-950 to-lime-950 text-white border-2 sm:border-4 border-lime-500/20'
                                                            : msg.role === 'user'
                                                                ? 'bg-slate-900 text-white rounded-tr-none'
                                                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                                            }`}>
                                                            {msg.type === 'brief' && (
                                                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-lime-500 text-slate-950 rounded-lg sm:rounded-xl flex items-center justify-center font-serif italic text-lg sm:text-xl shadow-lg">B</div>
                                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-lime-400">Director Brief Forged</span>
                                                                </div>
                                                            )}
                                                            <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'brief' ? 'font-serif text-gray-100' : ''}`}>{msg.content}</p>
                                                            {msg.type === 'brief' && msg.raw && (
                                                                <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                                                                    <button
                                                                        onClick={() => generateHookVariations(msg.raw)}
                                                                        disabled={isSending}
                                                                        className="px-6 py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lime-500/20 disabled:opacity-50 active:scale-95 flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        ⚡ Generate Hook Variations
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {msg.role === 'assistant' && msg.type !== 'brief' && (
                                                                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-50 flex gap-4 sm:gap-6 items-center">
                                                                    <button 
                                                                        onClick={() => handleFeedback(idx, 'up')}
                                                                        className={`hover:scale-110 transition-transform ${msg.feedback === 'up' ? 'text-lime-500' : 'text-slate-400'}`}
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
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce" />
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce delay-75" />
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce delay-150" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="sticky bottom-4 lg:bottom-8 mt-auto z-40 pointer-events-none pb-4 lg:pb-0">
                                            <div className="pointer-events-auto max-w-5xl mx-auto relative group bg-white rounded-[2.5rem] border border-slate-200 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-lime-200 transition-all">
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
                                                            onClick={sendMessage}
                                                            disabled={isSending || !chatInput.trim()}
                                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-lime-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            Send
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="px-5 pb-3 pt-1 flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isRoastMode ? 'bg-red-500 animate-pulse' : 'bg-lime-500'}`} />
                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                                        {isRoastMode ? 'Roast Mode' : 'Creative Lounge'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
            </div>
        </>
    );
}
