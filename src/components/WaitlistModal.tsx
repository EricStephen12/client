'use client';

import React, { useState } from 'react';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlatform?: 'ios' | 'android';
}

export default function WaitlistModal({ isOpen, onClose, defaultPlatform = 'ios' }: WaitlistModalProps) {
    const [email, setEmail] = useState('');
    const [platform, setPlatform] = useState<'ios' | 'android'>(defaultPlatform);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch(`/api/main/api/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, platform })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to join waitlist');
            }

            setStatus('success');
            setMessage("You're on the list! We'll email you the exact moment we launch.");
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#121816] rounded-[2rem] p-8 sm:p-10 animate-fade-in-up border border-white/10 overflow-hidden text-stone-100">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400 rounded-full filter blur-3xl opacity-10 pointer-events-none" />

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone-500 hover:text-stone-100 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400 mb-4 block">Invite Only Beta</span>
                    <h2 className="text-3xl font-serif leading-tight mb-4 text-stone-50">
                        Join the <span className="italic text-stone-500">Waitlist</span>
                    </h2>
                    
                    {status === 'success' ? (
                        <div className="bg-lime-400/10 rounded-2xl p-6 text-center border border-lime-400/30 mt-8">
                            <h3 className="font-bold text-stone-50 mb-2">You&apos;re on the list!</h3>
                            <p className="text-sm text-stone-400">Keep an eye on your inbox. We will notify you when the app is ready for download.</p>
                            <button 
                                onClick={onClose}
                                className="mt-6 w-full py-4 bg-lime-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <p className="text-sm text-stone-500 font-medium">We&apos;re currently processing the mobile app. Drop your email to skip the line when we launch.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="creator@example.com"
                                        className="w-full px-6 py-4 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/40 transition-all text-stone-100 placeholder:text-stone-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Platform</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('ios')}
                                            className={`py-4 rounded-xl font-bold text-sm transition-all border ${platform === 'ios' ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-white/[0.03] text-stone-400 border-white/10 hover:border-white/20'}`}
                                        >
                                            iOS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('android')}
                                            className={`py-4 rounded-xl font-bold text-sm transition-all border ${platform === 'android' ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-white/[0.03] text-stone-400 border-white/10 hover:border-white/20'}`}
                                        >
                                            Android
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {status === 'error' && (
                                <p className="text-red-500 text-sm font-medium">{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-5 bg-lime-400 text-slate-950 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-lime-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                            >
                                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                                {status !== 'loading' && <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
