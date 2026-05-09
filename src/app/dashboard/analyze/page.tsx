'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto pt-24 text-center">
                <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-serif text-xl italic text-slate-400">Preparing the Studio...</p>
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

    const profile = isLoaded && user ? {
        plan_type: (user.publicMetadata as any)?.plan_type || 'free'
    } : null;

    const searchParams = useSearchParams();

    // 1. All State Definitions
    const [isChatMode, setIsChatMode] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRoastMode, setIsRoastMode] = useState(false);

    // 2. Logic Definitions
    const loadSession = async (id: string) => {
        setIsSending(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/lounge-session/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResult({ analysis: data.dna });
                setMessages(data.messages);
                setSessionId(data.id);
                setIsChatMode(true);
            }
        } catch (err) {
            console.error('Load session failed', err);
        } finally {
            setIsSending(false);
        }
    };

    // 3. Lifecycle Hooks
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
                // Trigger Sidebar Refresh
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

            // Initial Save
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

        try {
            const token = await getToken();
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
                })
            });

            if (!res.ok) throw new Error('Chat failed');
            const data = await res.json();
            const assistantMsg = { role: 'assistant', content: data.message };
            const finalMessages = [...newMessages, assistantMsg];
            setMessages(finalMessages);

            // Auto-save progress
            const savedId = await saveSessionState(finalMessages);
            if (savedId) setSessionId(savedId);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
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

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            setResult(data);

            // AUTO-SAVE: Persistence on Scan (Don't wait for chat)
            if (userId && data.analysis) {
                await saveSessionState([], null);
            }

            // VISION 2026: Auto-enter Chat Mode so AI can ask for context BEFORE strategy
            setTimeout(() => {
                startChat();
            }, 1000);

        } catch (err) {
            console.error(err);
            alert('Failed to analyze video. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <>
            <div className="max-w-6xl mx-auto animate-fade-in-up pb-20 -mt-4 md:-mt-8 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="mb-6 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 pb-12">
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-600 mb-2 block italic">Studio Workspace</span>
                        <h2 className="text-3xl lg:text-7xl font-sans font-bold text-slate-900 leading-tight tracking-tight">
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
                                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                ← Back
                            </button>
                        )}
                        {!isChatMode && result && (
                            <button
                                onClick={() => { setIsChatMode(false); setResult(null); setSessionId(null); setUrl(''); setFile(null); }}
                                className="px-4 md:px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                            >
                                + New Scan
                            </button>
                        )}
                    </div>
                </div>

                {!isChatMode ? (
                    <>
                        {/* Input Phase */}
                        {!result ? (
                            <div className="max-w-4xl mx-auto space-y-6 md:space-y-12">
                                {/* Tab Switcher */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('url')}
                                        className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'url' ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-amber-200'}`}
                                    >
                                        Reference Scan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'upload' ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-amber-200'}`}
                                    >
                                        Draft Audit
                                    </button>
                                </div>

                                {activeTab === 'url' ? (
                                    <div className="p-10 md:p-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="font-serif text-3xl md:text-5xl text-slate-900 italic">Paste Viral Blueprint</h3>
                                            <p className="text-slate-400 font-light text-lg">Our engine will extract the psychological DNA from any public video URL.</p>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="https://www.tiktok.com/@creator/video/..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full p-6 md:p-8 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-amber-500 transition-all font-medium text-lg md:text-xl"
                                        />
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !url}
                                            className="w-full py-6 md:py-8 bg-indigo-950 text-white font-bold uppercase tracking-[0.4em] text-xs rounded-3xl hover:bg-amber-500 hover:text-slate-950 hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
                                        >
                                            {isAnalyzing ? 'Locating Viral DNA...' : 'Scan Masterclass'}
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Creative Sweet Spot: 15-60s Analysis</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className="h-[280px] md:h-[400px] bg-white border-2 border-dashed border-purple-100 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all"
                                    >
                                        <input {...getInputProps()} />
                                        <div className="text-center p-6 md:p-8 space-y-4">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto text-purple-300">
                                                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            <p className="text-gray-900 font-bold text-lg md:text-xl font-serif">Audit My mp4</p>
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sweet Spot: 15-60s</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="text-center p-12 md:p-24 bg-gradient-to-br from-indigo-950 to-purple-950 rounded-[3rem] text-white animate-pulse relative overflow-hidden shadow-2xl">
                                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-8"></div>
                                        <h3 className="font-serif text-2xl md:text-4xl italic">AI Creative Director is Watching...</h3>
                                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-10"></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Result Dashboard */
                            <div className="max-w-3xl mx-auto space-y-6 md:space-y-12 animate-fade-in">
                                {/* Strategic Breakdown */}
                                <div className="space-y-6 md:space-y-10">
                                    <div className="p-8 md:p-16 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                                        <div className="relative z-10 grid grid-cols-3 gap-8">
                                            <div className="text-center">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Hook Power</h3>
                                                <div className="text-4xl md:text-6xl font-sans font-bold text-slate-900">{result.analysis.metrics?.hook_power || 8}<span className="text-xl text-slate-300 font-light ml-1">/10</span></div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Retention</h3>
                                                <div className="text-4xl md:text-6xl font-sans font-bold text-amber-500">{result.analysis.metrics?.retention_score || 7}<span className="text-xl text-slate-200 font-light ml-1">/10</span></div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Conversion</h3>
                                                <div className="text-4xl md:text-6xl font-sans font-bold text-slate-900">{result.analysis.metrics?.conversion_trigger || 6}<span className="text-xl text-slate-300 font-light ml-1">/10</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 md:p-12 bg-amber-50 border border-amber-100 rounded-[2.5rem] italic relative overflow-hidden group">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-4">The Big Idea</h4>
                                        <p className="text-slate-900 text-xl md:text-3xl font-serif leading-relaxed">"{result.analysis.big_idea}"</p>
                                        <div className="absolute top-0 right-0 p-8 opacity-10 text-4xl">💡</div>
                                    </div>

                                    <div className="p-10 md:p-12 bg-white border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 uppercase italic">The Secret Sauce</h4>
                                        <p className="text-slate-900 font-serif italic text-lg md:text-xl leading-relaxed">"{result.analysis.hook_analysis.critique}"</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <button
                                            onClick={startChat}
                                            className="flex-1 py-8 bg-indigo-950 text-white rounded-[2rem] font-bold uppercase tracking-[0.4em] text-xs hover:bg-amber-500 hover:text-slate-950 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-950/20 flex items-center justify-center gap-6 group"
                                        >
                                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            Enter Strategy Lounge
                                            <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                                        </button>

                                        {profile?.plan_type === 'agency' && (
                                            <Link
                                                href={`/dashboard/report/${sessionId || ''}`}
                                                className="px-10 py-8 border border-slate-100 text-slate-400 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-amber-600 transition-all flex items-center justify-center gap-3"
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
                    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in flex flex-col" style={{ height: 'calc(100dvh - 220px)', minHeight: '400px' }}>
                        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-2 md:pr-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] md:max-w-[85%] p-6 md:p-10 rounded-[2.5rem] shadow-sm ${msg.type === 'brief'
                                        ? 'bg-gradient-to-br from-indigo-950 to-purple-950 text-white border-4 border-amber-500/20'
                                        : msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none'
                                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                        }`}>
                                        {msg.type === 'brief' && (
                                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                                <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-serif italic text-xl shadow-lg">B</div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400">Director Brief Forged</span>
                                            </div>
                                        )}
                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'brief' ? 'font-serif text-gray-100' : ''}`}>{msg.content}</p>
                                                 {msg.role === 'assistant' && msg.type !== 'brief' && (
                                            <div className="mt-6 pt-6 border-t border-slate-50 flex gap-6 items-center">
                                                <button 
                                                    onClick={() => handleFeedback(idx, 'up')}
                                                    className={`hover:scale-110 transition-transform ${msg.feedback === 'up' ? 'text-amber-500' : 'text-slate-400'}`}
                                                >
                                                    <svg className="w-5 h-5" fill={msg.feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708C19.746 10 20.5 10.852 20.5 11.852c0 .324-.078.636-.231.912l-2.455 4.39A2.5 2.5 0 0115.656 18H10V10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h5v8z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleFeedback(idx, 'down')}
                                                    className={`hover:scale-110 transition-transform ${msg.feedback === 'down' ? 'text-red-400' : 'text-slate-400'}`}
                                                >
                                                    <svg className="w-5 h-5" fill={msg.feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.292C4.254 14 3.5 13.148 3.5 12.148c0-.324.078-.636.231-.912l2.455-4.39A2.5 2.5 0 018.344 6H14v8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6h5a2 2 0 012 2v4a2 2 0 01-2 2h-5V6z" /></svg>
                                                </button>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Director Feedback</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 shadow-sm flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile-first Input Bar */}
                        <div className="relative group bg-white rounded-3xl border border-slate-100 shadow-2xl focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
                            <div className="flex gap-4 p-4">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Message your Creative Partner..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium px-4 py-2"
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={forgeDirectorBrief}
                                        disabled={isSending || messages.length < 1}
                                        title="Forge Director Brief"
                                        className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors disabled:opacity-30"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={isSending || !chatInput.trim()}
                                        className="p-4 bg-indigo-950 text-white rounded-2xl hover:bg-amber-500 hover:text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 pb-4 flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isRoastMode ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {isRoastMode ? 'Roast Mode' : 'Creative Lounge'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d8b4fe; }
            `}</style>
        </>
    );
}
