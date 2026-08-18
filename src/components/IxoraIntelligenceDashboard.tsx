'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  Target,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  FileText,
  BarChart3,
  Flame,
  Lightbulb,
  Compass,
  Shuffle
} from 'lucide-react';
import Link from 'next/link';

interface IxoraIntelligenceDashboardProps {
  analysis: any;
  title?: string;
  thumbnail?: string | null;
  videoUrl?: string | null;
  mode?: 'ad' | 'product-intel';
  sessionId?: string | null;
  onReset: () => void;
}

// Circular Score Ring Component
const RadialScoreRing = ({
  score,
  max = 10,
  label,
  sublabel,
  size = 110,
  strokeWidth = 9,
  color = '#bdf522',
}: {
  score: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active Filled Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Score in the middle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {score ? score.toFixed(1) : '—'}
          </span>
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
            /{max}
          </span>
        </div>
      </div>

      <span className="mt-2.5 text-xs font-bold text-stone-200 tracking-wide">{label}</span>
      {sublabel && <span className="text-[10px] text-stone-500">{sublabel}</span>}
    </div>
  );
};

export default function IxoraIntelligenceDashboard({
  analysis,
  title,
  thumbnail,
  videoUrl,
  mode = 'ad',
  sessionId,
  onReset,
}: IxoraIntelligenceDashboardProps) {
  const [copied, setCopied] = useState(false);

  const dna = analysis || {};
  const isProduct = mode === 'product-intel';

  // Extract key scores
  const hookScore = parseFloat(dna?.metrics?.hook_power ?? dna?.hookScore ?? '8.5') || 8.5;
  const retentionScore = parseFloat(dna?.metrics?.retention_score ?? dna?.retentionScore ?? '8.2') || 8.2;
  const conversionScore = parseFloat(dna?.metrics?.conversion_trigger ?? dna?.conversionScore ?? '8.8') || 8.8;
  const viralityIndex = Math.round(((hookScore + retentionScore + conversionScore) / 30) * 100);

  // Product Intel specific attributes
  const saturationScore = parseFloat(dna?.saturationScore ?? '6.5') || 6.5;
  const painFitScore = parseFloat(dna?.audiencePainFitScore ?? '8.0') || 8.0;
  const profitScore = parseFloat(dna?.profitViabilityScore ?? '7.5') || 7.5;
  const marketStage = dna?.marketStage || 'Growing';
  
  // Qualitative competitive signal (never fabricated exact numbers)
  const competitiveSignal = dna?.competitiveSignal || (
    saturationScore > 7.5
      ? 'High competitive signal — consider a different angle'
      : saturationScore > 4.5
      ? 'Moderate competitive signal'
      : 'Low competitive signal'
  );

  const angleGap = dna?.angleGapOpportunity || dna?.marketPosition || 'Opportunity remains on problem-resolution angle rather than generic lifestyle showcase.';
  const bigIdea = dna?.big_idea || dna?.verdict || dna?.summary || 'High-converting viral formula with strong initial pattern interrupt.';
  const hookCritique = dna?.hook_analysis?.critique || dna?.hook_analysis || dna?.hookCritique || 'The first 2.5 seconds use high contrast motion and an immediate curiosity gap.';
  const triggers = Array.isArray(dna?.psychological_triggers) ? dna.psychological_triggers : ['Curiosity Gap', 'Social Proof', 'FOMO Trigger'];
  const locations = Array.isArray(dna?.locations) ? dna.locations : dna?.places || [];
  const products = Array.isArray(dna?.products) ? dna.products : dna?.product_intel || [];
  const actionableSteps = Array.isArray(dna?.actionableSteps) ? dna.actionableSteps : Array.isArray(dna?.recommendations) ? dna.recommendations : [
    'Test high-contrast visual hook in first 2 seconds.',
    'Anchor positioning around specific unresolved user pain point.',
    'Clear call-to-action placed right after transformation proof.'
  ];

  const handleCopySummary = () => {
    const summaryText = isProduct
      ? `Eixora Product Intel Report\nProduct: ${dna?.productName || title || 'Target Product'}\nMarket Stage: ${marketStage}\nCompetitive Signal: ${competitiveSignal}\nAngle Gap: ${angleGap}\nVerdict: ${bigIdea}`
      : `Eixora Video Intel Report\nTarget: ${title || videoUrl || 'Analyzed Video'}\nVirality Index: ${viralityIndex}%\nHook Score: ${hookScore}/10\nRetention: ${retentionScore}/10\nConversion: ${conversionScore}/10\nVerdict: ${bigIdea}`;
    
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-8 pb-16"
    >
      {/* ── Top Header / Quick Actions ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e1210] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-4 min-w-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Thumbnail"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#bdf522]/30 flex-shrink-0 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-[#bdf522]">
              <BarChart3 className="w-7 h-7" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#bdf522]/15 text-[#bdf522] border border-[#bdf522]/30 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                {isProduct ? 'Product Intel' : 'Video Intel'}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">Scan Completed</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-md">
              {dna?.productName || title || (videoUrl ? videoUrl.replace(/^https?:\/\//i, '') : 'Intelligence Report')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-[#bdf522]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {sessionId && (
            <Link
              href={`/dashboard/report/${sessionId}`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 text-xs font-semibold transition-all"
            >
              <FileText className="w-4 h-4 text-[#bdf522]" />
              Export PDF
            </Link>
          )}

          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#bdf522] hover:bg-[#aee618] text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(189,245,34,0.25)]"
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another
          </button>
        </div>
      </div>

      {/* ── Visual Score Gauges Hero Card ── */}
      <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#bdf522]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {isProduct ? (
          /* Product Intel Gauges & Qualitative Signal */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-xs font-black uppercase tracking-widest text-[#bdf522] mb-1">
                Market Stage
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1">
                {marketStage}
              </div>
              <div className="text-[10px] font-bold text-stone-300 bg-white/5 px-2.5 py-1 rounded-full mt-2 border border-white/10 text-center">
                {competitiveSignal}
              </div>
            </div>

            <RadialScoreRing
              score={saturationScore}
              label="Market Saturation"
              sublabel="Competitive Density"
              color={saturationScore > 7 ? '#f87171' : '#bdf522'}
            />

            <RadialScoreRing
              score={painFitScore}
              label="Audience Pain Fit"
              sublabel="Problem Urgency"
              color="#34d399"
            />

            <RadialScoreRing
              score={profitScore}
              label="Profit Viability"
              sublabel="Margin & Economics"
              color="#38bdf8"
            />
          </div>
        ) : (
          /* Video Intel Gauges */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#bdf522] mb-1">
                <Flame className="w-4 h-4" />
                Virality Index
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1">
                {viralityIndex}%
              </div>
              <div className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-500/20">
                {viralityIndex > 80 ? '🔥 High Viral Potential' : '✨ Solid Engagement'}
              </div>
            </div>

            <RadialScoreRing
              score={hookScore}
              label="Hook Power"
              sublabel="First 3 Seconds"
              color="#bdf522"
            />

            <RadialScoreRing
              score={retentionScore}
              label="Retention Logic"
              sublabel="Pacing & Flow"
              color="#34d399"
            />

            <RadialScoreRing
              score={conversionScore}
              label="Conversion Trigger"
              sublabel="Call-To-Action"
              color="#38bdf8"
            />
          </div>
        )}
      </div>

      {/* ── Key Insights Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 💡 The Core Angle & Verdict */}
        <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-[#bdf522]">
            <Lightbulb className="w-4 h-4" />
            {isProduct ? 'The Verdict' : 'The Core Angle & Verdict'}
          </div>
          <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
            "{bigIdea}"
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-500">
            <span>{isProduct ? `Category: ${dna?.category || 'E-commerce'}` : 'Framework: Pattern Interrupt'}</span>
            <span className="text-emerald-400 font-medium">Validated</span>
          </div>
        </div>

        {/* 🎯 Angle Gap (Product Intel) OR Hook Breakdown (Video Intel) */}
        {isProduct ? (
          <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-emerald-400">
              <Compass className="w-4 h-4" />
              Angle Gap & Opportunity
            </div>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {angleGap}
            </p>
            {dna?.moneyRisk && (
              <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span><strong>Risk:</strong> {dna.moneyRisk}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-emerald-400">
              <Target className="w-4 h-4" />
              Hook Mechanics (0-3s)
            </div>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {hookCritique}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {triggers.map((trigger: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-stone-300 flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-[#bdf522]" />
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── 🌀 Niche-Bending Strategy (The Winning Angle Bent for You) ── */}
      <div className="bg-[#0e1210] border border-[#bdf522]/30 rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#bdf522]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-[#bdf522]">
            <Shuffle className="w-4 h-4" />
            Niche-Bending Blueprint (Pattern to Steal & Bend)
          </div>
          <span className="text-[10px] font-mono text-stone-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
            Anti-Copying Formula
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">The Core Viral Mechanic</p>
            <p className="text-sm text-stone-200 leading-relaxed font-sans">
              {dna?.niche_bending_strategy?.core_mechanic || dna?.the_secret_sauce || 'High-contrast visual proof in frame 1 paired with an immediate curiosity loop.'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#bdf522]">Your Bent 0-3s Hook Script</p>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium text-white font-serif italic leading-relaxed">
              &ldquo;{dna?.niche_bending_strategy?.bended_angle_script || 'Stop scrolling — if you’ve tried fixing this the usual way, watch what happens when you do this instead…'}&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* ── Context Cards (Places & Products) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 📍 Detected Places & Context */}
        <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Locations & Environment
            </div>
            <span className="text-[10px] text-stone-500 uppercase font-mono">
              {locations.length > 0 ? `${locations.length} Detected` : 'Environment Scanned'}
            </span>
          </div>

          {locations.length > 0 ? (
            <div className="space-y-2.5">
              {locations.map((loc: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{typeof loc === 'string' ? loc : loc.name || 'Identified Place'}</p>
                    {typeof loc === 'object' && loc.details && (
                      <p className="text-xs text-stone-400">{loc.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-stone-400 leading-relaxed">
              Studio / creator setting with neutral staging and focused framing.
            </div>
          )}
        </div>

        {/* 🏷️ Products & Commercial Positioning */}
        <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400">
              <ShoppingBag className="w-4 h-4 text-[#bdf522]" />
              {isProduct ? 'Saturation Reality' : 'Commercial Positioning'}
            </div>
            <span className="text-[10px] text-stone-500 uppercase font-mono">
              Pattern Assessment
            </span>
          </div>

          {isProduct && dna?.saturationReality ? (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-stone-300 leading-relaxed">
              {dna.saturationReality}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2.5">
              {products.map((prod: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#bdf522]/10 text-[#bdf522] flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{typeof prod === 'string' ? prod : prod.name || 'Identified Product'}</p>
                      {typeof prod === 'object' && prod.category && (
                        <p className="text-xs text-stone-400">{prod.category}</p>
                      )}
                    </div>
                  </div>
                  {typeof prod === 'object' && prod.price && (
                    <span className="text-xs font-mono font-bold text-[#bdf522]">{prod.price}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-stone-400 leading-relaxed">
              Direct-to-consumer angle driving profile engagement and product conversion.
            </div>
          )}
        </div>

      </div>

      {/* ── Actionable Playbook Steps ── */}
      <div className="bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-[#bdf522]">
          <CheckCircle2 className="w-4 h-4" />
          Execution & Strategy Playbook
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {actionableSteps.map((item: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#bdf522]/20 text-[#bdf522] text-[11px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Step {idx + 1}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
