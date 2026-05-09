'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
    onComplete: (data: { niche: string; goal: string }) => void;
    userName: string;
}

export default function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState('');
    const [goal, setGoal] = useState('');

    const niches = [
        { id: 'ecom', label: 'E-commerce & DTC', icon: '🛍️' },
        { id: 'saas', label: 'Software & SaaS', icon: '💻' },
        { id: 'agency', label: 'Creative Agency', icon: '🎨' },
        { id: 'creator', label: 'Personal Brand', icon: '✨' },
    ];

    const goals = [
        { id: 'hooks', label: 'Viral Hook Optimization', desc: 'Stop the scroll in the first 2 seconds.' },
        { id: 'scripts', label: 'High-Speed Scripting', desc: 'Turn winners into briefs in 60 seconds.' },
        { id: 'scaling', label: 'Team Workflow & Scaling', desc: 'Standardize creative across your team.' },
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete({ niche, goal });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-amber-500 transition-all duration-500"
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 block">Step 01</span>
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
                                                ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10' 
                                                : 'border-slate-100 hover:border-amber-200'
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
                                    className="w-full py-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-white"
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 block">Step 02</span>
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
                                                ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10' 
                                                : 'border-slate-100 hover:border-amber-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-900 block mb-2">{item.label}</span>
                                                    <p className="text-sm text-slate-500 font-light">{item.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    goal === item.id ? 'border-amber-500 bg-amber-500' : 'border-slate-200'
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
                                        className="flex-[2] py-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all disabled:opacity-30"
                                    >
                                        Finalize Setup &rarr;
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-10"
                            >
                                <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/5">
                                    🏆
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        The Lounge is <br /><span className="italic font-serif text-slate-400">Open for Business.</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed max-w-sm mx-auto">
                                        Your studio is tuned and ready. Let's find your first viral flow.
                                    </p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full py-6 bg-gradient-to-r from-indigo-950 to-purple-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-purple-950/20"
                                >
                                    Enter Creative Dashboard &rarr;
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
