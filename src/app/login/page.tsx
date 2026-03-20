'use client';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function LoginPage() {
    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden text-gray-900">

            {/* Left Column - Clerk Sign In */}
            <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 order-2 md:order-1 border-r border-purple-100 bg-white/50 backdrop-blur-sm">
                <div className="w-full max-w-sm">
                    <RevealOnScroll>
                        <Link href="/" className="inline-block text-5xl font-signature mb-12 hover:opacity-70 transition-opacity">
                            Eixora.
                        </Link>
                    </RevealOnScroll>

                    <div className="mb-10">
                        <RevealOnScroll delay={100}>
                            <span className="text-xs font-medium tracking-[0.3em] uppercase mb-4 text-purple-600 block font-sans">Welcome Back</span>
                        </RevealOnScroll>
                        <RevealOnScroll delay={200}>
                            <h1 className="text-5xl font-serif font-medium leading-tight text-gray-900">
                                Access your <br />
                                <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">workspace.</span>
                            </h1>
                        </RevealOnScroll>
                    </div>

                    <RevealOnScroll delay={300}>
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'shadow-none bg-transparent p-0 w-full',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: 'border border-purple-200 hover:bg-purple-50 rounded-xl py-3 text-xs uppercase tracking-widest font-bold transition-all',
                                    formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-lg shadow-purple-200/50 transition-all',
                                    formFieldInput: 'bg-transparent border-b border-purple-200 px-0 py-3 text-gray-900 placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors border-t-0 border-x-0 rounded-none text-sm',
                                    formFieldLabel: 'text-[10px] uppercase tracking-[0.2em] text-purple-600/60 font-bold font-sans',
                                    footerActionLink: 'text-purple-600 font-bold hover:underline underline-offset-4 decoration-1 decoration-purple-200',
                                    footer: 'hidden',
                                }
                            }}
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                        />
                    </RevealOnScroll>

                    <RevealOnScroll delay={600}>
                        <p className="mt-8 text-center text-xs text-gray-500 font-medium uppercase tracking-widest">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-purple-600 font-bold hover:underline underline-offset-4 decoration-1 decoration-purple-200">
                                Join for free
                            </Link>
                        </p>
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
                    <p className="text-4xl font-serif italic leading-[0.9] tracking-tight mb-4">&quot;Revenue up 300% <br /> in Q4.&quot;</p>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 font-bold">— Verified Member</p>
                </div>
            </div>

        </div>
    );
}
