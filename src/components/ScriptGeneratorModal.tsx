'use client';
import { useState, useEffect, Fragment } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dialog, Transition } from '@headlessui/react';

interface ScriptGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    adId?: string;
    adTitle?: string;
    initialProductName?: string;
    initialDescription?: string;
}

export default function ScriptGeneratorModal({
    isOpen,
    onClose,
    adId,
    adTitle,
    initialProductName = '',
    initialDescription = ''
}: ScriptGeneratorModalProps) {
    const [step, setStep] = useState(1);
    const [productName, setProductName] = useState(initialProductName);
    const [description, setDescription] = useState(initialDescription);
    const [questions, setQuestions] = useState<string[]>([]);
    const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
    const [currentLogIdx, setCurrentLogIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [script, setScript] = useState<any>(null);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState<string | null>(null);


    // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setProductName(initialProductName);
            setDescription(initialDescription);
            setQuestions([]);
            setAnswers({});
            setScript(null);
            setError('');

        }
    }, [isOpen, initialProductName, initialDescription]);

    // Simulate real-time log scanning
    useEffect(() => {
        if (isLoading && analysisLogs.length > 0 && step === 1) {
            const interval = setInterval(() => {
                setCurrentLogIdx(prev => (prev + 1) % analysisLogs.length);
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [isLoading, analysisLogs, step]);

    // Step 1 -> Step 2 (Fetch Questions)
    const handleNextToQuestions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adId) {
            handleFinalGenerate();
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisLogs([
            "Connecting to AI Vision core...",
            "Initializing frame descriptors...",
            "Scanning video layers...",
        ]);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/script-strategy-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, productName, description })
            });
            const data = await res.json();
            if (data.questions) {
                setAnalysisLogs(data.analysis_logs || []);
                setQuestions(data.questions);
                setTimeout(() => {
                    setStep(2);
                    setIsLoading(false);
                }, 4000);
            } else {
                handleFinalGenerate();
            }
        } catch (err) {
            handleFinalGenerate();
        }
    };

    // Step 2 -> Step 3 (Final Generate)
    const handleFinalGenerate = async () => {
        setIsLoading(true);
        setError('');
        setStep(3);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/generate-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    description,
                    adId,
                    userId,
                    privateDna: null,
                    answers: Object.values(answers)
                }),
            });

            if (!response.ok) throw new Error('Failed to generate script');
            const data = await response.json();
            setScript(data);


        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (step > 1 && !script) {
            if (confirm('Are you sure you want to close? Your progress will be lost.')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-[2.5rem] bg-white p-8 md:p-12 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="mb-8 border-b border-purple-100 pb-6 flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-2 block">AI Copywriter</span>
                                        <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-3 tracking-tight">Elite Script Flow</h2>
                                        {adTitle && (
                                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                Remixing: "{adTitle}"
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-full"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Progress Steps */}
                                <div className="flex items-center gap-4 mb-8">
                                    {[1, 2, 3].map((s) => (
                                        <div key={s} className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500 ${step === s ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100' : 'text-gray-400 border-gray-200'}`}>
                                                {s}
                                            </div>
                                            {s < 3 && <div className="w-8 h-[1px] bg-gray-100"></div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {step === 1 && (
                                        <form onSubmit={handleNextToQuestions} className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">What are you selling?</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent border-b border-purple-100 py-3 text-2xl font-serif italic focus:border-purple-600 focus:outline-none transition-colors placeholder:text-gray-200 text-gray-900"
                                                    placeholder="Product Name..."
                                                    value={productName}
                                                    onChange={(e) => setProductName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">The Problem / Solution</label>
                                                <textarea
                                                    className="w-full bg-transparent border border-gray-100 p-6 text-sm leading-relaxed focus:border-purple-600 focus:outline-none transition-colors min-h-[150px] rounded-2xl italic font-light"
                                                    placeholder="Describe the main benefit..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.3em] hover:shadow-xl hover:shadow-purple-200 transition-all relative overflow-hidden group shadow-lg disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <span className="flex items-center gap-3">
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                            AI IS WATCHING...
                                                        </span>
                                                        <span className="text-[10px] text-white/50 tracking-widest animate-pulse font-sans">
                                                            {analysisLogs[currentLogIdx] || "INITIALIZING..."}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    adId ? 'Start Strategic Interview' : 'Generate Script'
                                                )}
                                            </button>
                                        </form>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-10 text-gray-900">
                                            <div className="p-8 bg-purple-50 border border-purple-100 rounded-3xl space-y-4 shadow-sm">
                                                <div className="flex items-center gap-2 text-purple-600">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Viral Blueprint Extracted</span>
                                                </div>
                                                <p className="text-gray-800 font-serif italic text-xl leading-snug">
                                                    The Agency strategy is ready.
                                                </p>
                                                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                                    "Our AI Director has deconstructed the hook chemistry and emotional frequency of the original ad. Answer these to finalize the remix."
                                                </p>
                                            </div>

                                            {questions.map((q, i) => (
                                                <div key={i} className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{q}</label>
                                                    <textarea
                                                        className="w-full bg-transparent border border-purple-100 p-4 text-sm focus:border-purple-600 focus:outline-none rounded-2xl italic font-light"
                                                        rows={2}
                                                        onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                                                        placeholder="Your answer..."
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                onClick={handleFinalGenerate}
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.3em] hover:shadow-xl hover:shadow-purple-200 transition-all shadow-lg disabled:opacity-50"
                                            >
                                                {isLoading ? 'Writing Final Script...' : 'Generate Viral Script'}
                                            </button>
                                        </div>
                                    )}

                                    {step === 3 && isLoading && (
                                        <div className="py-20 text-center space-y-6">
                                            <div className="w-16 h-16 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto shadow-sm"></div>
                                            <p className="text-gray-500 font-serif italic text-2xl animate-pulse">Crafting your narrative masterpiece...</p>
                                        </div>
                                    )}

                                    {step === 3 && script && (
                                        <div className="space-y-8">
                                            {/* Storyboard Table */}
                                            {script.shot_list && script.shot_list.length > 0 && (
                                                <div className="bg-white border border-purple-50 rounded-3xl overflow-hidden shadow-sm">
                                                    <div className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
                                                        <h3 className="text-2xl font-serif text-gray-900 mb-2">Production Storyboard</h3>
                                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Frame-by-frame visual blueprint</p>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                                <tr>
                                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Scene</th>
                                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Visual Direction</th>
                                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Audio / Voiceover</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {script.shot_list.map((scene: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                                                                        <td className="px-6 py-6 text-sm font-bold text-purple-600">#{idx + 1}</td>
                                                                        <td className="px-6 py-6">
                                                                            <p className="text-sm text-gray-900 leading-relaxed font-medium">{scene.visual}</p>
                                                                        </td>
                                                                        <td className="px-6 py-6">
                                                                            <p className="text-sm text-gray-700 leading-relaxed italic font-light">{scene.audio}</p>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Aesthetic Guide */}
                                            {script.aesthetic_guide && (
                                                <div className="p-10 bg-gradient-to-br from-gray-900 to-black text-white rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden border border-white/5">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                                    <div className="relative">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 block mb-3">Aesthetic DNA</span>
                                                        <h3 className="text-2xl font-serif italic text-white mb-6">Visual & Tonal Blueprint</h3>
                                                        <div className="space-y-4 text-white/70 text-sm leading-relaxed font-light">
                                                            {(typeof script.aesthetic_guide === 'string' ? script.aesthetic_guide.split('\n') : [String(script.aesthetic_guide)]).map((line: string, i: number) => (
                                                                line && line.trim() && <p key={i}>{line}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-white border border-purple-50 rounded-2xl shadow-sm">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600 block mb-4">The Hook</span>
                                                    <p className="text-lg font-serif italic text-gray-900">"{(script.summary || script).hook}"</p>
                                                </div>

                                                <div className="p-6 bg-white border border-purple-50 rounded-2xl shadow-sm">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 block mb-4">The CTA</span>
                                                    <p className="text-sm font-bold text-gray-900">"{(script.summary || script).cta}"</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons - Show directly with results */}
                                            <div className="space-y-4 pt-6 border-t border-purple-100">
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/content-generator?productName=${encodeURIComponent(productName)}&description=${encodeURIComponent(description)}`}
                                                    className="w-full p-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all group shadow-lg shadow-purple-100"
                                                >
                                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Generate Visual Assets</span>
                                                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                </button>

                                                <button
                                                    onClick={() => window.location.href = '/dashboard/analyze'}
                                                    className="w-full p-5 border border-purple-100 text-gray-900 rounded-2xl flex items-center justify-between hover:bg-purple-50 transition-all group"
                                                >
                                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Private Video Scan</span>
                                                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                </button>

                                                <button
                                                    onClick={onClose}
                                                    className="w-full p-5 text-gray-400 rounded-2xl flex items-center justify-center hover:text-gray-900 transition-colors group"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Close and continue</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
