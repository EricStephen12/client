'use client';
import { SignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { clerkAppearance } from '@/lib/clerkAppearance';

export default function LoginPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.replace('/dashboard');
        }
    }, [isLoaded, user, router]);

    return (
        <div
            className="min-h-screen grid md:grid-cols-2 bg-black overflow-hidden text-stone-100 selection:bg-lime-400 selection:text-slate-950"
            style={{ colorScheme: 'dark' }}
        >
            <Link
                href="/"
                className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sm text-stone-300 hover:text-white hover:border-white/20 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Home
            </Link>

            <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 bg-black min-h-screen">
                <div className="w-full max-w-md flex flex-col items-center">
                    <Link
                        href="/"
                        className="font-serif text-4xl sm:text-5xl tracking-[-0.03em] text-white mb-3 hover:opacity-80 transition-opacity"
                    >
                        EIXORA
                    </Link>
                    <p className="text-sm text-stone-500 font-light mb-10 text-center">
                        Welcome back. Pick up your next scan.
                    </p>

                    <div className="w-full flex justify-center">
                        <SignIn
                            appearance={clerkAppearance}
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                        />
                    </div>
                </div>
            </div>

            <div className="relative bg-black overflow-hidden hidden md:block border-l border-white/[0.06]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                >
                    <source src="/videos/v1.webm" type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-12 lg:p-16">
                    <p className="text-[11px] tracking-[0.3em] uppercase text-lime-400 mb-4 font-mono font-bold">Video & Product Intel</p>
                    <p className="font-sans text-3xl lg:text-4xl text-white font-bold leading-tight mb-4">
                        Video Intel.
                        <br />
                        Product Intel.
                    </p>
                    <p className="text-sm text-stone-400 font-normal max-w-sm leading-relaxed font-sans">
                        Sign in to scan viral ads, evaluate competitive saturation, and extract winning hooks in seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
