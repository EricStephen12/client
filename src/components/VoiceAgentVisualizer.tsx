'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

interface Props {
  audioIntensityRef: MutableRefObject<number>;
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onActivate: () => void;
}

const BAR_COUNT = 32;

/**
 * Flat voice-agent UI — rings + live waveform (not a 3D orb mock).
 */
export default function VoiceAgentVisualizer({
  audioIntensityRef,
  isActive,
  isListening,
  isSpeaking,
  isThinking,
  onActivate,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const bars = new Float32Array(BAR_COUNT).fill(0.12);

    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const intensity = Math.max(0, audioIntensityRef.current);
      const level = isActive
        ? Math.min(1, (intensity - 0.6) / 3.2)
        : 0.08 + 0.04 * Math.sin(t / 900);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.28;

      // Soft outer breath
      const breath = 1 + (isActive ? level * 0.08 : 0.02 * Math.sin(t / 700));
      const g = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.1 * breath);
      if (isListening) {
        g.addColorStop(0, 'rgba(248,113,113,0.18)');
        g.addColorStop(0.45, 'rgba(248,113,113,0.05)');
      } else if (isSpeaking) {
        g.addColorStop(0, 'rgba(190,242,100,0.22)');
        g.addColorStop(0.45, 'rgba(163,230,53,0.06)');
      } else {
        g.addColorStop(0, 'rgba(163,230,53,0.10)');
        g.addColorStop(0.45, 'rgba(163,230,53,0.03)');
      }
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.1 * breath, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings
      for (let i = 0; i < 3; i++) {
        const r = radius * (1.15 + i * 0.28) * (1 + level * 0.04 * (3 - i));
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = isListening
          ? `rgba(248,113,113,${0.22 - i * 0.06})`
          : `rgba(190,242,100,${0.18 - i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Core disc
      const core = ctx.createRadialGradient(cx, cy - radius * 0.15, 0, cx, cy, radius);
      core.addColorStop(0, '#1f2937');
      core.addColorStop(0.7, '#0f172a');
      core.addColorStop(1, '#020617');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
      ctx.strokeStyle = isListening
        ? 'rgba(248,113,113,0.55)'
        : isSpeaking
          ? 'rgba(190,242,100,0.55)'
          : 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Waveform bars across the core
      const barW = (radius * 1.5) / BAR_COUNT;
      const startX = cx - (BAR_COUNT * barW) / 2;
      for (let i = 0; i < BAR_COUNT; i++) {
        const n =
          0.35 +
          0.65 * Math.abs(Math.sin(t / 180 + i * 0.45)) *
            (0.4 + 0.6 * Math.abs(Math.sin(t / 320 + i * 0.2)));
        const target = isActive
          ? 0.15 + level * (0.35 + 0.65 * n)
          : isThinking
            ? 0.12 + 0.1 * Math.abs(Math.sin(t / 250 + i * 0.3))
            : 0.08 + 0.05 * Math.abs(Math.sin(t / 800 + i * 0.15));
        bars[i] += (target - bars[i]) * 0.22;
        const bh = radius * 1.15 * bars[i];
        const x = startX + i * barW + barW * 0.2;
        const y = cy - bh / 2;
        ctx.fillStyle = isListening
          ? `rgba(252,165,165,${0.45 + bars[i] * 0.45})`
          : `rgba(190,242,100,${0.35 + bars[i] * 0.55})`;
        ctx.beginPath();
        const rw = barW * 0.55;
        const rad = Math.min(3, rw / 2);
        ctx.roundRect(x, y, rw, bh, rad);
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [audioIntensityRef, isActive, isListening, isSpeaking, isThinking]);

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label="Voice agent — tap to talk"
      className="relative w-full h-full rounded-full border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </button>
  );
}
