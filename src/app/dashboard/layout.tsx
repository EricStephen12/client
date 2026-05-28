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

if (data.onboarding_completed === false) {
                        setShowOnboarding(true);
                    }
                }
            } catch (err) {

            }
        };

const masterToken = localStorage.getItem('admin_token');
        if (masterToken) setIsAdminMaster(true);

        if (userId) {
            fetchSessions();
            fetchLatestProfile();
        }

        const handleSessionUpdate = () => {

            fetchSessions();
            fetchLatestProfile();
        };

        window.addEventListener('session-updated', handleSessionUpdate);
        return () => window.removeEventListener('session-updated', handleSessionUpdate);
    }, [userId]);



    const navItems = [
        { 
            name: 'Dashboard', 
            href: '/dashboard',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            )
        },
        { 
            name: 'Analyze Video', 
            href: '/dashboard/analyze',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        { 
            name: 'Scan History', 
            href: '/dashboard/history',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        { 
            name: 'Batch Analysis', 
            href: '/dashboard/batch',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        { 
            name: 'Billing & Plans', 
            href: '/dashboard/upgrade',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
            )
        },
        { 
            name: 'Settings', 
            href: '/dashboard/settings',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
    ];

const isAdmin = (user?.publicMetadata as any)?.is_admin || profileData?.is_admin || isAdminMaster;
    if (isAdmin) {
        navItems.push({ 
            name: 'Admin Hub', 
            href: '/dashboard/admin',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        });
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            localStorage.removeItem('admin_token'); // Purge Elite Session 🚀
            fetch('/api/main/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
            await signOut();
            window.location.href = '/';
        } catch (e) {
            window.location.href = '/';
        }
    };

    const handleOnboardingComplete = async (data: { niche: string; goal: string; source: string }) => {
        try {
            const token = await getToken();
            const res = await fetch('/api/main/api/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    onboarding_completed: true,
                    brand_niche: data.niche,
                    primary_goal: data.goal,
                    source: data.source
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setProfileData(updated);
                setShowOnboarding(false);
            }
        } catch (err) {

        }
    };

    const profile = isLoaded && user ? {
        full_name: user.fullName || user.username || 'User',
        email: user.primaryEmailAddress?.emailAddress,
        image: user.imageUrl,
        plan_type: profileData?.plan_type || profileData?.subscription_tier || (user.publicMetadata as any)?.plan_type || 'free'
    } : null;

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-gray-900">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 font-serif italic text-lg">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">

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

{isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-slide-in flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                            <Link href="/" className="text-2xl font-serif font-bold italic" onClick={() => setIsMobileMenuOpen(false)}>
                                Eixora<span className="text-purple-600">.</span>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
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
                        </div>
                    </aside>
                </div>
            )}
<main className="flex-1 overflow-auto flex flex-col h-screen relative pb-20 lg:pb-0">
                <header className="flex lg:hidden items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <Link href="/" className="text-2xl font-serif font-bold italic">Eixora<span className="text-purple-600">.</span></Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>

                <header className="hidden lg:flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="text-slate-900 font-semibold text-lg">{navItems.find(i => i.href === pathname)?.name || 'Dashboard'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {profileData && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span>Scans: {profileData.scan_count || 0} / {profileData.scan_limit || 10}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto flex-1 w-full">
                    <RevealOnScroll>
                        {children}
                    </RevealOnScroll>
                </div>

                <AnimatePresence>
                    {showOnboarding && (
                        <OnboardingFlow 
                            userName={user?.firstName || 'User'} 
                            onComplete={handleOnboardingComplete} 
                        />
                    )}
                </AnimatePresence>

                <SupportModal
                    isOpen={isSupportOpen}
                    onClose={() => setIsSupportOpen(false)}
                    userAddress={user?.primaryEmailAddress?.emailAddress}
                    userId={user?.id}
                />

                <button
                    onClick={() => setIsSupportOpen(true)}
                    className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 lg:hidden w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>

                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-4 z-50 flex justify-around items-center px-2 py-3 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                    {navItems.slice(0, 3).map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400 hover:text-slate-900'}`}>
                                <span className={`${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                                <span className="text-[10px] mt-1.5 font-medium">{item.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="text-[10px] mt-1.5 font-medium">More</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex flex-col items-center p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-[10px] mt-1.5 font-medium">{isLoggingOut ? '...' : 'Sign Out'}</span>
                    </button>
                </div>
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

        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-6">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-8 sm:p-10">
                    {sent ? (
                        <div className="text-center space-y-6 py-12">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-3xl font-serif italic text-slate-900">Message Transmitted.</h2>
                            <p className="text-slate-400 text-sm font-medium">Our support team has received your signal. Expect a response in your inbox soon.</p>
                            <button onClick={onClose} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl">Close Relay</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 italic">Concierge</span>
                                    <h2 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 leading-tight tracking-tight">Direct Support.</h2>
                                </div>
                                <button type="button" onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">Direct line to the Eixora team. Report issues, request features, or ask for strategy advice.</p>
                            
                            <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 group hover:border-purple-200 transition-colors">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-1">Need immediate help?</h4>
                                    <p className="text-xs text-slate-500 font-medium">Email us at <a href="mailto:hello@eixora.store" className="text-purple-600 hover:text-purple-800 transition-colors">hello@eixora.store</a></p>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-purple-600 group-hover:scale-110 transition-all shadow-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 ml-1">Subject of Inquiry</label>
                                    <input
                                        required
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Brief summary..."
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 ml-1">Message Details</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="How can our team help you succeed today?"
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-900 placeholder-slate-400 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-indigo-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-950/10 hover:bg-purple-500 hover:text-slate-950 transition-all disabled:opacity-50 active:scale-95"
                            >
                                {sending ? 'Transmitting...' : 'Send Priority Message'}
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
                    Eixora<span className="text-purple-600">.</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-10 min-h-0">

                <div className="space-y-4">
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3 block">Workspace</span>
                    {navItems.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl ${isActive
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10 font-semibold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'
                                    } ${item.id || ''}`}
                            >
                                <span className={`transition-all ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-purple-500 group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <div className="flex items-center justify-between w-full">
                                    <span>{item.name}</span>
                                    {item.comingSoon && (
                                        <span className="text-[8px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full tracking-normal lowercase">soon</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <button
                    onClick={() => { onOpenSupport(); onClose?.(); }}
                    className="w-full tour-support group flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                >
                    <span className="text-slate-400 group-hover:text-purple-600 group-hover:scale-110 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </span>
                    <span>Help & Support</span>
                </button>
            </div>

            <div className="p-8 border-t border-slate-100 space-y-6 flex-shrink-0 bg-slate-50/50">
                {profile ? (
                    <div className="flex items-center gap-4">
                        {profile.image ? (
                            <img src={profile.image} alt={profile.full_name} className="w-10 h-10 rounded-full border border-slate-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-950 to-purple-950 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                {profile.full_name ? profile.full_name[0] : 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-slate-900">{profile.full_name || 'User'}</p>
                            <p className="text-xs text-purple-600 font-medium tracking-wide">{
                                !profile.plan_type || profile.plan_type === 'free' ? 'Free Trial' :
                                profile.plan_type === 'creator' ? 'Creator Plan' :
                                (profile.plan_type === 'studio' || profile.plan_type === 'agency') ? 'Studio Plan' :
                                'Premium Member'
                            }</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-3 px-4 border border-slate-200 text-xs font-semibold text-slate-400 hover:border-purple-200 hover:text-purple-600 hover:bg-white transition-all rounded-xl disabled:opacity-50"
                >
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
            </div>
        </div>
    );
}
