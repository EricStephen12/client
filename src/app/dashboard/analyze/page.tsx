'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useState(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    });

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

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('video', file);
        if (userId) formData.append('userId', userId);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/analyze-video`, {
                method: 'POST',
                body: formData,
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

    const [selectedRec, setSelectedRec] = useState<string | null>(null);

    return (
        <DashboardLayout>
            <div className="animate-fade-in-up pb-20">
                <div className="mb-12 border-b border-purple-100 pb-8 flex justify-between items-end">
                    <div>
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-2 block">AI Creative Director</span>
                        <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight tracking-tighter">
                            Private <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Analysis.</span>
                        </h2>
                        <p className="text-gray-500 mt-4 text-lg font-light max-w-2xl leading-relaxed">
                            Upload your creative for a frame-by-frame critique. Our AI compares your ad against
                            millions of viral data points to give you a definitive Viral Score.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    {/* LEFT COLUMN: Upload & Preview */}
                    <div className="space-y-10">
                        {/* Upload Area */}
                        {!previewUrl ? (
                            <div
                                {...getRootProps()}
                                className={`h-96 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-600 bg-purple-50 scale-[1.01]' : 'border-purple-100 hover:border-purple-400 hover:bg-white'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="text-center p-8 space-y-4">
                                    <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto text-purple-300 transition-transform group-hover:scale-110">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-bold text-xl font-serif">Drop your video here</p>
                                        <p className="text-gray-400 text-sm font-medium tracking-wide">MP4, MOV up to 50MB</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl aspect-[9/16] max-h-[650px] mx-auto w-full max-w-md ring-1 ring-stone-900/10">
                                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); }}
                                        className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors backdrop-blur-md"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Analyze Button */}
                                {!result && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full max-w-md mx-auto block py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:shadow-xl hover:shadow-purple-100 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-wait disabled:transform-none"
                                    >
                                        {isAnalyzing ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing Creative...
                                            </span>
                                        ) : 'Analyze Video'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading State */}
                        {isAnalyzing && (
                            <div className="text-center p-12 bg-white rounded-[2.5rem] border border-purple-50 shadow-sm animate-pulse">
                                <div className="w-16 h-16 border-4 border-purple-50 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="font-serif text-3xl text-gray-900 italic">AI is Watching...</h3>
                                <p className="text-gray-400 mt-2 font-medium">Analyzing hook retention, pacing, and visual appeal against viral benchmarks.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="space-y-8">
                        {result && (
                            <div className="animate-fade-in-up space-y-12">
                                {/* Score Dashboard */}
                                <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Viral Potential Score</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-8xl font-serif italic text-purple-400">{result.analysis.score}</span>
                                                <span className="text-2xl text-white/20 font-serif">/10</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={() => {
                                                    const params = new URLSearchParams({
                                                        productName: result.analysis.niche,
                                                        dna: JSON.stringify({
                                                            hook: result.analysis.hook_analysis.critique,
                                                            problem: result.analysis.pacing_analysis.critique,
                                                            solution: result.analysis.cta_analysis.critique,
                                                            niche: result.analysis.niche
                                                        })
                                                    });
                                                    window.location.href = `/dashboard/script-generator?${params.toString()}`;
                                                }}
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl hover:shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-3"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Remix This DNA
                                            </button>

                                            <div className="grid grid-cols-1 gap-3">
                                                {result.analysis.viral_checklist.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {item.passed ? '✓' : '✕'}
                                                        </div>
                                                        <span className="text-white/60">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Dive Analysis */}
                                <div className="space-y-12">
                                    <div className="group">
                                        <h4 className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-4">
                                            <span className="w-8 h-[1px] bg-gray-100"></span>
                                            01. The Hook (0-3s)
                                        </h4>
                                        <div className="pl-12 border-l-2 border-purple-50 group-hover:border-purple-600 transition-all duration-500">
                                            <p className="text-gray-900 text-xl leading-relaxed font-serif italic">"{result.analysis.hook_analysis.critique}"</p>
                                            <div className="mt-6 bg-purple-50/50 border-l-4 border-purple-200 p-6 rounded-r-2xl">
                                                <p className="text-gray-800 text-sm font-medium leading-relaxed">
                                                    <span className="text-purple-600 uppercase text-[10px] font-black tracking-widest mr-3">Technical Fix</span>
                                                    {result.analysis.hook_analysis.suggestion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <h4 className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-4">
                                            <span className="w-8 h-[1px] bg-gray-100"></span>
                                            02. Pacing & Engagement
                                        </h4>
                                        <div className="pl-12 border-l-2 border-purple-50 group-hover:border-purple-600 transition-all duration-500">
                                            <p className="text-gray-600 leading-relaxed font-medium italic">"{result.analysis.pacing_analysis.critique}"</p>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <h4 className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-4">
                                            <span className="w-8 h-[1px] bg-gray-100"></span>
                                            03. Call to Action
                                        </h4>
                                        <div className="pl-12 border-l-2 border-purple-50 group-hover:border-purple-600 transition-all duration-500">
                                            <p className="text-gray-600 leading-relaxed font-medium italic">"{result.analysis.cta_analysis.critique}"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="pt-12 border-t border-purple-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="font-serif text-3xl text-gray-900 italic">Viral Inspiration</h3>
                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Niche DNA: <span className="text-purple-600">{result.analysis.niche}</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        {result.recommendations.map((rec: any) => (
                                            <div
                                                key={rec.id}
                                                className="group relative aspect-[9/16] bg-purple-50 cursor-pointer overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-100 transition-all duration-700"
                                                onClick={() => setSelectedRec(rec.videoUrl)}
                                            >
                                                <img src={rec.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                                <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/40 transition-colors flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 duration-500 shadow-xl">
                                                        <svg className="w-5 h-5 fill-purple-600 translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 flex flex-col items-start translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                        {rec.views} views
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Modal for Recs */}
                {selectedRec && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedRec(null)}>
                        <div className="relative w-full max-w-sm h-[80vh] bg-black shadow-2xl overflow-hidden rounded-xl flex items-center justify-center ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                            <button
                                className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full p-2"
                                onClick={() => setSelectedRec(null)}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <iframe
                                src={`https://www.tiktok.com/embed/v2/${selectedRec.split('/video/')[1]?.split('?')[0] || selectedRec}`}
                                className="w-full h-full border-0"
                                allow="autoplay; encrypted-media;"
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
