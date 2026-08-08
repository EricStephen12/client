'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { getPlanLimit } from '@/utils/plan';
import VoiceLounge from '@/components/TtsSpeakerVisualizer';

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
                <p className="font-serif text-lg sm:text-xl italic text-stone-500">Loading Video Analyzer...</p>
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
        maxSize: planTier === 'studio' ? 500 * 1024 * 1024 : planTier === 'creator' ? 200 * 1024 * 1024 : 50 * 1024 * 1024
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

    const sendMessage = async (overrideText?: string) => {
        const text = overrideText ?? chatInput;
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        if (!overrideText) setChatInput('');
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
                        isRoastMode,
                        // Voice Lounge: fast Groq instant model + short spoken replies
                        voiceMode: isChatMode,
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
                setIsSending(false);
                // Don't block voice on DB save
                void saveSessionState(finalMessages).then((savedId) => {
                    if (savedId) setSessionId(savedId);
                });
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
        const handleNewScan = () => {
            setResult(null);
            setIsChatMode(false);
            setSessionId(null);
            setUrl('');
            setFile(null);
            setMessages([]);
            window.history.replaceState({}, '', '/dashboard/analyze');
        };
        window.addEventListener('new-scan', handleNewScan);
        return () => window.removeEventListener('new-scan', handleNewScan);
    }, []);

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

    const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

    return (
        <>
            <div
                className={`w-full animate-fade-in-up ${
                    isChatMode
                        ? 'flex-1 flex flex-col min-h-0 h-full'
                        : !result
                          ? 'flex-1 flex flex-col'
                          : 'max-w-2xl mx-auto'
                }`}
            >

                {!isChatMode && result && (
                    <div className="flex justify-end mb-6 px-4">
                        <button
                            onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); }}
                            className="px-4 py-2 rounded-full bg-white/[0.08] text-stone-100 text-sm font-medium hover:bg-white/[0.12] transition-all"
                        >
                            + New scan
                        </button>
                    </div>
                )}

                {isCheckingPlan ? (
                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                                <div className="w-8 h-8 border-2 border-white/10 border-t-lime-400 rounded-full animate-spin mb-4"></div>
                                <p className="text-sm text-stone-500">Checking scans…</p>
                            </div>
                        ) : scansUsed >= scanLimit ? (
                            <div className="max-w-4xl mx-auto text-center space-y-8 py-16 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent opacity-50"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto text-lime-400 border border-lime-400/20">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-3xl sm:text-5xl text-stone-100 italic">
                                        {planTier === 'free' ? 'Trial Limit Reached' : 'Scans Limit Reached'}
                                    </h3>
                                    <p className="text-stone-500 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                        {planTier === 'free' 
                                            ? <>You've used all <strong className="text-stone-300">3 free scans</strong>. Upgrade to keep running analyses and unlock unlimited strategy sessions.</>
                                            : <>You've reached your <strong className="text-stone-300">{scanLimit} monthly scans</strong>. Upgrade your plan to increase your limit.</>
                                        }
                                    </p>
                                    <div className="pt-4 max-w-sm mx-auto">
                                        <Link
                                            href="/dashboard/upgrade"
                                            className="w-full py-5 block bg-lime-400 text-slate-950 font-bold uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-lime-300 transition-all active:scale-95 text-center"
                                        >
                                            {planTier === 'free' ? 'Upgrade — Starting at $5/mo' : 'Upgrade Plan'}
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-6 pt-8 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                                            <span>30+ Scans/mo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                                            <span>AI Strategy Assistant</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                                            <span>Director Reports</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !result ? (
                            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 min-h-[70vh]">
                                {!sessionId && !isAnalyzing && (
                                    <div className="w-full max-w-[720px] flex flex-col items-center gap-8">
                                        <h1 className="text-[2rem] sm:text-[2.75rem] font-normal tracking-tight text-white text-center leading-tight">
                                            Let&apos;s jump in, {firstName}.
                                        </h1>

                                        {/* Gemini-style pill composer */}
                                        <div className="w-full rounded-[28px] bg-[#1e1f20] border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] px-3 py-2.5 sm:px-4 sm:py-3">
                                            {activeTab === 'url' ? (
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('upload')}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#c4c7c5] hover:bg-white/5 flex-shrink-0"
                                                        title="Upload a file"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="text"
                                                        placeholder="Paste a TikTok, Reels, or Shorts URL…"
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' && url) handleAnalyze(); }}
                                                        className="flex-1 bg-transparent border-none text-white placeholder-[#8e918f] text-[15px] focus:outline-none focus:ring-0 py-2"
                                                    />
                                                    <div className="hidden sm:flex items-center">
                                                        <select
                                                            value={mode}
                                                            onChange={(e) => setMode(e.target.value as 'ad' | 'content' | 'product-intel')}
                                                            className="bg-transparent text-[#c4c7c5] text-sm border-none focus:ring-0 cursor-pointer pr-1"
                                                        >
                                                            <option value="ad" className="bg-[#1e1f20]">Ad Intel</option>
                                                            <option value="content" className="bg-[#1e1f20]">Content</option>
                                                            <option value="product-intel" className="bg-[#1e1f20]">Product</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAnalyze()}
                                                        disabled={!url || isAnalyzing}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-lime-400 text-slate-950 disabled:bg-white/10 disabled:text-[#8e918f] hover:bg-lime-300 transition-colors flex-shrink-0"
                                                        title="Analyze"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    {...getRootProps()}
                                                    className={`flex items-center gap-3 px-2 py-3 cursor-pointer rounded-2xl ${isDragActive ? 'bg-lime-400/10' : ''}`}
                                                >
                                                    <input {...getInputProps()} />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTab('url'); }}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#c4c7c5] hover:bg-white/5 flex-shrink-0"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                                    </button>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        {file ? (
                                                            <p className="text-[15px] text-white truncate">{file.name}</p>
                                                        ) : (
                                                            <p className="text-[15px] text-[#8e918f]">
                                                                {isDragActive ? 'Drop video here' : 'Drop an MP4 or click to browse'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); if (file) handleAnalyze(); }}
                                                        disabled={!file || isAnalyzing}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-lime-400 text-slate-950 disabled:bg-white/10 disabled:text-[#8e918f] flex-shrink-0"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-2 sm:hidden">
                                            {[
                                                { id: 'ad', label: 'Ad' },
                                                { id: 'content', label: 'Content' },
                                                { id: 'product-intel', label: 'Product' },
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setMode(m.id as 'ad' | 'content' | 'product-intel')}
                                                    className={`px-3 py-1.5 rounded-full text-xs ${
                                                        mode === m.id ? 'bg-white/10 text-white' : 'text-[#8e918f]'
                                                    }`}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="text-center py-10">
                                        <div className="w-8 h-8 border-2 border-white/10 border-t-lime-400 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm text-[#c4c7c5]">Analyzing your video…</p>
                                    </div>
                                )}
                            </div>

                        ) : (
                            /* ══════════════════════════════════════════════════
                               STRATEGY LOUNGE — Premium Voice-First Interface
                            ══════════════════════════════════════════════════ */
                            <div className={`w-full ${isChatMode ? 'flex-1 flex flex-col min-h-0 h-full' : ''}`}>

                                {/* Analysis complete CTA */}
                                {!isChatMode && (
                                    <div className="w-full max-w-xl mx-auto text-center space-y-6 py-24 animate-fade-in-up">
                                        {/* Video preview card */}
                                        {result?.thumbnail && (
                                            <div className="relative mx-auto w-28 h-28">
                                                <img src={result.thumbnail} alt="" className="w-full h-full object-cover rounded-2xl border border-white/10" />
                                                <div className="absolute -inset-1 rounded-2xl bg-lime-400/10 blur-md -z-10" />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-400/10 border border-lime-400/20 rounded-full mb-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                                                <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">Analysis Ready</span>
                                            </div>
                                            <h3 className="text-4xl font-bold text-stone-100 tracking-tight">Your Video DNA<br/><span className="text-stone-500 font-light italic">has been extracted.</span></h3>
                                            <p className="text-stone-500 text-sm max-w-sm mx-auto">Enter the Strategy Lounge to talk through your results, get hooks, scripts, and a full Director Brief — all via voice.</p>
                                        </div>
                                        <button
                                            onClick={startChat}
                                            className="group relative w-full overflow-hidden py-5 bg-lime-400 text-slate-950 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-lime-300 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <span className="relative flex items-center justify-center gap-3">
                                                <span className="w-2 h-2 bg-slate-950 rounded-full animate-pulse" />
                                                Enter Strategy Lounge
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* ── Voice Lounge ── */}
                                {isChatMode && (
                                    <VoiceLounge
                                        textToSpeak={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
                                        messages={messages}
                                        isThinking={isSending}
                                        onSendMessage={(text) => sendMessage(text)}
                                        isSending={isSending}
                                        onForgeBrief={messages.length > 2 ? forgeDirectorBrief : undefined}
                                        onEndSession={() => setIsChatMode(false)}
                                        userName={user?.firstName || user?.fullName || undefined}
                                    />
                                )}
                            </div>
                        )}
            </div>
        </>
    );
}
