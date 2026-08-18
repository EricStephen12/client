'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Film,
  Zap
} from 'lucide-react';

interface IxoraRadarScannerProps {
  thumbnailUrl?: string | null;
  videoUrl?: string;
  mode?: 'ad' | 'product-intel';
}

interface SearchMilestone {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  activeLabel: string;
  completedLabel: string;
  angle: number; // Angle in degrees on the orbital circle
  delay: number; // delay in seconds before activation
}

const MILESTONES: SearchMilestone[] = [
  {
    id: 'places',
    icon: MapPin,
    label: 'Scanning Locations',
    activeLabel: 'Pinpointing Places & Context...',
    completedLabel: 'Locations & Context Mapped',
    angle: 45,
    delay: 0,
  },
  {
    id: 'products',
    icon: ShoppingBag,
    label: 'Detecting Products',
    activeLabel: 'Extracting Products, Gear & Price...',
    completedLabel: 'Products & Offers Identified',
    angle: 135,
    delay: 4,
  },
  {
    id: 'hook',
    icon: TrendingUp,
    label: 'Hook & Retention',
    activeLabel: 'Calculating Hook Power & Retention...',
    completedLabel: 'Retention & Pacing Scored',
    angle: 225,
    delay: 8,
  },
  {
    id: 'intelligence',
    icon: Sparkles,
    label: 'Synthesizing Insights',
    activeLabel: 'Structuring Data & Takeaways...',
    completedLabel: 'Intelligence Ready',
    angle: 315,
    delay: 13,
  },
];

export default function IxoraRadarScanner({
  thumbnailUrl,
  videoUrl,
  mode = 'ad',
}: IxoraRadarScannerProps) {
  const [progress, setProgress] = useState(12);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  useEffect(() => {
    // Smooth simulated progress that matches deep scanning
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;
        const increment = prev < 40 ? 2.5 : prev < 75 ? 1.8 : 0.8;
        return Math.min(94, Math.round(prev + increment));
      });
    }, 400);

    // Milestone timing
    const milestoneTimers = MILESTONES.map((m, idx) => {
      return setTimeout(() => {
        setActiveMilestoneIndex(idx);
        if (idx > 0) {
          setCompletedMilestones((prev) => [...prev, MILESTONES[idx - 1].id]);
        }
      }, m.delay * 1000);
    });

    return () => {
      clearInterval(progressInterval);
      milestoneTimers.forEach(clearTimeout);
    };
  }, []);

  const activeMilestone = MILESTONES[activeMilestoneIndex] || MILESTONES[0];

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[580px] p-6 select-none overflow-hidden">
      
      {/* ── Background Ambient Glows ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#bdf522]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* ── Main Radar Canvas (Fixed 420x420 Area) ── */}
      <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center">

        {/* Outer Orbit 3 (Dotted Ring) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#bdf522]/20"
        />

        {/* Middle Orbit 2 (Dotted Ring, Counter-Rotating) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[38px] sm:inset-[46px] rounded-full border border-dotted border-white/15"
        />

        {/* Inner Radar Pulse 1 */}
        <motion.div
          animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[80px] sm:inset-[96px] rounded-full border border-[#bdf522]/35 shadow-[0_0_25px_rgba(189,245,34,0.15)]"
        />

        {/* ── Radar Sweep Light Line ── */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute w-full h-full pointer-events-none"
        >
          <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-transparent via-[#bdf522]/10 to-[#bdf522]/25 rounded-tr-full blur-[1px]" />
        </motion.div>

        {/* ── Centerpiece: Glowing Circular Video Thumbnail ── */}
        <div className="relative z-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-b from-[#bdf522]/60 via-white/20 to-black/80 shadow-[0_0_40px_rgba(189,245,34,0.25)] flex items-center justify-center">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-950 border border-white/10 flex items-center justify-center group">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Video Source"
                className="w-full h-full object-cover scale-105 filter brightness-90 contrast-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 gap-1.5 p-3 text-center">
                <Film className="w-7 h-7 text-[#bdf522] animate-pulse" />
                <span className="text-[10px] font-medium tracking-wider uppercase text-stone-300">
                  Scanning Media
                </span>
              </div>
            )}

            {/* Central Scanning Overlay Grid */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            <motion.div
              animate={{ y: [-70, 70, -70] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#bdf522] to-transparent shadow-[0_0_8px_#bdf522]"
            />
          </div>

          {/* Central Live Badge */}
          <div className="absolute -bottom-2 bg-[#0e1210] border border-[#bdf522]/50 text-[#bdf522] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bdf522] animate-ping" />
            LIVE RADAR
          </div>
        </div>

        {/* ── Orbiting Search Milestone Bubbles ── */}
        {MILESTONES.map((m, idx) => {
          const isCompleted = completedMilestones.includes(m.id);
          const isActive = activeMilestoneIndex === idx;
          const Icon = m.icon;

          // Position calculations around the circle perimeter
          const radius = 175;
          const rad = (m.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <motion.div
              key={m.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isActive ? 1.08 : 1,
                opacity: 1,
                x: x,
                y: y,
              }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              className="absolute z-30"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -70,
                marginTop: -20,
              }}
            >
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-500 shadow-xl border ${
                  isActive
                    ? 'bg-[#151c16]/95 border-[#bdf522] shadow-[0_0_20px_rgba(189,245,34,0.3)] ring-2 ring-[#bdf522]/30'
                    : isCompleted
                    ? 'bg-[#0f1411]/85 border-emerald-500/40 text-emerald-300'
                    : 'bg-stone-900/70 border-white/10 text-stone-500 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-[#bdf522] text-black'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span
                    className={`text-[10px] font-bold tracking-tight whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-stone-300'
                        : 'text-stone-500'
                    }`}
                  >
                    {isCompleted ? m.completedLabel : m.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Status Bar & Progress Section Below Radar ── */}
      <div className="mt-8 w-full max-w-md flex flex-col items-center text-center space-y-4 z-20">
        
        {/* Dynamic Status Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 text-stone-200 font-medium text-sm sm:text-base"
          >
            <Zap className="w-4 h-4 text-[#bdf522] animate-bounce" />
            <span>{activeMilestone.activeLabel}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full bg-stone-900/90 border border-white/10 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#bdf522] to-lime-300 rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Progress Percentage & Info */}
        <div className="w-full flex justify-between items-center text-[11px] uppercase tracking-widest text-stone-500 px-1 font-mono">
          <span>{mode === 'product-intel' ? 'Product Intelligence' : 'Video Intelligence'}</span>
          <span className="text-[#bdf522] font-bold">{progress}% Complete</span>
        </div>
      </div>
    </div>
  );
}
