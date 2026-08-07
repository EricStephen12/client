'use client';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.replace('/dashboard');
        }
    }, [isLoaded, user, router]);
    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-[#0a0c0b] overflow-hidden text-stone-100 selection:bg-lime-400 selection:text-slate-950">

            {}
            <Link 
                href="/" 
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-lime-400 hover:bg-lime-400 hover:text-slate-950 transition-all group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Home
            </Link>

            {}
            <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-[#0e1210]/80 backdrop-blur-sm min-h-screen w-full md:w-auto">
                <div className="w-full max-w-md flex flex-col items-center">
                    <RevealOnScroll>
                        <Link href="/" className="inline-block text-4xl sm:text-5xl font-signature mb-8 sm:mb-10 hover:opacity-70 transition-opacity text-stone-100">
                            Eixora.
                        </Link>
                    </RevealOnScroll>

                        <SignIn
                            appearance={{
                                variables: {
                                    colorBackground: 'transparent',
                                    colorInputBackground: 'rgba(255,255,255,0.04)',
                                    colorInputText: '#f5f5f4',
                                    colorText: '#f5f5f4',
                                    colorTextSecondary: '#a8a29e',
                                    colorPrimary: '#a3e635',
                                    colorTextOnPrimaryBackground: '#020617',
                                    colorDanger: '#f87171',
                                    borderRadius: '0.75rem',
                                },
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'shadow-none bg-transparent w-full',
                                    headerTitle: 'text-stone-100',
                                    headerSubtitle: 'text-stone-500',
                                    socialButtonsBlockButton: 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-stone-100 rounded-xl py-3 text-xs uppercase tracking-widest font-bold transition-all',
                                    socialButtonsBlockButtonText: 'text-stone-100',
                                    dividerLine: 'bg-white/10',
                                    dividerText: 'text-stone-500',
                                    formButtonPrimary: 'bg-lime-400 hover:bg-lime-300 text-slate-950 py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-xl transition-all',
                                    formFieldInput: 'border border-white/10 bg-white/[0.04] rounded-xl px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 transition-colors text-sm',
                                    formFieldLabel: 'text-[10px] uppercase tracking-[0.2em] text-lime-400/70 font-bold font-sans',
                                    footerActionLink: 'text-lime-400 font-bold hover:underline underline-offset-4 decoration-1 decoration-lime-400/40',
                                    footerActionText: 'text-stone-500',
                                    identityPreviewText: 'text-stone-300',
                                    identityPreviewEditButton: 'text-lime-400',
                                }
                            }}
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                        />
                </div>
            </div>

            {}
            <div className="relative bg-[#0e1210] overflow-hidden hidden md:block">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                >
                    <source src="/videos/v1.webm" type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0b]/80 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 z-20 text-stone-100 drop-shadow-2xl">
                    <p className="text-4xl font-serif italic leading-[0.9] tracking-tight mb-4">&quot;Decoding the DNA of <br /> viral performance.&quot;</p>
                </div>
            </div>

        </div>
    );
}
