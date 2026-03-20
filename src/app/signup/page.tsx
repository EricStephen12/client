'use client';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function SignupPage() {
    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden text-gray-900">

            {/* Left Column - Clerk Sign Up */}
            <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 order-2 md:order-1 border-r border-purple-100 bg-white/50 backdrop-blur-sm">
                <div className="w-full max-w-md flex flex-col items-center">
                    <RevealOnScroll>
                        <Link href="/" className="inline-block text-5xl font-signature mb-10 hover:opacity-70 transition-opacity">
                            Eixora.
                        </Link>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <SignUp
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
                    </RevealOnScroll>
                </div>
            </div>

            {/* Right Column - Image */}
            <div className="hidden md:block relative bg-gradient-to-br from-purple-100 to-blue-100 order-1 md:order-2 overflow-hidden h-full min-h-screen">
                <Image
                    src="/hero-person.jpg"
                    fill
                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-[4s] ease-out"
                    alt="Editorial"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 z-20 text-white drop-shadow-2xl">
                    <p className="text-4xl font-serif italic leading-[0.9] tracking-tight mb-4">&quot;I stopped guessing. <br /> Now I just ship winners.&quot;</p>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 font-bold">— Verified Member</p>
                </div>
            </div>

        </div>
    );
}
