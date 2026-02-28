'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import RevealOnScroll from '@/components/RevealOnScroll';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // STEP 1: Register user on backend
            const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const regData = await regRes.json();
            if (!regRes.ok) throw new Error(regData.error || 'Failed to register');

            // STEP 2: Sign in with NextAuth
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) throw new Error('Registration successful, but login failed. Please sign in manually.');

            // Successfully logged in
            router.refresh();
            router.replace('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden text-gray-900">

            {/* Left Column - Form */}
            <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 order-2 md:order-1 border-r border-purple-100 bg-white/50 backdrop-blur-sm">
                <div className="w-full max-w-sm">
                    <RevealOnScroll>
                        <Link href="/" className="inline-block text-5xl font-signature mb-12 hover:opacity-70 transition-opacity">
                            Eixora.
                        </Link>
                    </RevealOnScroll>

                    <div className="mb-10">
                        <RevealOnScroll delay={100}>
                            <span className="text-xs font-medium tracking-[0.3em] uppercase mb-4 text-purple-600 block font-sans">Join the Elite</span>
                        </RevealOnScroll>
                        <RevealOnScroll delay={200}>
                            <h1 className="text-5xl font-serif font-medium leading-tight text-gray-900">
                                Start your <br />
                                <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">trial.</span>
                            </h1>
                        </RevealOnScroll>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-light rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-6">
                        <RevealOnScroll delay={300}>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-purple-600/60 font-bold font-sans">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-transparent border-b border-purple-200 px-0 py-3 text-gray-900 placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors border-t-0 border-x-0 rounded-none text-sm"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={400}>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-purple-600/60 font-bold font-sans">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-transparent border-b border-purple-200 px-0 py-3 text-gray-900 placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors border-t-0 border-x-0 rounded-none text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold opacity-60">At least 6 characters</p>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={500}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 rounded-xl shadow-lg shadow-purple-200/50"
                            >
                                {loading ? 'Creating Account...' : 'Get Started'}
                            </button>
                        </RevealOnScroll>
                    </form>

                    <RevealOnScroll delay={600}>
                        <p className="mt-8 text-center text-xs text-gray-500 font-medium uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-600 font-bold hover:underline underline-offset-4 decoration-1 decoration-purple-200">
                                Sign in
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
                    <p className="text-4xl font-serif italic leading-[0.9] tracking-tight mb-4">"I stopped guessing. <br /> Now I just ship winners."</p>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 font-bold">— Verified Member</p>
                </div>
            </div>

        </div>
    );
}
