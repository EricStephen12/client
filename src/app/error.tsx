'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('💥 Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <RevealOnScroll>
        <div className="space-y-8 max-w-2xl bg-white p-12 md:p-20 rounded-[3rem] border border-slate-200 shadow-2xl">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-rose-500 text-2xl">⚠️</span>
          </div>
          
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-rose-500 block">System Interference</span>
          
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter text-slate-900">
            Something broke the <br />
            <span className="text-transparent bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text">creative signal.</span>
          </h2>
          
          <p className="text-slate-500 font-light text-lg leading-relaxed max-w-md mx-auto">
            We encountered an unexpected error while processing your request. Our technical team has been notified.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => reset()}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all shadow-xl active:scale-95"
            >
              Try to Restore
            </button>
            <Link 
              href="/"
              className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:border-purple-300 transition-all shadow-lg active:scale-95"
            >
              Emergency Exit
            </Link>
          </div>
          
          <p className="text-[10px] text-slate-300 font-mono mt-12 opacity-50">
            Internal ID: {error.digest || 'ERR_UNKNOWN'}
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
