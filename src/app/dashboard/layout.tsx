'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useState, useEffect, Suspense } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';
import OnboardingFlow from '@/components/OnboardingFlow';
import { AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const { getToken, userId: clerkUserId } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isAdminMaster, setIsAdminMaster] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const userId = user?.id;

    useEffect(() => {
        const fetchSessions = async () => {
            if (!userId) return;
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/user-sessions?userId=${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data);
                }
            } catch (err) {
                console.error('Fetch sessions failed', err);
            }
        };

        const fetchLatestProfile = async () => {
            if (!userId) return;
            try {
                const token = await getToken();
                const res = await fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || '')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);
                    
                    // Trigger Onboarding if not completed 🚀
                    if (data.onboarding_completed === false) {
                        setShowOnboarding(true);
                    }
                }
            } catch (err) {
                console.error('Profile fetch failed', err);
            }
        };

        // Check for Master Admin session 💎🛡️
        const masterToken = localStorage.getItem('admin_token');
        if (masterToken) setIsAdminMaster(true);

        if (userId) {
            fetchSessions();
            fetchLatestProfile();
        }

        const handleSessionUpdate = () => {
            console.log('🔄 Session update event received, refreshing sidebar...');
            fetchSessions();
            fetchLatestProfile();
        };

        window.addEventListener('session-updated', handleSessionUpdate);
        return () => window.removeEventListener('session-updated', handleSessionUpdate);
    }, [userId]);

    const navItems = [
        { name: 'Overview', href: '/dashboard' },
        { name: 'Intelligence Studio', href: '/dashboard/analyze' },
        { name: 'Batch Processing', href: '/dashboard/batch' },
        { name: 'Settings', href: '/dashboard/settings' },
    ];

    // Add Admin Hub for admin users (Clerk or Master Secret) 💎🛡️
    const isAdmin = (user?.publicMetadata as any)?.is_admin || profileData?.is_admin || isAdminMaster;
    if (isAdmin) {
        navItems.push({ name: 'Admin Hub', href: '/dashboard/admin' });
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        localStorage.removeItem('admin_token'); // Purge Elite Session 🚀
        // Also hit server to clear cookie
        await fetch('/api/main/api/admin/auth/logout', { method: 'POST' });
        await signOut({ redirectUrl: '/' });
    };

    const handleOnboardingComplete = async (data: { niche: string; goal: string }) => {
        try {
            const token = await getToken();
            const res = await fetch('/api/main/api/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    onboarding_completed: true,
                    brand_niche: data.niche,
                    primary_goal: data.goal
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setProfileData(updated);
                setShowOnboarding(false);
            }
        } catch (err) {
            console.error('Onboarding update failed', err);
        }
    };

    const profile = isLoaded && user ? {
        full_name: user.fullName || user.username || 'Creator',
        email: user.primaryEmailAddress?.emailAddress,
        image: user.imageUrl,
        plan_type: (user.publicMetadata as any)?.plan_type || profileData?.plan_type || 'free'
    } : null;

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-gray-900">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 font-serif italic text-lg">Authenticating Mastermind...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">

            {/* Premium Sidebar (Desktop) */}
            <aside className="w-72 border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen bg-white">
                <Suspense fallback={<div className="p-8 w-full h-full bg-white animate-pulse" />}>
                    <SidebarContent
                        pathname={pathname}
                        navItems={navItems}
                        handleLogout={handleLogout}
                        isLoggingOut={isLoggingOut}
                        profile={profile}
                        sessions={sessions}
                        onOpenSupport={() => setIsSupportOpen(true)}
                    />
                </Suspense>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-slide-in">
                        <div className="flex justify-end p-6">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <Suspense fallback={<div className="p-8 w-full h-full bg-white animate-pulse" />}>
                            <SidebarContent
                                pathname={pathname}
                                navItems={navItems}
                                handleLogout={handleLogout}
                                isLoggingOut={isLoggingOut}
                                onClose={() => setIsMobileMenuOpen(false)}
                                profile={profile}
                                sessions={sessions}
                                onOpenSupport={() => setIsSupportOpen(true)}
                            />
                        </Suspense>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="flex lg:hidden items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/" className="text-2xl font-serif font-bold italic">Eixora<span className="text-amber-600">.</span></Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>

                <div className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto min-h-screen">
                    <RevealOnScroll>
                        {children}
                    </RevealOnScroll>
                </div>

                {/* Onboarding Overlay 🚀 */}
                <AnimatePresence>
                    {showOnboarding && (
                        <OnboardingFlow 
                            userName={user?.firstName || 'Director'} 
                            onComplete={handleOnboardingComplete} 
                        />
                    )}
                </AnimatePresence>

                {/* 📨 ELITE SUPPORT MODAL 🛡️ */}
                <SupportModal
                    isOpen={isSupportOpen}
                    onClose={() => setIsSupportOpen(false)}
                    userAddress={user?.primaryEmailAddress?.emailAddress}
                    userId={user?.id}
                />

                {/* Floating Support Trigger (Mobile) */}
                <button
                    onClick={() => setIsSupportOpen(true)}
                    className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            </main>
        </div>
    );
}

