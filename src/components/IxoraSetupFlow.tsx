'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Rocket,
  Video,
  Building2,
  Gem,
  FlaskConical,
  Crown,
  Zap,
  Smartphone,
  Mic,
  Clapperboard,
  Layers,
  Shuffle,
  Target,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Check,
} from 'lucide-react';

interface IxoraSetupFlowProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  getToken?: () => Promise<string | null>;
  onComplete: () => void;
}

export default function IxoraSetupFlow({
  userId,
  userEmail,
  userName,
  getToken,
  onComplete,
}: IxoraSetupFlowProps) {
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState('');
  const [positioning, setPositioning] = useState('');
  const [niche, setNiche] = useState('');
  const [production, setProduction] = useState('');
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Brand Stage
  const stages = [
    {
      id: 'launching',
      label: 'Launching a New Brand',
      desc: 'Validating winning product angles before inventory & ad spend',
      icon: Sparkles,
    },
    {
      id: 'scaling_dtc',
      label: 'Scaling a DTC Brand',
      desc: 'Expanding creative variety & beating ad fatigue',
      icon: Rocket,
    },
    {
      id: 'founder_led',
      label: 'Founder-Led / Personal Brand',
      desc: 'High-authority founder camera formats and direct connection',
      icon: Video,
    },
    {
      id: 'agency',
      label: 'Brand Studio / Agency',
      desc: 'High-volume angle testing across multiple client verticals',
      icon: Building2,
    },
  ];

  // Step 2: Positioning & Aesthetic
  const positionings = [
    {
      id: 'minimalist_dtc',
      label: 'Clean Modern DTC',
      desc: 'High-trust, aesthetic product shots and lifestyle proof',
      icon: Gem,
    },
    {
      id: 'clinical_trust',
      label: 'Clinical & Science-Backed',
      desc: 'Problem-aware breakdown, ingredient focus, and proof tests',
      icon: FlaskConical,
    },
    {
      id: 'luxury_aspirational',
      label: 'Elevated & Luxury',
      desc: 'Subtle elegance, premium design, and sensory storytelling',
      icon: Crown,
    },
    {
      id: 'bold_challenger',
      label: 'Bold & Disruptive',
      desc: 'Shocking contrasts, aggressive pattern interrupts, high energy',
      icon: Zap,
    },
  ];

  // Step 3: Vertical / Niche
  const niches = [
    { id: 'beauty', label: 'Beauty & Skincare' },
    { id: 'tech', label: 'Tech & Consumer Electronics' },
    { id: 'fashion', label: 'Fashion & Apparel' },
    { id: 'fitness', label: 'Health, Wellness & Fitness' },
    { id: 'home', label: 'Home, Kitchen & Living' },
    { id: 'multi', label: 'Multi-Category / Testing' },
  ];

  // Step 4: Production Setup
  const productions = [
    {
      id: 'ugc_iphone',
      label: 'Native iPhone / UGC',
      desc: 'Raw front-camera hooks, natural light, zero agency gloss',
      icon: Smartphone,
    },
    {
      id: 'founder_camera',
      label: 'Founder Talking Head',
      desc: 'Direct-to-lens founder authority, mic-in-hand, story hooks',
      icon: Mic,
    },
    {
      id: 'studio_cinema',
      label: 'Cinema & Studio B-Roll',
      desc: 'Macro lens textures, studio lighting, high production value',
      icon: Clapperboard,
    },
    {
      id: 'faceless_motion',
      label: 'Faceless & Motion Graphics',
      desc: 'Fast cut b-roll, text kinetic overlays, dynamic sound design',
      icon: Layers,
    },
  ];

  // Step 5: Primary Focus
  const goals = [
    {
      id: 'niche_bending',
      label: 'Niche Bending & Angle Gaps',
      desc: 'Steal winning psychological mechanics from other verticals',
      icon: Shuffle,
    },
    {
      id: 'thumbstop_hook',
      label: '0–3s Thumb-Stop Power',
      desc: 'Maximize visual pattern interrupts to halt the scroll',
      icon: Target,
    },
    {
      id: 'retention_pacing',
      label: 'Retention & Watch Pacing',
      desc: 'Eliminate dead zones to keep viewers through the CTA',
      icon: TrendingUp,
    },
    {
      id: 'brand_conversion',
      label: 'Brand Trust & Conversion',
      desc: 'Turn casual viewers into high-AOV repeat customers',
      icon: ShoppingBag,
    },
  ];

  const handleSelectStage = (id: string) => {
    setStage(id);
    setStep(2);
  };

  const handleSelectPositioning = (id: string) => {
    setPositioning(id);
    setStep(3);
  };

  const handleSelectNiche = (id: string) => {
    setNiche(id);
    setStep(4);
  };

  const handleSelectProduction = (id: string) => {
    setProduction(id);
    setStep(5);
  };

  const handleSelectGoal = async (id: string) => {
    setGoal(id);
    setIsSubmitting(true);

    try {
      if (userId) {
        const token = getToken ? await getToken() : null;
        await fetch('/api/main/api/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            userId,
            email: userEmail || '',
            name: userName || '',
            onboarding_completed: true,
            brand_stage: stage,
            brand_positioning: positioning,
            brand_niche: niche || 'general',
            brand_style: production,
            primary_goal: id,
          }),
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(`eixora_onboarding_done_${userId}`, 'true');
        }
      }
    } catch (err) {
      console.error('Failed to save brand profile setup:', err);
    } finally {
      setIsSubmitting(false);
      // Transition to beautiful step 6 celebration
      setStep(6);
    }
  };

  const getStageLabel = () => stages.find((s) => s.id === stage)?.label || stage;
  const getPositioningLabel = () => positionings.find((p) => p.id === positioning)?.label || positioning;
  const getNicheLabel = () => niches.find((n) => n.id === niche)?.label || niche;
  const getProductionLabel = () => productions.find((p) => p.id === production)?.label || production;
  const getGoalLabel = () => goals.find((g) => g.id === goal)?.label || goal;

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#bdf522]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Progress Bar */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono font-bold uppercase tracking-widest text-stone-400">
          <span>Brand Intelligence Setup</span>
          <span className="text-[#bdf522]">
            {step === 6 ? 'Setup Complete ✓' : `Step ${step} of 5`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#bdf522]"
            initial={{ width: '20%' }}
            animate={{ width: `${Math.min(100, (step / 5) * 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Brand Stage */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 font-sans">
                Where is your brand right now?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Eixora tailors strategic maturity and saturation reads to your phase.
              </p>
            </div>

            <div className="space-y-2.5">
              {stages.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectStage(item.id)}
                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-left transition-all group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-[#bdf522] flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#bdf522] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#bdf522] transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Positioning & Aesthetic */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 font-sans">
                What is your brand&apos;s aesthetic tone?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Hook scripts will be written in this exact voice.
              </p>
            </div>

            <div className="space-y-2.5">
              {positionings.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPositioning(item.id)}
                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-left transition-all group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-[#bdf522] flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#bdf522] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#bdf522] transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Vertical / Niche */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 font-sans">
                What is your primary vertical?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Select your industry focus for tailored angle-gap discoveries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {niches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNiche(item.id)}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-left transition-all group flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-white group-hover:text-[#bdf522] transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#bdf522] transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Camera / Production Setup */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 font-sans">
                How do you film your content?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Camera directions and director cues will match your exact setup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectProduction(item.id)}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-left transition-all group flex flex-col justify-between space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-[#bdf522] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#bdf522] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 5: Primary Focus */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 font-sans">
                What is your #1 strategic focus?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Eixora will prioritize this in every scan breakdown.
              </p>
            </div>

            <div className="space-y-2.5">
              {goals.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    disabled={isSubmitting}
                    onClick={() => handleSelectGoal(item.id)}
                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-left transition-all group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-[#bdf522] flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#bdf522] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#bdf522] transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {isSubmitting && (
              <div className="text-center py-2 text-xs text-[#bdf522] animate-pulse font-mono">
                Saving your brand DNA profile…
              </div>
            )}
          </motion.div>
        )}

        {/* Step 6: Beautiful Celebration & Confirmation Screen */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-4 space-y-6"
          >
            {/* Glowing checkmark badge */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#bdf522] rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#141a16] border-2 border-[#bdf522] rounded-full flex items-center justify-center text-[#bdf522] shadow-2xl">
                <Check className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={3} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#bdf522]">
                Intelligence Engine Ready
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                Brand DNA Calibrated.
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
                Your vision AI model is now calibrated to reject lazy copycats and generate custom hook scripts for your brand.
              </p>
            </div>

            {/* Profile summary card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-mono">Brand Stage</span>
                <span className="text-white font-semibold">{getStageLabel()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-stone-500 font-mono">Aesthetic Tone</span>
                <span className="text-white font-semibold">{getPositioningLabel()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-stone-500 font-mono">Vertical</span>
                <span className="text-white font-semibold">{getNicheLabel()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-stone-500 font-mono">Camera Setup</span>
                <span className="text-white font-semibold">{getProductionLabel()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-stone-500 font-mono">Primary Focus</span>
                <span className="text-[#bdf522] font-semibold">{getGoalLabel()}</span>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={onComplete}
              className="w-full py-4 bg-[#bdf522] text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#aee618] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#bdf522]/20 active:scale-95 cursor-pointer font-sans"
            >
              Enter Studio & Scan Video
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
