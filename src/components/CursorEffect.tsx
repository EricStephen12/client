'use client';

import { useEffect, useRef } from 'react';

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<any[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            // Spawn a bunch of "fish" on move
            for (let i = 0; i < 5; i++) {
                particlesRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 3 + 1,
                    color: Math.random() > 0.5 ? '#A855F7' : '#3B82F6', // Purple or Blue
                    life: 1,
                    decay: Math.random() * 0.02 + 0.01,
                    offset: Math.random() * Math.PI * 2
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Limit particle count
            if (particlesRef.current.length > 300) {
                particlesRef.current = particlesRef.current.slice(-300);
            }

            particlesRef.current.forEach((p, i) => {
                p.life -= p.decay;

                // Organic "swimming" movement toward mouse with some noise
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 50) {
                    p.vx += (dx / dist) * 0.2;
                    p.vy += (dy / dist) * 0.2;
                }

                // Add some wiggle
                p.vx += Math.sin(Date.now() * 0.01 + p.offset) * 0.1;
                p.vy += Math.cos(Date.now() * 0.01 + p.offset) * 0.1;

                p.vx *= 0.95; // Friction
                p.vy *= 0.95;

                p.x += p.vx;
                p.y += p.vy;

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    return;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life * 0.5;
                ctx.fill();
            });

            // Draw a subtle glow under the cursor
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, 100
            );
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[60]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
