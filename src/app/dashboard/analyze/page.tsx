'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="max-w-6xl mx-auto pt-12 text-center">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-serif text-xl italic text-gray-400">Loading Studio...</p>
                </div>
            </DashboardLayout>
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
    const [userId, setUserId] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('url');

    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, [supabase]);

    const searchParams = useSearchParams();

    useEffect(() => {
        const queryUrl = searchParams.get('url');
        if (queryUrl && !result && !isAnalyzing) {
            setUrl(queryUrl);
            setActiveTab('url');
            // We need a small delay or check for userId if we want to save it immediately,
            // but the handleAnalyze function handles missing userId anyway (it just won't save).
            // Let's trigger it.
            const triggerInitialScan = async () => {
                // Wait for userId if it's coming
                let currentUserId = userId;
                if (!currentUserId) {
                    const { data: { user } } = await supabase.auth.getUser();
                    currentUserId = user?.id || null;
                }

                setIsAnalyzing(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/analyze-video-url`, {
                        method: 'POST',
                        body: JSON.stringify({ videoUrl: queryUrl, userId: currentUserId }),
                        headers: { 'Content-Type': 'application/json' },
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
    }, [searchParams, userId, supabase]);

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

    const [isChatMode, setIsChatMode] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRoastMode, setIsRoastMode] = useState(false);


    const loadSession = async (id: string) => {
        setIsSending(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/lounge-session/${id}`);
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

    const saveSessionState = async (updatedMessages: any[]) => {
        if (!userId || !result) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/save-lounge-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userId,
                    videoUrl: url || file?.name || 'Uploaded Video',
                    dna: result.analysis,
                    messages: updatedMessages
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (!sessionId) setSessionId(data.id);
            }
        } catch (err) {
            console.error('Save session failed', err);
        }
    };

    const startChat = async () => {
        setIsChatMode(true);
        setIsSending(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/creative-director-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            await saveSessionState([initialMsg]);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/creative-director-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            await saveSessionState(finalMessages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const generateFinalScript = async () => {
        setIsSending(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/generate-final-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages,
                    dna: result.analysis,
                    userId
                })
            });

            if (!res.ok) throw new Error('Generation failed');
            const data = await res.json();

            const scriptMsg = {
                role: 'assistant',
                type: 'script',
                content: `🎬 **FORGED SCRIPT: ${data.title}**\n\n**Concept**: ${data.concept}\n\n${data.shot_list.map((s: any) => `**${s.time}**\n🎬 Visual: ${s.visual}\n🎙️ Audio: ${s.audio}\n📝 Overlay: ${s.overlay}`).join('\n\n')}`,
                raw: data
            };

            const updatedMessages = [...messages, scriptMsg];
            setMessages(updatedMessages);
            await saveSessionState(updatedMessages);

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/analyze-video${activeTab === 'url' ? '-url' : ''}`, {
                method: 'POST',
                body: activeTab === 'upload' ? formData : JSON.stringify({ videoUrl: url, userId }),
                headers: activeTab === 'url' ? { 'Content-Type': 'application/json' } : {},
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert('Failed to analyze video. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto animate-fade-in-up pb-20 -mt-4 md:-mt-8 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-purple-50 pb-6 md:pb-8">
                    <div>
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-2 block">Intelligence Studio</span>
                        <h2 className="text-3xl lg:text-5xl font-serif text-gray-900 leading-tight tracking-tighter">
                            {isChatMode ? 'Strategy ' : 'Viral '}
                            <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setActiveTab('url')}
                                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'url' ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}
                                    >
                                        Competitor Scan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'upload' ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}
                                    >
                                        Audit My Draft
                                    </button>
                                </div>

                                {activeTab === 'url' ? (
                                    <div className="p-6 md:p-12 bg-white rounded-[2rem] md:rounded-[3rem] border border-purple-50 shadow-sm space-y-4 md:space-y-6">
                                        <h3 className="font-serif text-2xl md:text-3xl text-gray-900 italic">Paste Viral Blueprint</h3>
                                        <input
                                            type="text"
                                            placeholder="https://www.tiktok.com/@creator/video/..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-600 transition-all font-medium text-sm md:text-lg"
                                        />
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !url}
                                            className="w-full py-5 md:py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
                                        >
                                            {isAnalyzing ? 'Locating Viral DNA...' : 'Scan Masterclass'}
                                        </button>
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Viral Sweet Spot: 15-60s Recommended</span>
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
                                    <div className="text-center p-8 md:p-12 bg-gray-900 rounded-[2rem] md:rounded-[3rem] text-white animate-pulse">
                                        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                        <h3 className="font-serif text-xl md:text-2xl italic">AI Creative Director is Watching...</h3>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Result Dashboard */
                            <div className="max-w-3xl mx-auto space-y-6 md:space-y-12 animate-fade-in">
                                {/* Strategic Breakdown */}
                                <div className="space-y-4 md:space-y-8">
                                    <div className="p-6 md:p-10 bg-gray-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
                                        <div className="relative z-10 grid grid-cols-3 gap-4 md:gap-8">
                                            <div className="text-center">
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 md:mb-3">Hook</h3>
                                                <div className="text-3xl md:text-4xl font-serif italic text-purple-400">{result.analysis.metrics?.hook_power || 8}/10</div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 md:mb-3">Retention</h3>
                                                <div className="text-3xl md:text-4xl font-serif italic text-blue-400">{result.analysis.metrics?.retention_score || 7}/10</div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 md:mb-3">CTA</h3>
                                                <div className="text-3xl md:text-4xl font-serif italic text-green-400">{result.analysis.metrics?.conversion_trigger || 6}/10</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 bg-purple-50 rounded-2xl md:rounded-3xl italic relative overflow-hidden group">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">The Big Idea</h4>
                                        <p className="text-gray-900 text-lg md:text-xl font-serif leading-relaxed">"{result.analysis.big_idea}"</p>
                                    </div>

                                    <div className="p-6 md:p-8 bg-white border border-purple-100 rounded-2xl md:rounded-3xl space-y-4 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">The Secret Sauce</h4>
                                        <p className="text-gray-900 font-serif italic text-base md:text-lg leading-relaxed">"{result.analysis.hook_analysis.critique}"</p>
                                    </div>

                                    <button
                                        onClick={startChat}
                                        className="w-full py-6 md:py-8 bg-gray-900 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 md:gap-6 group"
                                    >
                                        <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                        Enter Strategy Lounge
                                        <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                                    </button>
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
                                    <div className={`max-w-[90%] md:max-w-[85%] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm ${msg.type === 'script'
                                        ? 'bg-gray-900 text-white border-4 border-purple-500/30'
                                        : msg.role === 'user'
                                            ? 'bg-gray-900 text-white rounded-tr-none'
                                            : 'bg-white text-gray-900 rounded-tl-none border border-purple-100'
                                        }`}>
                                        {msg.type === 'script' && (
                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-serif italic text-lg shadow-lg">S</div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Viral Masterpiece Forged</span>
                                            </div>
                                        )}
                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'script' ? 'font-serif text-gray-100' : ''}`}>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 md:p-6 rounded-[2rem] rounded-tl-none border border-purple-100 shadow-sm flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile-first Input Bar */}
                        <div className="relative group bg-white rounded-2xl md:rounded-[2rem] border border-purple-100 shadow-xl focus-within:ring-2 focus-within:ring-purple-600/20 transition-all">
                            <div className="flex gap-2 p-2 md:p-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Message your Director..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-3 py-2"
                                />
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <button
                                        onClick={generateFinalScript}
                                        disabled={isSending || messages.length < 1}
                                        title="Forge Script"
                                        className="p-2.5 md:p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-30"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={isSending || !chatInput.trim()}
                                        className="p-2.5 md:p-3 bg-gray-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="px-4 pb-2 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isRoastMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    {isRoastMode ? 'Roast Mode' : 'Director Lounge'}
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
        </DashboardLayout>
    );
}
