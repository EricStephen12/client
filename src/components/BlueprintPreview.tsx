'use client';
import { motion } from 'framer-motion';
import { Shuffle, Sparkles, Target, Video } from 'lucide-react';
import Link from 'next/link';

export default function BlueprintPreview() {
    return (
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-black border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 sm:mb-16 md:mb-20 max-w-2xl">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-lime-400 mb-4 block">Niche Bending Engine</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-50 mb-4 sm:mb-6 font-sans">
                        Steal the formula. <br />
                        <span className="italic font-serif text-lime-300">Bend the angle.</span>
                    </h2>
                    <p className="text-base sm:text-lg text-stone-400 font-normal leading-relaxed font-sans">
                        Decode the exact psychological mechanics behind any viral video — then adapt the winning hook for your setup without copying.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl opacity-40 -z-10" />
                    
                    <div className="bg-[#121816] border border-white/10 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                        <div className="flex flex-col lg:grid lg:grid-cols-12">

                            <div className="lg:col-span-4 p-6 sm:p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center">
                                <div className="space-y-8 sm:space-y-12">
                                    <div className="group">
                                        <h3 className="text-lg sm:text-xl font-bold text-stone-50 mb-2 font-sans group-hover:text-lime-300 transition-colors">
                                            The Psychology, Not The Surface
                                        </h3>
                                        <p className="text-sm text-stone-400 leading-relaxed font-sans">
                                            Competitors copy saturated products and burn cash. Eixora extracts the emotional trigger that kept millions watching.
                                        </p>
                                    </div>
                                    <div className="group">
                                        <h3 className="text-lg sm:text-xl font-bold text-stone-50 mb-2 font-sans group-hover:text-lime-300 transition-colors">
                                            Tailored to Your Brand DNA
                                        </h3>
                                        <p className="text-sm text-stone-400 leading-relaxed font-sans">
                                            Formatted specifically for your camera constraints, aesthetic positioning, and product price point.
                                        </p>
                                    </div>
                                    <div className="pt-4 sm:pt-6">
                                        <Link 
                                            href="/signup?redirect=/dashboard/analyze"
                                            className="w-full inline-flex items-center justify-center py-4 sm:py-5 bg-lime-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-lime-300 transition-all font-sans"
                                        >
                                            Try Niche Bending Free
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 bg-black/20 p-4 sm:p-6 md:p-12">
                                <div className="bg-[#0a0c0b] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden min-h-[400px] sm:min-h-[480px] flex flex-col font-sans">
                                    <div className="h-10 sm:h-12 bg-white/[0.03] border-b border-white/10 flex items-center px-4 sm:px-6 gap-2">
                                        <div className="w-2 h-2 rounded-full bg-lime-400/40" />
                                        <div className="w-2 h-2 rounded-full bg-lime-400/40" />
                                        <div className="w-2 h-2 rounded-full bg-lime-400/40" />
                                        <span className="ml-auto text-[8px] font-mono text-stone-500 uppercase tracking-widest">Eixora Brand Intelligence</span>
                                    </div>
                                    
                                    <div className="p-4 sm:p-6 md:p-10 flex-grow space-y-6 sm:space-y-8">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">Niche-Bent Blueprint</span>
                                                    <span className="text-[9px] font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-stone-400">Clean DTC Skincare</span>
                                                </div>
                                                <p className="text-xl sm:text-2xl font-bold text-stone-50">Adapted Creative Brief</p>
                                            </div>
                                            <div className="bg-lime-400/10 text-lime-300 px-3 sm:px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest self-start whitespace-nowrap border border-lime-400/20 font-mono">
                                                Hook Power: 9.4/10
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/10 space-y-3">
                                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">Core Viral Mechanic</p>
                                                <p className="text-xs sm:text-sm font-medium text-stone-300 leading-relaxed italic">
                                                    &ldquo;Extreme friction test followed by instant visual payoff. The tension forces viewer commitment before 3 seconds.&rdquo;
                                                </p>
                                            </div>

                                            <div className="p-5 bg-lime-400/[0.06] border border-lime-400/20 rounded-2xl space-y-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                                                    <Shuffle className="w-3.5 h-3.5" />
                                                    Bent 0–3s Hook Script
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                                                    &ldquo;Stop rubbing your skin raw. Watch this single droplet melt 24-hour waterproof makeup in 2 seconds flat.&rdquo;
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-2">Director&apos;s Filming Cue (iPhone UGC)</p>
                                            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                                                &ldquo;Film on your front-facing camera with natural morning window light. Keep the bottle in-frame at 0.5s; show the clean wipe at 2.1s without cut transitions.&rdquo;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
