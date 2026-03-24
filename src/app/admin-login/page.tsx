'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/main/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok) {
                // Store token for the 'Authorization' header fallback 🚀
                localStorage.setItem('admin_token', data.token);
                // Redirect to Admin Dashboard
                router.push('/dashboard/admin');
            } else {
                setError(data.error || 'Invalid Elite Access Key.');
            }
        } catch (err) {
            setError('Connection failed. Elite Security Protocol engaged.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] opacity-50" />

            <RevealOnScroll className="relative z-10 w-full max-w-md">
                <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-2xl">💎</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Elite Admin Hub</h1>
                        <p className="text-gray-400 text-sm">Secure Master Access Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                                Elite Access Key
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#050505] border border-[#1A1A1A] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-700"
                                placeholder="••••••••••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 ${isLoading
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                }`}
                        >
                            {isLoading ? 'Decrypting...' : 'Authenticate'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-[#1A1A1A] text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                            End-to-End Encrypted Session 🛡️
                        </p>
                    </div>
                </div>
            </RevealOnScroll>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
