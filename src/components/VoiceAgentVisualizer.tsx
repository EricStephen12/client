'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

interface Props {
  audioIntensityRef: MutableRefObject<number>;
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onActivate?: () => void;
}

/**
 * Gemini Live–style aurora wave anchored to the bottom of the voice stage.
 */
export default function VoiceAgentVisualizer({
  audioIntensityRef,
  isActive,
  isListening,
  isSpeaking,
  isThinking,
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

    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const intensity = Math.max(0, audioIntensityRef.current);
      const level = isActive
        ? Math.min(1, Math.max(0.12, (intensity - 0.5) / 3.0))
        : 0.18 + 0.06 * Math.sin(t / 900);

      ctx.clearRect(0, 0, w, h);

      const baseY = h * 0.72;
      const rise = h * (0.18 + level * 0.38);

      // Soft floor glow — Eixora lime
      const floor = ctx.createLinearGradient(0, h * 0.35, 0, h);
      floor.addColorStop(0, 'rgba(0,0,0,0)');
      floor.addColorStop(0.45, 'rgba(132,204,22,0.08)');
      floor.addColorStop(1, 'rgba(163,230,53,0.16)');
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, w, h);

      const layers = isListening
        ? [
            { amp: 1.0, speed: 0.0011, hue: '190,242,100', alpha: 0.58 },
            { amp: 0.72, speed: 0.0016, hue: '163,230,53', alpha: 0.42 },
            { amp: 0.5, speed: 0.0022, hue: '217,249,157', alpha: 0.30 },
          ]
        : isSpeaking
          ? [
              { amp: 1.0, speed: 0.0011, hue: '163,230,53', alpha: 0.55 },
              { amp: 0.72, speed: 0.0016, hue: '132,204,22', alpha: 0.40 },
              { amp: 0.5, speed: 0.0022, hue: '190,242,100', alpha: 0.28 },
            ]
          : [
              { amp: 1.0, speed: 0.0011, hue: '163,230,53', alpha: 0.42 },
              { amp: 0.72, speed: 0.0016, hue: '101,163,13', alpha: 0.30 },
              { amp: 0.5, speed: 0.0022, hue: '190,242,100', alpha: 0.22 },
            ];

      for (const layer of layers) {
        const breathe = 1 + level * 0.35 * layer.amp;
        const g = ctx.createRadialGradient(
          w * 0.5,
          baseY,
          h * 0.05,
          w * 0.5,
          baseY - rise * 0.2,
          rise * 1.6 * breathe,
        );
        g.addColorStop(0, `rgba(${layer.hue},${layer.alpha})`);
        g.addColorStop(0.45, `rgba(${layer.hue},${layer.alpha * 0.45})`);
        g.addColorStop(1, `rgba(${layer.hue},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, baseY, w * 0.55 * breathe, rise * breathe, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wave ribbon
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) {
          const n =
            Math.sin(x * 0.012 + t * layer.speed) * 0.45 +
            Math.sin(x * 0.021 - t * layer.speed * 1.4) * 0.35 +
            Math.sin(x * 0.007 + t * layer.speed * 0.6) * 0.2;
          const y =
            baseY -
            rise * 0.35 * layer.amp -
            n * rise * (0.25 + level * 0.55) * layer.amp -
            (isThinking ? Math.sin(t / 200 + x * 0.02) * 8 : 0);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const ribbon = ctx.createLinearGradient(0, baseY - rise, 0, h);
        ribbon.addColorStop(0, `rgba(${layer.hue},${layer.alpha * 0.35})`);
        ribbon.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ribbon;
        ctx.fill();
      }

      // Specular highlight core
      const core = ctx.createRadialGradient(w * 0.5, baseY - rise * 0.15, 0, w * 0.5, baseY, rise * 0.7);
      core.addColorStop(0, `rgba(236,252,203,${0.20 + level * 0.28})`);
      core.addColorStop(1, 'rgba(236,252,203,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, baseY - rise * 0.1, w * 0.22, rise * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [audioIntensityRef, isActive, isListening, isSpeaking, isThinking]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
