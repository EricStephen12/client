'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useState, useEffect, Suspense } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';
import OnboardingFlow from '@/components/OnboardingFlow';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, CreditCard, HelpCircle, LogOut, Plus, Settings2, History } from 'lucide-react';
import { getPlanLimit } from '@/utils/plan';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const { getToken, userId: clerkUserId } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
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
                // Check local storage fallback first
                const localDone = typeof window !== 'undefined' && localStorage.getItem(`eixora_onboarding_done_${userId}`) === 'true';

                const token = await getToken();
                const res = await fetch(`/api/main/api/me?userId=${userId}&email=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || '')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);

                    if (data.onboarding_completed === true) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(`eixora_onboarding_done_${userId}`, 'true');
                        }
                    } else if (data.onboarding_completed === false && !localDone) {
                        setShowOnboarding(true);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };

        if (userId) {
            fetchSessions();
            fetchLatestProfile();
        }

        const handleSessionUpdate = () => {

            fetchSessions();
            fetchLatestProfile();
        };

        const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);

        window.addEventListener('session-updated', handleSessionUpdate);
        window.addEventListener('open-mobile-menu', handleOpenMobileMenu as EventListener);
        return () => {
            window.removeEventListener('session-updated', handleSessionUpdate);
            window.removeEventListener('open-mobile-menu', handleOpenMobileMenu as EventListener);
        };
    }, [userId]);



    const navItems = [
        {
            name: 'Analyze',
            href: '/dashboard/analyze',
            icon: <Sparkles className="w-4 h-4" />,
        },
        {
            name: 'History',
            href: '/dashboard/history',
            icon: <History className="w-4 h-4" />,
        },
        {
            name: 'Billing',
            href: '/dashboard/upgrade',
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: <Settings2 className="w-4 h-4" />,
        },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            window.location.href = '/';
        } catch (e) {
            window.location.href = '/';
        }
    };

    const handleOnboardingComplete = async (data: { niche: string; goal: string; name: string; source: string; lens: string }) => {
        // Immediately persist locally & close UI
        if (typeof window !== 'undefined' && userId) {
            localStorage.setItem(`eixora_onboarding_done_${userId}`, 'true');
        }
        setShowOnboarding(false);

        // (Removed Clerk unsafeMetadata update — migrating fully to Neon Postgres)

        // Persist to Postgres database
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
                    email: user?.primaryEmailAddress?.emailAddress,
                    name: user?.fullName || data.name,
                    onboarding_completed: true,
                    brand_niche: data.niche,
                    primary_goal: data.goal,
                    source: data.source
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setProfileData(updated);
            }
        } catch (err) {
            console.error("Failed to persist onboarding to database:", err);
        }
    };

    const profile = isLoaded && user ? {
        full_name: user.fullName || user.username || 'User',
        email: user.primaryEmailAddress?.emailAddress,
        image: user.imageUrl,
        plan_type: profileData?.plan_type || profileData?.subscription_tier || (user.publicMetadata as any)?.plan_type || 'free'
    } : null;

    const isAnalyzeHome = pathname === '/dashboard/analyze' || pathname === '/dashboard';
    const firstName = user?.firstName || profile?.full_name?.split(' ')[0] || 'there';
    const planType = profileData?.plan_type || profile?.plan_type || 'free';
    const showUpgrade = !planType || planType === 'free' || planType === 'creator';

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-stone-100">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-lime-400 rounded-full animate-spin mx-auto"></div>
                    <p className="text-stone-500 text-sm">Authenticating…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-stone-100 font-sans selection:bg-lime-400 selection:text-slate-950">

<aside className="w-[260px] hidden lg:flex flex-col sticky top-0 h-screen bg-[#0e0e0e]">
                <Suspense fallback={<div className="p-6 w-full h-full bg-[#0e0e0e] animate-pulse" />}>
                    <SidebarContent
                        pathname={pathname}
                        navItems={navItems}
                        handleLogout={handleLogout}
                        isLoggingOut={isLoggingOut}
                        profile={profile}
                        profileData={profileData}
                        sessions={sessions}
                        onOpenSupport={() => setIsSupportOpen(true)}
                    />
                </Suspense>
            </aside>

{isMobileMenuOpen && (
                <div className="fixed inset-0 z-[55] lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0e0e0e] animate-slide-in flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                        <Suspense fallback={<div className="p-6 w-full h-full bg-[#0e0e0e] animate-pulse" />}>
                            <SidebarContent
                                pathname={pathname}
                                navItems={navItems}
                                handleLogout={handleLogout}
                                isLoggingOut={isLoggingOut}
                                onClose={() => setIsMobileMenuOpen(false)}
                                profile={profile}
                                profileData={profileData}
                                sessions={sessions}
                                onOpenSupport={() => setIsSupportOpen(true)}
                            />
                        </Suspense>
                        </div>
                    </aside>
                </div>
            )}
<main className={`flex-1 flex flex-col h-screen relative bg-black ${isAnalyzeHome ? 'overflow-hidden' : 'overflow-auto'}`}>
                {/* Soft center glow — Gemini-style atmosphere */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 55% 45% at 50% 42%, rgba(30,58,95,0.45) 0%, rgba(0,0,0,0) 70%)',
                    }}
                />

                <header id="global-mobile-header" className="relative z-30 flex lg:hidden items-center justify-between px-4 py-3 sticky top-0 bg-black/60 backdrop-blur-md gap-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-9 h-9 rounded-full text-stone-300 hover:bg-white/5 flex items-center justify-center flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {profileData ? (() => {
                        const scans = profileData.monthly_usage?.scans ?? 0;
                        const limit = getPlanLimit(profileData.plan_type || 'free');
                        const remaining = Math.max(0, limit - scans);
                        return (
                            <span className="text-xs text-[#c4c7c5] tabular-nums flex-1 text-center">
                                {remaining}/{limit} credits
                            </span>
                        );
                    })() : (
                        <span className="text-sm font-medium text-stone-200 flex-1 text-center">Eixora</span>
                    )}
                    {showUpgrade ? (
                        <Link href="/dashboard/upgrade" className="px-3 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-semibold flex-shrink-0">
                            Upgrade
                        </Link>
                    ) : (
                        <Link href="/dashboard/history" className="text-xs text-[#c4c7c5] flex-shrink-0 px-2">
                            History
                        </Link>
                    )}
                </header>

                <header id="global-desktop-header" className="relative z-30 hidden lg:flex items-center justify-end gap-3 px-6 py-4 sticky top-0">
                    {profileData && (() => {
                        const scans = profileData.monthly_usage?.scans ?? 0;
                        const limit = getPlanLimit(profileData.plan_type || 'free');
                        const remaining = Math.max(0, limit - scans);
                        const pct = limit > 0 ? Math.min((scans / limit) * 100, 100) : 0;
                        const isHigh = pct > 80;
                        return (
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium border tabular-nums ${
                                    isHigh
                                        ? 'border-red-400/30 bg-red-500/10 text-red-300'
                                        : 'border-white/10 bg-white/[0.06] text-[#e3e3e3]'
                                }`}
                                title={`${scans} used · ${remaining} left this period`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-red-400' : 'bg-lime-400'}`} />
                                {remaining} / {limit} credits
                            </div>
                        );
                    })()}
                    {showUpgrade && (
                        <Link
                            href="/dashboard/upgrade"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 text-sm font-semibold transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Upgrade
                        </Link>
                    )}
                </header>

                <div
                    className={`relative z-10 flex-1 w-full min-h-0 ${
                        isAnalyzeHome
                            ? 'flex flex-col'
                            : 'p-6 md:p-10 lg:px-14 lg:py-8 max-w-[1400px] mx-auto'
                    }`}
                    data-greeting-name={firstName}
                >
                    <RevealOnScroll className={isAnalyzeHome ? 'flex-1 flex flex-col min-h-0 h-full' : undefined}>
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-[#121816] w-full max-w-lg rounded-[2rem] relative overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-8 sm:p-10">
                    {sent ? (
                        <div className="text-center space-y-6 py-12">
                            <div className="w-24 h-24 bg-lime-400/10 text-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-lime-400/20">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-3xl font-serif italic text-stone-50">Message Transmitted.</h2>
                            <p className="text-stone-500 text-sm font-medium">Our support team has received your signal. Expect a response in your inbox soon.</p>
                            <button onClick={onClose} className="mt-8 w-full py-4 bg-lime-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-300 transition-all">Close Relay</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-400 italic">Concierge</span>
                                    <h2 className="text-3xl sm:text-4xl font-serif text-stone-50 leading-tight tracking-tight">Direct Support.</h2>
                                </div>
                                <button type="button" onClick={onClose} className="w-10 h-10 bg-white/5 text-stone-400 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-stone-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-stone-500 text-xs sm:text-sm font-medium leading-relaxed">Direct line to the Eixora team. Report issues, request features, or ask for strategy advice.</p>
                            
                            <div className="bg-white/[0.03] rounded-2xl p-5 flex items-center justify-between border border-white/10 group hover:border-lime-400/30 transition-colors">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-100 mb-1">Need immediate help?</h4>
                                    <p className="text-xs text-stone-500 font-medium">Email us at <a href="mailto:hello@eixora.store" className="text-lime-400 hover:text-lime-300 transition-colors">hello@eixora.store</a></p>
                                </div>
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-stone-500 group-hover:text-lime-400 group-hover:scale-110 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-stone-500 ml-1">Subject of Inquiry</label>
                                    <input
                                        required
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Brief summary..."
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/40 transition-all font-medium text-stone-100 placeholder-stone-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-stone-500 ml-1">Message Details</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="How can our team help you succeed today?"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/40 transition-all font-medium text-stone-100 placeholder-stone-600 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-lime-400 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-lime-300 transition-all disabled:opacity-50 active:scale-95"
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

function SidebarContent({ pathname, navItems, handleLogout, isLoggingOut, onClose, profile, profileData, sessions, onOpenSupport }: any) {
    const searchParams = useSearchParams();
    const used = profileData?.monthly_usage?.scans ?? profile?.monthly_usage?.scans ?? 0;
    const limit = getPlanLimit(profileData?.plan_type || profile?.plan_type || 'free');
    const remaining = Math.max(0, limit - used);
    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#0e0e0e] text-[#e3e3e3]">
            <div className="px-3 pt-4 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between px-2 mb-3">
                    <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        </div>
                        <span className="text-[15px] font-medium text-white tracking-tight">Eixora</span>
                    </Link>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:bg-white/5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                <Link
                    href="/dashboard/analyze"
                    onClick={() => {
                        onClose?.();
                        window.dispatchEvent(new CustomEvent('new-scan'));
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full text-[14px] text-[#e3e3e3] hover:bg-white/[0.06] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New scan
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col px-2 pb-3 min-h-0">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-full transition-colors ${
                                isActive
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-[#c4c7c5] hover:bg-white/[0.06] hover:text-white'
                            }`}
                        >
                            <span className="flex-shrink-0 opacity-90">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={() => { onOpenSupport(); onClose?.(); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-full text-[#c4c7c5] hover:bg-white/[0.06] hover:text-white w-full text-left transition-colors"
                >
                    <HelpCircle className="w-4 h-4" />
                    Help & support
                </button>

                {sessions && sessions.length > 0 && (
                    <>
                        <p className="text-[12px] text-[#8e918f] px-3 pt-5 pb-1.5">Recents</p>
                        {sessions.slice(0, 10).map((s: any) => {
                            const title = s.title || s.video_url || 'Untitled scan';
                            const displayTitle = title.length > 32 ? `${title.slice(0, 32)}…` : title;
                            const isActive = searchParams.get('sessionId') === s.id;
                            return (
                                <Link
                                    key={s.id}
                                    href={`/dashboard/analyze?sessionId=${s.id}`}
                                    onClick={onClose}
                                    className={`block px-3 py-2 rounded-full text-[13px] truncate transition-colors ${
                                        isActive
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-[#c4c7c5] hover:bg-white/[0.06] hover:text-white'
                                    }`}
                                >
                                    {displayTitle}
                                </Link>
                            );
                        })}
                    </>
                )}
            </div>

            <div className="px-3 pb-3 pt-1 flex-shrink-0 space-y-2">
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#8e918f]">Credits</span>
                        <span className="text-white font-medium tabular-nums">{remaining} left</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : 'bg-lime-400'}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-[#8e918f] tabular-nums">{used} / {limit} used</p>
                </div>

                {profile ? (
                    <div className="flex items-center gap-3 px-1 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors">
                        {profile.image ? (
                            <img src={profile.image} alt={profile.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center font-semibold text-xs">
                                {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate text-white">{profile.full_name || 'User'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e918f] hover:text-white hover:bg-white/5"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-2 py-2 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="h-3 w-24 bg-white/10 rounded" />
                    </div>
                )}
            </div>
        </div>
    );
}
