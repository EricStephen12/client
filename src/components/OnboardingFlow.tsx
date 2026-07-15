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
    const [socials, setSocials] = useState<string[]>([]);

    const niches = [
        { id: 'creator', label: 'Content Creator', icon: '✨' },
        { id: 'ugc', label: 'UGC Creator', icon: '📱' },
        { id: 'agency', label: 'Marketing Agency', icon: '🎨' },
        { id: 'ecom', label: 'E-commerce Brand', icon: '🛍️' },
    ];

    const goals = [
        { id: 'hooks', label: 'Find Viral Hooks', desc: 'Stop the scroll in the first 2 seconds.' },
        { id: 'analyze', label: 'Analyze Competitors', desc: 'Reverse engineer successful videos.' },
        { id: 'scripts', label: 'Write Better Scripts', desc: 'Turn winning videos into fresh scripts.' },
    ];

    const platforms = [
        { id: 'tiktok', label: 'Connect TikTok', icon: '🎵', color: 'hover:border-[#00f2fe] hover:shadow-[#00f2fe]/20' },
        { id: 'instagram', label: 'Connect Instagram', icon: '📸', color: 'hover:border-[#f09433] hover:shadow-[#f09433]/20' },
        { id: 'youtube', label: 'Connect YouTube', icon: '▶️', color: 'hover:border-[#ff0000] hover:shadow-[#ff0000]/20' },
    ];

    const sources = [
        { id: 'youtube', label: 'YouTube', icon: '▶️' },
        { id: 'tiktok', label: 'TikTok / Instagram', icon: '📱' },
        { id: 'twitter', label: 'Twitter / X', icon: '🐦' },
        { id: 'friend', label: 'Word of Mouth', icon: '🤝' },
    ];

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
        else onComplete({ niche, goal, source });
    };

    const toggleSocial = (id: string) => {
        setSocials(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
        // Placeholder for real OAuth: alert('OAuth configuration required in Clerk dashboard');
    };

    // Staggered animation variants
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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-2xl overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_0_80px_rgba(190,242,100,0.15)] overflow-hidden relative my-auto mt-12 sm:mt-auto border border-slate-100"
            >
                {/* Cool Moving Color Gradient Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 5) * 100}%` }}
                        className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 animate-gradient-x bg-[length:200%_auto] transition-all duration-700 ease-out"
                    />
                </div>

                <div className="p-10 md:p-16">
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-600 block">Step 01</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
                                        Welcome, <span className="italic font-serif text-slate-400">{userName}.</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Let's personalize your studio. How do you create?
                                    </p>
                                </div>

                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {niches.map((item) => (
                                        <motion.button
                                            variants={itemVariants}
                                            key={item.id}
                                            onClick={() => setNiche(item.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${
                                                niche === item.id 
                                                ? 'border-lime-500 bg-lime-50/50 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.02]' 
                                                : 'border-slate-100 hover:border-lime-200 hover:shadow-md hover:scale-[1.01]'
                                            }`}
                                        >
                                            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                <button
                                    disabled={!niche}
                                    onClick={handleNext}
                                    className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-400 hover:text-slate-950 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-white"
                                >
                                    Continue &rarr;
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-600 block">Step 02</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        What's your <br /><span className="italic font-serif text-slate-400">Main Goal Today?</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        We'll tune the intelligence engine to match your exact workflow.
                                    </p>
                                </div>

                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                    {goals.map((item) => (
                                        <motion.button
                                            variants={itemVariants}
                                            key={item.id}
                                            onClick={() => setGoal(item.id)}
                                            className={`w-full p-6 sm:p-8 rounded-2xl border text-left transition-all duration-300 ${
                                                goal === item.id 
                                                ? 'border-lime-500 bg-lime-50/50 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.01]' 
                                                : 'border-slate-100 hover:border-lime-200 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-900 block mb-2">{item.label}</span>
                                                    <p className="text-sm text-slate-500 font-light">{item.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                                    goal === item.id ? 'border-lime-500 bg-lime-500 scale-110' : 'border-slate-200'
                                                }`}>
                                                    {goal === item.id && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Go Back</button>
                                    <button disabled={!goal} onClick={handleNext} className="flex-[2] py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-400 hover:text-slate-950 transition-all disabled:opacity-30">Next Step &rarr;</button>
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-600 block">Step 03</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        Connect Your <br /><span className="italic font-serif text-slate-400">Social Platforms</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Sync your accounts to pull your video data directly into the lab. You can skip this for now.
                                    </p>
                                </div>

                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                    {platforms.map((item) => (
                                        <motion.button
                                            variants={itemVariants}
                                            key={item.id}
                                            onClick={() => toggleSocial(item.id)}
                                            className={`w-full p-6 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${item.color} ${
                                                socials.includes(item.id) 
                                                ? 'border-slate-900 bg-slate-50 shadow-md scale-[1.01]' 
                                                : 'border-slate-100 hover:scale-[1.01]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <span className="text-sm font-bold uppercase tracking-widest text-slate-900">{item.label}</span>
                                            </div>
                                            <div className={`text-xs font-bold uppercase tracking-widest transition-all ${socials.includes(item.id) ? 'text-lime-600' : 'text-slate-300'}`}>
                                                {socials.includes(item.id) ? 'Connected ✓' : 'Link'}
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="flex-1 py-5 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Go Back</button>
                                    <button onClick={handleNext} className="flex-[2] py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-400 hover:text-slate-950 transition-all">Continue &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-600 block">Step 04</span>
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        Where did you <br /><span className="italic font-serif text-slate-400">Hear About Us?</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        Just curious! It helps us know where our best users are coming from.
                                    </p>
                                </div>

                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {sources.map((item) => (
                                        <motion.button
                                            variants={itemVariants}
                                            key={item.id}
                                            onClick={() => setSource(item.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${
                                                source === item.id 
                                                ? 'border-lime-500 bg-lime-50/50 ring-4 ring-lime-500/10 shadow-lg shadow-lime-500/5 scale-[1.02]' 
                                                : 'border-slate-100 hover:border-lime-200 hover:shadow-md hover:scale-[1.01]'
                                            }`}
                                        >
                                            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(3)} className="flex-1 py-5 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Go Back</button>
                                    <button disabled={!source} onClick={handleNext} className="flex-[2] py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-400 hover:text-slate-950 transition-all disabled:opacity-30">Finalize Setup &rarr;</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div 
                                key="step5"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="text-center space-y-10"
                            >
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                                    className="w-28 h-28 bg-lime-50 text-lime-500 rounded-full flex items-center justify-center mx-auto text-5xl shadow-[0_0_60px_rgba(190,242,100,0.4)] border-4 border-lime-100"
                                >
                                    🚀
                                </motion.div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                                        Your Lab is <br /><span className="italic font-serif text-slate-400">Ready to Go.</span>
                                    </h2>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed max-w-sm mx-auto">
                                        The intelligence engine is tuned. Let's find your first viral hook.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNext}
                                    className="w-full py-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-slate-900/20 relative overflow-hidden group"
                                >
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
