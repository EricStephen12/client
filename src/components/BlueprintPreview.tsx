'use client';
import { motion } from 'framer-motion';

export default function BlueprintPreview() {
    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-6">
                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700">A New Way to Create</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 mb-6">
                        The clarity to <br className="hidden md:block" />
                        <span className="text-transparent bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text underline decoration-purple-100 decoration-8 underline-offset-8">create with confidence.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                        No more staring at a blank page. We partner with you to uncover the human patterns behind every viral hit, giving you a clear path to your next winning ad.
                    </p>
                </div>

                {/* Principle: Large Product Card */}
                <div className="relative">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10" />
                    
                    <div className="bg-white border border-purple-50 rounded-[2.5rem] shadow-[0_20px_60px_rgba(147,51,234,0.05)] overflow-hidden">
                        <div className="grid lg:grid-cols-12">
                            {/* Product Info (Left) */}
                            <div className="lg:col-span-4 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-purple-50 flex flex-col justify-center">
                                <div className="space-y-12">
                                    <div className="group">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">A Clear Directive</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Move from "I think this works" to "I know this works." We provide the technical calm in the middle of a chaotic creative cycle.
                                        </p>
                                    </div>
                                    <div className="group">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-purple-500 transition-colors">Shared Success</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Our scans don't just dump data—they offer a hand-held guide to replicating high-performance psychology for your unique brand.
                                        </p>
                                    </div>
                                    <div className="pt-8">
                                        <button className="w-full py-5 bg-indigo-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl hover:shadow-purple-100">
                                            Experience the Clarity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* High-Fidelity UI Mockup (Right) */}
                            <div className="lg:col-span-8 bg-slate-50/50 p-6 md:p-12">
                                <div className="bg-white border border-purple-100/50 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                                    <div className="h-12 bg-slate-50 border-b border-purple-50 flex items-center px-6 gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-200" />
                                        <div className="w-2 h-2 rounded-full bg-purple-200" />
                                        <div className="w-2 h-2 rounded-full bg-purple-200" />
                                        <span className="ml-auto text-[8px] font-mono text-slate-400 uppercase tracking-widest">Creative Partnership: #9023</span>
                                    </div>
                                    
                                    <div className="p-10 flex-grow">
                                        <div className="flex justify-between items-start mb-12">
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-2">The Blueprint of Connection</h4>
                                                <p className="text-3xl font-sans font-bold text-slate-900 leading-tight">Human-Centric <br /> Pattern Interrupt</p>
                                            </div>
                                            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                Empathy Score: 92%
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="space-y-8">
                                                <div className="p-6 bg-white rounded-2xl border border-purple-100 shadow-sm">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Director's Note (Frame 01)</p>
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex-shrink-0 flex items-center justify-center text-purple-600">
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                                            "Don't just show the product. Show the relief it brings. The first second is about making them feel seen."
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-indigo-950 rounded-2xl text-white shadow-lg">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-4">The Hook Guide</p>
                                                    <p className="text-base font-medium leading-snug">
                                                        "Finally, a {`{product}`} that actually gets you."
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-end">
                                                <div className="bg-white border border-purple-100 p-8 rounded-3xl text-slate-900 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-6 opacity-5 font-sans font-bold text-6xl text-purple-600">HEART</div>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-4">A Note on Connection</h4>
                                                    <p className="text-lg font-sans font-medium leading-relaxed italic mb-8">
                                                        "Authenticity is your best strategy. When you film this, imagine you're talking to a friend who really needs this solution."
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Director's Encouragement</span>
                                                    </div>
                                                </div>
                                            </div>
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
