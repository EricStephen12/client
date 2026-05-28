'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
    onComplete: (data: { niche: string; goal: string; source: string }) => void;
    userName: string;
}

export default function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState('');
    const [goal, setGoal] = useState('');
    const [source, setSource] = useState('');

    const sources = [
        { id: 'youtube', label: 'YouTube', icon: '▶️' },
        { id: 'tiktok', label: 'TikTok / Instagram', icon: '📱' },
        { id: 'twitter', label: 'Twitter / X', icon: '🐦' },
        { id: 'friend', label: 'Word of Mouth', icon: '🤝' },
    ];

    const niches = [
        { id: 'creator', label: 'Content Creator / Influencer', icon: '✨' },
        { id: 'ugc', label: 'UGC Creator', icon: '📱' },
        { id: 'agency', label: 'Marketing Agency', icon: '🎨' },
        { id: 'ecom', label: 'E-commerce Brand', icon: '🛍️' },
    ];

    const goals = [
        { id: 'hooks', label: 'Find Viral Hooks', desc: 'Stop the scroll in the first 2 seconds.' },
        { id: 'analyze', label: 'Analyze Competitors', desc: 'Reverse engineer successful videos.' },
        { id: 'scripts', label: 'Write Better Scripts', desc: 'Turn winning videos into fresh scripts.' },
    ];

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else onComplete({ niche, goal, source });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden relative my-auto mt-12 sm:mt-auto"
            >

                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        className="h-full bg-purple-500 transition-all duration-500"
                    />
                </div>

                <div className="p-12 md:p-20">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-600 block">Step 01</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
                                        Welcome, <span className="italic font-serif text-slate-400">{userName}.</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Let's personalize your studio. What's your primary business niche?
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {niches.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setNiche(item.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all group ${
                                                niche === item.id 
                                                ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/10' 
                                                : 'border-slate-100 hover:border-purple-200'
                                            }`}
                                        >
                                            <span className="text-2xl mb-4 block">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{item.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={!niche}
                                    onClick={handleNext}
                                    className="w-full py-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-slate-950 transition-all disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-white"
                                >
                                    Continue to Goals &rarr;
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-600 block">Step 02</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        What's your <br /><span className="italic font-serif text-slate-400">Primary Objective?</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Tell us what you want to achieve first. We'll tune the Creative engine to match your goal.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {goals.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setGoal(item.id)}
                                            className={`w-full p-8 rounded-2xl border text-left transition-all ${
                                                goal === item.id 
                                                ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/10' 
                                                : 'border-slate-100 hover:border-purple-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-900 block mb-2">{item.label}</span>
                                                    <p className="text-sm text-slate-500 font-light">{item.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    goal === item.id ? 'border-purple-500 bg-purple-500' : 'border-slate-200'
                                                }`}>
                                                    {goal === item.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-6 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        disabled={!goal}
                                        onClick={handleNext}
                                        className="flex-[2] py-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-slate-950 transition-all disabled:opacity-30"
                                    >
                                        Next Step &rarr;
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-600 block">Step 03</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        Where did you <br /><span className="italic font-serif text-slate-400">Hear About Us?</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Just curious! It helps us know where our best users are coming from.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {sources.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSource(item.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all group ${
                                                source === item.id 
                                                ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/10' 
                                                : 'border-slate-100 hover:border-purple-200'
                                            }`}
                                        >
                                            <span className="text-2xl mb-4 block">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{item.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-6 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        disabled={!source}
                                        onClick={handleNext}
                                        className="flex-[2] py-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-slate-950 transition-all disabled:opacity-30"
                                    >
                                        Finalize Setup &rarr;
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-10"
                            >
                                <div className="w-24 h-24 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-purple-500/5">
                                    🏆
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        Your Dashboard is <br /><span className="italic font-serif text-slate-400">Ready to Go.</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed max-w-sm mx-auto">
                                        We've tuned your experience. Let's find your first viral video.
                                    </p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full py-6 bg-gradient-to-r from-indigo-950 to-purple-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-purple-950/20"
                                >
                                    Enter Dashboard &rarr;
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
