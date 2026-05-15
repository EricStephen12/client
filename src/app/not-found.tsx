'use client';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import CursorEffect from '@/components/CursorEffect';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-purple-100 selection:text-purple-900">
            <CursorEffect />
            
            <RevealOnScroll>
                <div className="text-center space-y-8">
                    <span className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-600 block">Error 404</span>
                    
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-slate-900">
                        Lost in the <br />
                        <span className="text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text">Creative Void.</span>
                    </h1>
                    
                    <p className="text-slate-500 font-light max-w-md mx-auto text-lg leading-relaxed">
                        The page you are looking for has either drifted into another dimension or never existed at all. Let's get you back to your flow.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link 
                            href="/"
                            className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all shadow-xl active:scale-95"
                        >
                            Back to Home
                        </Link>
                        <Link 
                            href="/dashboard/analyze"
                            className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:border-purple-300 transition-all shadow-lg active:scale-95"
                        >
                            Open Studio
                        </Link>
                    </div>
                </div>
            </RevealOnScroll>

            <footer className="fixed bottom-12 left-0 w-full text-center opacity-30">
                <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-slate-400">EIXORA. FIND YOUR FLOW.</p>
            </footer>
        </div>
    );
}
