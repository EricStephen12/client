'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function TeamPage() {
    const { user } = useUser();
    const [email, setEmail] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/members`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (err) {
            console.error('Fetch team failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email) return;

        setIsInviting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setEmail('');
                fetchMembers();
            } else {
                setError(data.error || 'Failed to invite');
            }
        } catch (err) {
            setError('System error. Try again.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this member? Their access will be revoked immediately.')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/remove/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchMembers();
        } catch (err) {
            console.error('Remove failed', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <header className="border-b border-purple-50 pb-8">
                <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-2 block">Team Workspace</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tight italic leading-tight">Scale your <span className="text-purple-600">Expertise.</span></h1>
                <p className="mt-4 text-gray-400 font-light max-w-xl">Invite your editors, media buyers, or strategists. Shared intelligence for the whole squad.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
                {/* Invite Form */}
                <div className="bg-white border border-purple-100 p-8 rounded-3xl shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-serif text-gray-900 mb-2">Invite Member</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">5 Seats Available</p>
                    </div>

                    <form onSubmit={handleInvite} className="space-y-4">
                        <input
                            type="email"
                            placeholder="teammate@agency.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-6 py-4 bg-purple-50/30 border border-purple-100 rounded-2xl text-sm focus:ring-2 focus:ring-purple-600 transition-all outline-none"
                        />
                        {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={isInviting || members.length >= 5}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {isInviting ? 'Sending Sync...' : 'Send Invite'}
                        </button>
                    </form>
                </div>

                {/* Member List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-gray-400 border-b border-gray-100 pb-4">Active Squad ({members.length}/5)</h3>

                    <div className="grid gap-4">
                        {members.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-purple-100 rounded-3xl text-center">
                                <p className="text-sm italic text-gray-400">Your agency is currently a solo operation. Invite your first teammate!</p>
                            </div>
                        ) : (
                            members.map((m) => (
                                <RevealOnScroll key={m.id}>
                                    <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center justify-between group hover:border-purple-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {m.member_name ? m.member_name[0] : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{m.member_name || 'Pending User'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{m.member_email}</p>
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                {m.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(m.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </RevealOnScroll>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
