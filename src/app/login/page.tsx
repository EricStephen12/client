'use client';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function LoginPage() {
    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden text-gray-900">

            {}
            <Link 
                href="/" 
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Home
            </Link>

            {}
            <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white/50 backdrop-blur-sm min-h-screen w-full md:w-auto">
                <div className="w-full max-w-md flex flex-col items-center">
                    <RevealOnScroll>
                        <Link href="/" className="inline-block text-4xl sm:text-5xl font-signature mb-8 sm:mb-10 hover:opacity-70 transition-opacity">
                            Eixora.
                        </Link>
                    </RevealOnScroll>

                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'shadow-none bg-transparent w-full',
                                    socialButtonsBlockButton: 'border border-purple-200 hover:bg-purple-50 rounded-xl py-3 text-xs uppercase tracking-widest font-bold transition-all',
                                    formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-lg shadow-purple-200/50 transition-all',
                                    formFieldInput: 'border border-purple-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-colors text-sm',
                                    formFieldLabel: 'text-[10px] uppercase tracking-[0.2em] text-purple-600/60 font-bold font-sans',
                                    footerActionLink: 'text-purple-600 font-bold hover:underline underline-offset-4 decoration-1 decoration-purple-200',
                                }
                            }}
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                        />
                </div>
            </div>

            {}
            <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden hidden md:block">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                >
                    <source src="/videos/v1.webm" type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 z-20 text-white drop-shadow-2xl">
                    <p className="text-4xl font-serif italic leading-[0.9] tracking-tight mb-4">&quot;Decoding the DNA of <br /> viral performance.&quot;</p>
                </div>
            </div>

        </div>
    );
}
