'use client';
import { useEffect, useRef, useState } from 'react';

const CREATOR_OUTPUT = `DASHBOARD OVERVIEW

Niche: Beauty / Skincare
Customer Awareness Level: Problem-aware (they know their current routine sucks)
Hook Power: 7/10 – The "Nothing works anymore" text slams the pain point, but the visual is a static close-up; it stops scrolling only because the woman looks genuinely exhausted. One more visual surprise would push it to an 8.
Retention Score: 5/10 – Viewers stay glued for the glow reveal at 5.5s, then the momentum collapses into a bland CTA. The middle zoom (1.5s) adds nothing, dragging the watch-time down.
Conversion Trigger Score: 6/10 – 50% off is a solid discount, yet the scarcity whisper ("before they sell out") isn't backed by any visual timer or stock cue, so the trigger fizzles.
Big Idea: "Your junk bottles are killing your glow—ditch them now."

HOOK VERDICT

Visual Hook: 6/10 – The tired-face close-up (Frame 1, 0.0s) instantly signals a problem, but the bottle is generic and unremarkable; the visual stakes feel flat, costing a point.
Spoken Hook: 7/10 – "I was so tired of wasting money on skincare that literally did nothing" hits the frustration chord hard, yet it repeats the visual cue without adding new tension.
Fatal Hook Flaw & Fix: The audio boasts "Look at my skin now. It's insane," yet no close-up of her radiant skin appears; the claim has zero visual proof. Fix – Insert a 1-second macro shot at 5.8s showing her skin texture in hyper-detail.

RETENTION MAP

Attention Peak: 5.5s (Frame 4) – the bright, high-energy reveal of the glowing green bottle and her smile.
Dead Zone: 1.5s–2.0s (Frame 2) – the quick zoom adds no narrative weight; cut it and let the trash-throw flow directly into the glow reveal.

THE SECRET SAUCE

Your skin's glow is the proof you need. People scroll past vague "look at my skin" promises because they can't see the result. By giving the camera an unfiltered, up-close look at the actual complexion, you turn a boast into undeniable evidence. Metric to move: CTR.`;

const STUDIO_OUTPUT = `DASHBOARD OVERVIEW

Niche: Beauty/Skincare
Customer Awareness Level: Problem-Aware — she's naming the pain ("skincare that literally did nothing") before the product ever gets mentioned. Nobody's searching "GlowSerum" yet, they're just sick of their bathroom shelf.
Hook Power: 7/10. Frame 1's tired-face-plus-bottle combo is a real pattern interrupt in a feed full of smiling influencers, but it's not an 8 or 9 because nothing in that first frame is visually strange enough to stop a thumb mid-scroll — it's a good hook, not a great one.
Retention Score: 5/10. You've got a two-frame dead zone right out of the gate (more on that below), and that's exactly where people bail.
Conversion Trigger: 6/10. The words do the selling, the visuals don't back them up — I'll show you exactly where.
Big Idea: She's already convinced. Your CTA screen forgot to be.

HOOK VERDICT

Visual Hook: 6/10. The stressed face and generic bottle in Frame 1 works because it's specific and relatable, not one point higher because a "generic bottle" in someone's hand doesn't read as instantly as, say, a messy bathroom counter would.
Spoken Hook: 8/10. "So tired of wasting money on skincare that literally did nothing" is a killer opening line — it's a complaint everyone in your target audience has said out loud to a friend.
Fatal Hook Flaw & Fix: Frame 1 and Frame 2 are the same emotional beat twice — tired face, then a zoom into the same tired face. Fix: cut Frame 2 entirely, or replace that zoom with the trash-can moment from Frame 3 pulled forward — get to the action faster, since action reads faster than a static expression on a small screen.

PSYCHOLOGY BREAKDOWN

Primary Trigger: Frustration → Relief. The mismatch worth flagging: the spoken line says "before they sell out" — that's a scarcity trigger, real urgency language. But Frame 5's on-screen text only says "Get 50% Off Today!" There's no stock counter, no "limited units," nothing visual backing up the "sell out" claim. You've got urgency in the voiceover and none in the graphic doing the actual selling on a muted autoplay scroll. That's free conversion lift you're leaving on the table.

THE SECRET SAUCE

Your product shows up four seconds too late. Everything before Frame 4 is doing its job — the frustration is real, the trash-can moment is satisfying, the transformation shot has genuine energy. But you buried the actual bottle, the actual glow, the actual proof, behind two seconds of a woman being sad at herself. Nobody clicks a link because they related to someone's pain for five seconds — they click because they believe the fix is real and they might miss it. Right now the fix looks great and the "might miss it" part is a text overlay with no teeth. Metric to move: CTR — tightening the hook and giving the scarcity claim a visual to match gets more people to Frame 4's glow before they scroll off.`;

