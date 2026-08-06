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

    return (
        <>
            <div className="w-full max-w-2xl mx-auto animate-fade-in-up">

                {/* ── New Scan button (only when result is loaded but not in chat) ── */}
                {!isChatMode && result && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all shadow-sm"
                        >
                            + New Scan
                        </button>
                    </div>
                )}

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
                            <div className="max-w-2xl mx-auto flex flex-col justify-center min-h-[60vh]">
                                {!sessionId && (
                                    <div className="space-y-4">

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
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-150 ${
                                                        mode === m.id
                                                            ? 'bg-slate-900 text-lime-400 shadow-sm'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <span>{m.icon}</span>{m.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* URL input */}
                                        {activeTab === 'url' && (
                                            <div className={`flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border-2 shadow-sm transition-all duration-200 ${url ? 'border-lime-400' : 'border-slate-200 focus-within:border-lime-300'}`}>
                                                <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                <input
                                                    type="text"
                                                    placeholder="Paste TikTok, Reels, or Shorts URL…"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' && url) handleAnalyze(); }}
                                                    className="flex-1 bg-transparent border-none text-slate-900 placeholder-slate-300 font-medium text-sm focus:outline-none focus:ring-0"
                                                />
                                                {url && (
                                                    <button onClick={() => setUrl('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Upload dropzone */}
                                        {activeTab === 'upload' && (
                                            <div
                                                {...getRootProps()}
                                                className={`border-2 border-dashed rounded-2xl px-6 py-8 text-center cursor-pointer transition-all duration-200 ${
                                                    isDragActive ? 'border-lime-400 bg-lime-50' : file ? 'border-lime-300 bg-lime-50/40' : 'border-slate-200 bg-slate-50 hover:border-lime-300'
                                                }`}
                                            >
                                                <input {...getInputProps()} />
                                                {file ? (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="text-2xl">🎬</span>
                                                            <div className="min-w-0 text-left">
                                                                <p className="font-bold text-slate-900 text-sm truncate">{file.name}</p>
                                                                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-slate-600 text-sm">{isDragActive ? 'Drop it' : 'Drop MP4 or click to browse'}</p>
                                                        <p className="text-xs text-slate-400">Max {planTier === 'studio' ? '500MB' : planTier === 'creator' ? '200MB' : '50MB'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Switch URL / Upload */}
                                        <button
                                            onClick={() => setActiveTab(activeTab === 'url' ? 'upload' : 'url')}
                                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                                        >
                                            {activeTab === 'url' ? '📁 Upload a file instead' : '🔗 Paste a URL instead'}
                                        </button>

                                        {/* Analyze */}
                                        <button
                                            onClick={() => handleAnalyze()}
                                            disabled={isAnalyzing || (activeTab === 'url' ? !url : !file)}
                                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl hover:bg-lime-500 hover:text-slate-900 transition-all duration-200 disabled:opacity-30 active:scale-95"
                                        >
                                            {isAnalyzing ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Analyzing…
                                                </span>
                                            ) : 'Analyze →'}
                                        </button>
                                    </div>
                                )}

                                        {isAnalyzing && (
                                    <div className="mt-8 text-center py-16 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                                        <div className="w-8 h-8 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm font-medium text-slate-300">Analyzing your video…</p>
                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lime-500 rounded-full blur-[60px] opacity-10"></div>
                                    </div>
                                )}
                            </div>

                        ) : (
                            /* ══════════════════════════════════════════════════
                               STRATEGY LOUNGE — Premium Voice-First Interface
                            ══════════════════════════════════════════════════ */
                            <div className="w-full">

                                {/* Analysis complete CTA */}
                                {!isChatMode && (
                                    <div className="w-full max-w-xl mx-auto text-center space-y-6 py-24 animate-fade-in-up">
                                        {/* Video preview card */}
                                        {result?.thumbnail && (
                                            <div className="relative mx-auto w-28 h-28">
                                                <img src={result.thumbnail} alt="" className="w-full h-full object-cover rounded-2xl shadow-xl" />
                                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-md -z-10" />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Analysis Ready</span>
                                            </div>
                                            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Your Video DNA<br/><span className="text-slate-400 font-light italic">has been extracted.</span></h3>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Enter the Strategy Lounge to talk through your results, get hooks, scripts, and a full Director Brief — all via voice.</p>
                                        </div>
                                        <button
                                            onClick={startChat}
                                            className="group relative w-full overflow-hidden py-5 bg-slate-950 text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-950/30"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <span className="relative flex items-center justify-center gap-3">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
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
                                    />
                                )}
                            </div>
                        )}
            </div>
        </>
    );
}
