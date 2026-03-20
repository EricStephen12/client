'use client';
import { useState, useEffect } from 'react';

export default function FloatingHearts() {
    const [hearts, setHearts] = useState<{ id: number; left: number; duration: number; scale: number; delay: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHearts((prev) => [
                ...prev.slice(-15), // Keep at most 15 hearts
                {
                    id: Date.now(),
                    left: Math.random() * 100,
                    duration: 3 + Math.random() * 4,
                    scale: 0.5 + Math.random() * 1,
                    delay: Math.random() * 2,
                },
            ]);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute bottom-0 text-red-400 opacity-0 animate-float-heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        fontSize: `${16 * heart.scale}px`,
                    } as React.CSSProperties}
                >
                    ❤️
                </div>
            ))}
            <style jsx>{`
                @keyframes float-heart {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-500px) rotate(20deg);
                        opacity: 0;
                    }
                }
                .animate-float-heart {
                    animation-name: float-heart;
                    animation-timing-function: ease-out;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}