function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, text, speed]);

  return { displayed, done };
}

function TypingBlock({ text, speed, active, label, badge, isStudio }: {
  text: string;
  speed: number;
  active: boolean;
  label: string;
  badge: string;
  isStudio: boolean;
}) {
  const { displayed, done } = useTypewriter(text, speed, active);

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden border ${isStudio ? 'border-[#CAFF00]/30' : 'border-white/10'}`} style={{ background: '#161616' }}>
      {/* Column Header */}
      <div className={`px-6 py-5 flex items-center gap-3 border-b ${isStudio ? 'border-[#CAFF00]/20' : 'border-white/10'}`} style={{ background: '#0F0F0F' }}>
        <span className={`text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1.5 rounded-full ${isStudio ? 'bg-[#CAFF00] text-black' : 'bg-white/10 text-white/60'}`}>
          {label}
        </span>
        {isStudio && (
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#CAFF00]/60 border border-[#CAFF00]/30 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? (isStudio ? 'bg-[#CAFF00] animate-pulse' : 'bg-white/40 animate-pulse') : 'bg-white/20'}`} />
          <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">
            {done ? 'Complete' : active ? 'Typing...' : 'Queued'}
          </span>
        </div>
      </div>

      {/* Analysis Text */}
      <div className="flex-1 p-6 font-mono text-[11px] leading-[1.8] text-white/70 min-h-[480px] max-h-[600px] overflow-y-auto whitespace-pre-wrap">
        {displayed.split('\n').map((line, i) => {
          // Section headers
          if (line.match(/^[A-Z\s/&]+$/) && line.trim().length > 2) {
            return (
              <div key={i} className={`font-bold text-[10px] tracking-[0.3em] uppercase mt-5 mb-2 ${isStudio ? 'text-[#CAFF00]' : 'text-white/50'}`}>
                {line}
              </div>
            );
          }
          // Score lines
          if (line.match(/Score:|Power:|Trigger:|Hook:/)) {
            return (
              <div key={i} className="text-white/90 mb-1">{line}</div>
            );
          }
          return <div key={i} className={line === '' ? 'h-2' : 'mb-0.5'}>{line}</div>;
        })}
        {/* Blinking cursor */}
        {active && !done && (
          <span className={`inline-block w-2 h-3.5 ml-0.5 animate-pulse align-middle ${isStudio ? 'bg-[#CAFF00]' : 'bg-white/50'}`} />
        )}
      </div>
    </div>
  );
}

export default function AIComparisonSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-4 sm:px-6" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#CAFF00] block mb-4">
            AI Quality Proof
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            See The Difference
          </h2>
          <p className="text-white/40 text-base sm:text-lg font-light max-w-lg mx-auto leading-relaxed">
            Same video. Two AI minds. Judge the depth yourself.
          </p>
          {/* Divider */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-white/10" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">GlowSerum Skincare Ad · Live Analysis Output</span>
            <div className="h-px w-16 bg-white/10" />
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TypingBlock
            text={CREATOR_OUTPUT}
            speed={18}
            active={hasStarted}
            label="Creator Plan"
            badge=""
            isStudio={false}
          />
          <TypingBlock
            text={STUDIO_OUTPUT}
            speed={14}
            active={hasStarted}
            label="Studio Plan"
            badge="Premium AI · Claude Sonnet 5"
            isStudio={true}
          />
        </div>

      </div>
    </section>
  );
}
