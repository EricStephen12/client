'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const FloatingIcon = ({ type, delay = 0 }: { type: string; delay?: number }) => (
    <motion.div
        initial={{ y: 0, x: 0, opacity: 0, scale: 0.5 }}
        animate={{
            y: [-10, -100],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.8],
        }}
        transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut",
        }}
        className="absolute bottom-4 right-4 pointer-events-none z-20"
    >
        {type === 'heart' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff2d55" className="drop-shadow-[0_0_6px_rgba(255,45,85,0.7)]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] opacity-80">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
        )}
    </motion.div>
);

const SOCIAL_PROOF_DATA = [
    {
        id: 1,
        title: "Hook Logic",
        results: "Scale Ready",
        views: "Energy Signal",
        video: "/videos/v1.mp4"
    },
    {
        id: 2,
        title: "Scale DNA",
        results: "Direct Response",
        views: "Viral Angle",
        video: "/videos/v2.mp4"
    },
    {
        id: 3,
        title: "Winning Angle",
        results: "High Retention",
        views: "Growth Signal",
        video: "/videos/v3.mp4"
    },
    {
        id: 4,
        title: "Growth Signal",
        results: "Pattern Break",
        views: "Winning DNA",
        video: "/videos/v4.mp4"
    },
    {
        id: 5,
        title: "Retention Peak",
        results: "Viral Energy",
        views: "Scale Ready",
        video: "/videos/v5.mp4"
    },
    {
        id: 6,
        title: "Pattern Break",
        results: "High Engagement",
        views: "Direct Link",
        video: "/videos/v6.mp4"
    },
    {
        id: 7,
        title: "Winning Logic",
        results: "Growth Found",
        views: "Tier 1",
        video: "/videos/v7.mp4"
    },
    {
        id: 8,
        title: "Direct Response",
        results: "Viral Hook",
        views: "Winning Angle",
        video: "/videos/v8.mp4"
    }
];

export default function VideoCarousel() {
    const [activeUsers, setActiveUsers] = useState(1842);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
        }, 5000 + Math.random() * 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="py-12 bg-white border-b border-purple-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row items-baseline justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-600 mb-2 block">Reference Library</span>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900 tracking-tight">Viral Logic Studio</h2>
                </div>
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.1em]">
                        {activeUsers.toLocaleString()} media buyers active
                    </p>
                </div>
            </div>

            <div className="relative">
                <motion.div
                    className="flex gap-4 px-4"
                    animate={{
                        x: [0, -100 * SOCIAL_PROOF_DATA.length],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    style={{ width: "max-content" }}
                >
                    {[...SOCIAL_PROOF_DATA, ...SOCIAL_PROOF_DATA].map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="w-[200px] md:w-[240px] group relative bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                        >
                            <div className="aspect-[9/16] relative overflow-hidden">
                                <video
                                    src={item.video}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                />

                                {/* Floating Viral Signals */}
                                <FloatingIcon type="heart" delay={0} />
                                <FloatingIcon type="eye" delay={0.8} />
                                <FloatingIcon type="heart" delay={1.6} />
                                <FloatingIcon type="eye" delay={2.4} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <div className="flex gap-1 mb-2">
                                        <span className="text-[8px] font-bold tracking-tighter bg-white text-black px-1.5 py-0.5 rounded-sm uppercase">
                                            {item.results}
                                        </span>
                                        <span className="text-[8px] font-bold tracking-tighter bg-purple-600 text-white px-1.5 py-0.5 rounded-sm uppercase">
                                            {item.views}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-serif italic text-white mb-0.5">{item.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* No Gradient Masks per user request */}
            </div>
        </div>
    );
}
