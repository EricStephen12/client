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
      label: 'Founder-Led Brand',
      desc: 'Authentic founder storytelling & organic brand growth',
      icon: Video,
    },
    {
      id: 'agency',
      label: 'Brand Studio / Agency',
      desc: 'Developing high-converting creative briefs for brands',
      icon: Building2,
    },
  ];

  // Step 2: Brand Positioning & Aesthetic
  const positionings = [
    {
      id: 'minimalist_dtc',
      label: 'Clean Modern DTC',
      desc: 'Apple & Glossier style — subtle, aesthetic, refined',
      icon: Gem,
    },
    {
      id: 'clinical_trust',
      label: 'Clinical & High-Trust',
      desc: 'Demonstration, proof, expert authority & zero fluff',
      icon: FlaskConical,
    },
    {
      id: 'luxury_aspirational',
      label: 'Elevated & Luxury',
      desc: 'Desire-driven, prestige, premium positioning',
      icon: Crown,
    },
    {
      id: 'bold_challenger',
      label: 'Bold Challenger',
      desc: 'Disrupting legacy brands, punchy & energetic',
      icon: Zap,
    },
  ];

  // Step 3: Primary Vertical
  const niches = [
    { id: 'beauty', label: 'Beauty & Skincare', emoji: '💄' },
    { id: 'tech', label: 'Tech & Gadgets', emoji: '⚡' },
    { id: 'fashion', label: 'Fashion & Apparel', emoji: '👗' },
    { id: 'fitness', label: 'Health & Wellness', emoji: '🏋️' },
    { id: 'home', label: 'Home & Living', emoji: '🏠' },
    { id: 'multi', label: 'Multi-Brand Studio', emoji: '📦' },
  ];

  // Step 4: Creative & Production Setup
  const productions = [
    {
      id: 'ugc_iphone',
      label: 'Native UGC & iPhone',
      desc: 'Handheld, authentic framing & natural light',
      icon: Smartphone,
    },
    {
      id: 'founder_camera',
      label: 'Founder Talking Head',
      desc: 'Direct-to-camera founder insights & podcast setup',
      icon: Mic,
    },
    {
      id: 'studio_cinema',
      label: 'Studio & Cinema B-Roll',
      desc: 'Clean softbox lighting, macro shots & pro editing',
      icon: Clapperboard,
    },
    {
      id: 'faceless_motion',
      label: 'Faceless & Motion Design',
      desc: 'Sourced clips, sound design & bold text overlays',
      icon: Layers,
    },
  ];

  // Step 5: Primary Focus
  const goals = [
    {
      id: 'niche_bending',
      label: 'Niche Bending & Angle Gaps',
      desc: 'Stand out from copycats with fresh brand positioning',
      icon: Shuffle,
    },
    {
      id: 'thumbstop_hook',
      label: 'First 3s Thumb-Stop Power',
      desc: 'Fix scroll-past drop-off in high-competition feeds',
      icon: Target,
    },
    {
      id: 'retention_pacing',
      label: 'Watch-Time & Retention Pacing',
      desc: 'Keep viewers hooked through the entire story arc',
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
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0e1210] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#bdf522]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Progress Bar */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono font-bold uppercase tracking-widest text-stone-400">
          <span>Brand Intelligence Setup</span>
          <span className="text-[#bdf522]">Step {step} of 5</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#bdf522]"
            initial={{ width: '20%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
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
                Eixora calibrates market reads and creative velocity to your stage.
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

        {/* Step 2: Brand Positioning */}
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
                What is your brand aesthetic & tone?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Ensures script rewrites reflect your authentic positioning, not cheap hype.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {positionings.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPositioning(item.id)}
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

        {/* Step 3: Vertical */}
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
                Calibrates viral benchmarks and saturation reads to your market.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {niches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNiche(item.id)}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#bdf522]/40 hover:bg-white/[0.04] text-center transition-all group flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </span>
                  <span className="text-xs font-bold text-stone-200 group-hover:text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Creative & Production Setup */}
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
                How do you produce content?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans">
                Eixora tailors hook scripts and camera direction to your exact setup.
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
      </AnimatePresence>
    </div>
  );
}
