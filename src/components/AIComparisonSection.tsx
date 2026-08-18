'use client';
import { motion } from 'framer-motion';
import { Flame, Target, Zap, ShieldCheck, XCircle, CheckCircle2, Shuffle } from 'lucide-react';

export default function AIComparisonSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a0c0b] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-[#bdf522] block mb-3">
            Why Operators Choose Eixora
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-sans">
            Generic AI vs. Eixora Intelligence
          </h2>
          <p className="text-stone-400 text-sm sm:text-base font-normal max-w-md mx-auto leading-relaxed font-sans">
            Stop getting walls of robotic text. Get actionable visual scores and niche-bent scripts.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ❌ Generic AI / ChatGPT */}
          <div className="rounded-3xl border border-red-500/20 bg-stone-950/60 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">Generic AI / ChatGPT</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-red-400/80 bg-red-400/10 px-2.5 py-1 rounded-full">
                  Wall of Text
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 font-sans">
                <p className="text-xs text-stone-500 uppercase tracking-widest font-mono">Output Quality</p>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed italic">
                  &ldquo;To make this video viral, you should ensure high production quality, engage the audience with good lighting, use trending music, and create an authentic call to action at the end…&rdquo;
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✕</span> Generic advice with zero visual frame analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✕</span> No hook scoring or 0-3s retention breakdown
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✕</span> Unusable for your specific camera setup & niche
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] text-stone-500 font-mono">
              Result: 15 minutes wasted reading fluffy essays.
            </div>
          </div>

          {/* ✅ Eixora Pattern Intelligence */}
          <div className="rounded-3xl border border-[#bdf522]/30 bg-[#0e1210] p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#bdf522]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#bdf522]" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">Eixora Intelligence</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#bdf522] bg-[#bdf522]/15 border border-[#bdf522]/30 px-2.5 py-1 rounded-full">
                  Visual Blueprint
                </span>
              </div>

              {/* Macro Score Pill Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-stone-400">Virality</p>
                  <p className="text-lg font-bold text-[#bdf522]">92%</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-stone-400">Hook</p>
                  <p className="text-lg font-bold text-white">8.8<span className="text-[10px] text-stone-500">/10</span></p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-stone-400">Retention</p>
                  <p className="text-lg font-bold text-emerald-400">8.4<span className="text-[10px] text-stone-500">/10</span></p>
                </div>
              </div>

              {/* Ready Hook Script Card */}
              <div className="p-4 rounded-2xl bg-[#bdf522]/5 border border-[#bdf522]/20 space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#bdf522]">
                  <Shuffle className="w-3.5 h-3.5" />
                  Niche-Bent 0-3s Hook Script
                </div>
                <p className="text-xs sm:text-sm text-stone-200 font-medium italic">
                  &ldquo;Stop scrolling — if you’ve spent over $30 trying to fix this, here is why your usual routine failed…&rdquo;
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-300 font-sans">
                <li className="flex items-center gap-2">
                  <span className="text-[#bdf522] font-bold">✓</span> Frame-by-frame visual & audio breakdown
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#bdf522] font-bold">✓</span> Tailored specifically to your production format & niche
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#bdf522] font-bold">✓</span> Ready to record in under 60 seconds
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-[#bdf522] font-mono flex items-center justify-between">
              <span>Result: Shoot-ready brief in 15 seconds.</span>
              <span className="font-bold">100% Actionable →</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
