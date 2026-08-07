'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
    onComplete: (data: { niche: string; goal: string; name: string; source: string; lens: string }) => void;
    userName: string;
}

export default function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState('');
    const [goal, setGoal] = useState('');
    const [fullName, setFullName] = useState(userName === 'User' ? '' : userName);
    const [source, setSource] = useState('');
    const [lens, setLens] = useState('');

    const niches = [
        { id: 'creator', label: 'Content Creator', icon: '🎥' },
        { id: 'marketer', label: 'Marketer', icon: '📈' },
        { id: 'agency', label: 'Agency', icon: '🏢' },
        { id: 'brand', label: 'Brand Owner', icon: '💎' },
    ];

    const goals = [
        { id: 'competitors', label: 'Analyze Competitors', desc: 'Reverse engineer successful videos.', icon: '🔍' },
        { id: 'engagement', label: 'Improve Engagement', desc: 'Get more likes, comments, and shares.', icon: '❤️' },
        { id: 'trends', label: 'Discover Trends', desc: 'Stay ahead of the curve.', icon: '🔥' },
        { id: 'roi', label: 'Maximize ROI', desc: 'Drive more conversions and sales.', icon: '💰' },
    ];

    const sources = [
        { id: 'youtube', label: 'YouTube', icon: '▶️' },
        { id: 'tiktok', label: 'TikTok / Instagram', icon: '📱' },
        { id: 'twitter', label: 'Twitter / X', icon: '🐦' },
        { id: 'friend', label: 'Word of Mouth', icon: '🤝' },
    ];

    const lenses = [
        { id: 'product-intel', label: 'Product Intelligence', desc: 'Analyze product viability, margins & ecommerce DNA.', icon: '🛍️' },
        { id: 'ad', label: 'Ad Intelligence', desc: 'Deconstruct high-performing paid ads & hooks.', icon: '📊' },
        { id: 'content', label: 'Content Intelligence', desc: 'Analyze organic viral hooks & creator strategy.', icon: '🎨' },
    ];

    const handleNext = () => {
        if (step < 6) setStep(step + 1);
        else onComplete({ niche, goal, name: fullName, source, lens });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-2xl overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-[#121816] w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden relative my-auto mt-12 sm:mt-auto border border-white/10"
            >
                {/* Cool Moving Color Gradient Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-white/10 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 6) * 100}%` }}
                        className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 animate-gradient-x bg-[length:200%_auto] transition-all duration-700 ease-out"
                    />
                </div>

                <div className="p-10 md:p-16">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 block">Step 01</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">
                                        What describes <br /><span className="italic font-serif text-stone-500">you best?</span>
                                    </h2>
                                    <p className="text-lg text-stone-500 font-light leading-relaxed">This helps us tailor your intelligence feed.</p>
                                </div>
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {niches.map((item) => (
                                        <motion.button key={item.id} variants={itemVariants} onClick={() => setNiche(item.id)} className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${niche === item.id ? 'border-lime-500 bg-lime-400/10 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.02]' : 'border-white/10 hover:border-lime-400/30 hover:shadow-md hover:scale-[1.01]'}`}>
                                            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-stone-50">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                                <button disabled={!niche} onClick={handleNext} className="w-full py-5 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-300 hover:text-slate-950 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-lime-400">Continue &rarr;</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 block">Step 02</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">
                                        What is your <br /><span className="italic font-serif text-stone-500">primary goal?</span>
                                    </h2>
                                    <p className="text-lg text-stone-500 font-light leading-relaxed">We'll focus your insights on what matters.</p>
                                </div>
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                    {goals.map((item) => (
                                        <motion.button key={item.id} variants={itemVariants} onClick={() => setGoal(item.id)} className={`w-full p-6 sm:p-8 rounded-2xl border text-left transition-all duration-300 ${goal === item.id ? 'border-lime-500 bg-lime-400/10 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.01]' : 'border-white/10 hover:border-lime-400/30 hover:shadow-md'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-stone-50 block mb-2">{item.label}</span>
                                                    <p className="text-sm text-stone-500 font-light">{item.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${goal === item.id ? 'border-lime-500 bg-lime-400 scale-110' : 'border-white/10'}`}>
                                                    {goal === item.id && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2 h-2 bg-slate-950 rounded-full" />}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 border border-white/10 text-stone-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Go Back</button>
                                    <button disabled={!goal} onClick={handleNext} className="flex-[2] py-5 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-300 hover:text-slate-950 transition-all disabled:opacity-30">Next Step &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 block">Step 03</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">
                                        What is your <br /><span className="italic font-serif text-stone-500">full name?</span>
                                    </h2>
                                    <p className="text-lg text-stone-500 font-light leading-relaxed">So we know what to call you.</p>
                                </div>
                                <motion.div variants={containerVariants} initial="hidden" animate="show">
                                    <input type="text" placeholder="First Last" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-medium text-stone-50 placeholder:text-stone-600 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10 transition-all" autoFocus />
                                </motion.div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="flex-1 py-5 border border-white/10 text-stone-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Go Back</button>
                                    <button disabled={!fullName.trim()} onClick={handleNext} className="flex-[2] py-5 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-300 hover:text-slate-950 transition-all disabled:opacity-30">Next Step &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 block">Step 04</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">
                                        Where did you <br /><span className="italic font-serif text-stone-500">Hear About Us?</span>
                                    </h2>
                                    <p className="text-lg text-stone-500 font-light leading-relaxed">Just curious! It helps us know where our best users are coming from.</p>
                                </div>
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {sources.map((item) => (
                                        <motion.button key={item.id} variants={itemVariants} onClick={() => setSource(item.id)} className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${source === item.id ? 'border-lime-500 bg-lime-400/10 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.02]' : 'border-white/10 hover:border-lime-400/30 hover:shadow-md hover:scale-[1.01]'}`}>
                                            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-stone-50">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(3)} className="flex-1 py-5 border border-white/10 text-stone-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Go Back</button>
                                    <button disabled={!source} onClick={handleNext} className="flex-[2] py-5 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-300 hover:text-slate-950 transition-all disabled:opacity-30">Next Step &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 block">Step 05</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">
                                        Choose your <br /><span className="italic font-serif text-stone-500">Intelligence Lens</span>
                                    </h2>
                                    <p className="text-sm text-stone-500 font-light leading-relaxed">Select your default workspace lens. You can switch modes anytime inside the app.</p>
                                </div>
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                                    {lenses.map((item) => (
                                        <motion.button 
                                            key={item.id} 
                                            variants={itemVariants} 
                                            onClick={() => setLens(item.id)} 
                                            className={`w-full p-5 sm:p-6 rounded-2xl border text-left transition-all duration-300 ${
                                                lens === item.id 
                                                ? 'border-lime-500 bg-lime-400/10 ring-4 ring-lime-500/10 shadow-md shadow-lime-500/5' 
                                                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform ${lens === item.id ? 'scale-110 bg-white/[0.03] shadow-sm' : 'bg-white/[0.04]'}`}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-bold uppercase tracking-wider text-stone-50 block mb-1">{item.label}</span>
                                                    <p className="text-xs text-stone-500 font-light leading-snug">{item.desc}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${lens === item.id ? 'border-lime-500 bg-lime-400' : 'border-white/10'}`}>
                                                    {lens === item.id && <div className="w-1.5 h-1.5 bg-white/[0.03] rounded-full" />}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(4)} className="flex-1 py-4 border border-white/10 text-stone-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Go Back</button>
                                    <button disabled={!lens} onClick={handleNext} className="flex-[2] py-4 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-300 hover:text-slate-950 transition-all disabled:opacity-30">Finalize Setup &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }} className="text-center space-y-10">
                                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15, delay: 0.2 }} className="w-28 h-28 bg-lime-400/10 text-lime-500 rounded-full flex items-center justify-center mx-auto text-5xl shadow-[0_0_60px_rgba(190,242,100,0.4)] border-4 border-white/10">🚀</motion.div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-stone-50 leading-tight">Your Lab is <br /><span className="italic font-serif text-stone-500">Ready to Go.</span></h2>
                                    <p className="text-lg text-stone-500 font-light leading-relaxed max-w-sm mx-auto">The intelligence engine is tuned. Let's find your first viral hook.</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext} className="w-full py-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x bg-[length:200%_auto]" />
                                    <span className="relative z-10 text-white group-hover:text-slate-950 transition-colors duration-300">Enter Dashboard &rarr;</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