function SupportModal({ isOpen, onClose, userAddress, userId }: any) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/main/api/support/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userAddress, userId, subject, message })
            });
            if (res.ok) setSent(true);
        } catch (err) {
            console.error('Support failed', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pb-20 md:pb-6">
            <div className="absolute inset-0 bg-purple-950/20 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                <div className="p-8">
                    {sent ? (
                        <div className="text-center space-y-4 py-12">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                            <h2 className="text-3xl font-serif italic text-gray-900">Message Transmitted.</h2>
                            <p className="text-gray-400 text-sm">The Elite Support agents have received your signal. Expect a response in your secure inbox soon.</p>
                            <button onClick={onClose} className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Close Relay</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-3xl font-serif italic text-gray-900 leading-tight">Secure Relay.</h2>
                                <button type="button" onClick={onClose} className="text-gray-300 hover:text-purple-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mb-8">Direct line to Eixora Masterminds. Report issues or request elite feature deployments.</p>

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-[10px] font-black tracking-widest uppercase text-purple-600 mb-2 block">Subject of Inquiry</label>
                                    <input
                                        required
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Brief summary..."
                                        className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black tracking-widest uppercase text-purple-600 mb-2 block">Message Details</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Explain your situation bro..."
                                        className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-4 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {sending ? 'Transmitting...' : 'Send to Mastermind Hub'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function SidebarContent({ pathname, navItems, handleLogout, isLoggingOut, onClose, profile, sessions, onOpenSupport }: any) {
    const searchParams = useSearchParams();
    const currentSessionId = searchParams.get('sessionId');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex-shrink-0">
                <Link href="/" className="text-2xl font-serif font-bold italic hover:opacity-70 transition-opacity">
                    Eixora<span className="text-amber-600">.</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-10">
                {/* Navigation Section */}
                <div className="space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-2 block italic">Lounge Access</span>
                    {navItems.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-2xl ${isActive
                                    ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/10'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-amber-600'
                                    }`}
                            >
                                <span className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-slate-950' : 'bg-slate-200 group-hover:bg-amber-400'}`}></span>
                                <div className="flex items-center justify-between w-full">
                                    <span>{item.name}</span>
                                    {item.comingSoon && (
                                        <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full tracking-normal lowercase">soon</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-2 block italic">Recent Flows</span>
                    <div className="space-y-2">
                        {sessions && sessions.length > 0 ? (
                            sessions.slice(0, 8).map((session: any) => {
                                const isActive = currentSessionId === session.id;
                                return (
                                    <Link
                                        key={session.id}
                                        href={`/dashboard/analyze?sessionId=${session.id}`}
                                        onClick={onClose}
                                        className={`block px-4 py-3 text-[9px] tracking-widest uppercase truncate rounded-xl transition-all border border-transparent ${isActive
                                            ? 'bg-white text-slate-900 font-bold border-slate-100 shadow-sm'
                                            : 'text-slate-400 font-medium hover:text-amber-600 hover:bg-white'
                                            }`}
                                        title={session.title}
                                    >
                                        {session.title || 'Untitled Session'}
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-[9px] text-slate-300 font-medium uppercase tracking-widest border border-dashed border-slate-100 rounded-xl italic">
                                No sessions yet
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Elite Support Link */}
                <button
                    onClick={() => { onOpenSupport(); onClose?.(); }}
                    className="w-full group flex items-center gap-3 px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-2xl text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                >
                    <span className="w-1 h-1 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                    <span>Elite Support</span>
                </button>
            </div>

            <div className="p-8 border-t border-slate-100 space-y-6 flex-shrink-0 bg-slate-50/50">
                {profile ? (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-950 to-purple-950 text-white flex items-center justify-center font-serif italic text-lg shadow-md border border-white/10">
                            {profile.full_name ? profile.full_name[0] : 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest truncate text-slate-900">{profile.full_name || 'Creator'}</p>
                            <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest italic">{profile.plan_type === 'free' || !profile.plan_type ? 'Discovery Mode' : `${profile.plan_type} Member`}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-4 px-4 border border-slate-200 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:border-amber-200 hover:text-amber-600 hover:bg-white transition-all rounded-xl disabled:opacity-50"
                >
                    {isLoggingOut ? 'Leaving Lounge...' : 'Exit Account'}
                </button>
            </div>
        </div>
    );
}
