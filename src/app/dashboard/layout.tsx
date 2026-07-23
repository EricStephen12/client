'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useState, useEffect, Suspense } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';
import OnboardingFlow from '@/components/OnboardingFlow';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sparkles, CreditCard, HelpCircle, Bell, ChevronRight, LogOut } from 'lucide-react';
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
            name: 'Dashboard', 
            href: '/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />
        },
        { 
            name: 'Lounge', 
            href: '/dashboard/analyze',
            icon: <Sparkles className="w-4 h-4" />
        },
        { 
            name: 'Billing & Plans', 
            href: '/dashboard/upgrade',
            icon: <CreditCard className="w-4 h-4" />
        }
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

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-gray-900">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-lime-100 border-t-lime-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 font-serif italic text-lg">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-lime-100 selection:text-lime-900">

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
                    <div className="absolute inset-0 bg-lime-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-slide-in flex flex-col">
                            {/* Header removed from here to reduce duplicate logos */}
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
                <header id="global-mobile-header" className="flex lg:hidden items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <Link href="/" className="text-2xl font-serif font-bold italic">Eixora<span className="text-lime-600">.</span></Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center hover:bg-lime-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>

                <header id="global-desktop-header" className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/70 backdrop-blur-2xl sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm font-medium">Eixora</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-900 font-semibold text-sm">{navItems.find((i: any) => i.href === pathname)?.name || 'Dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {profileData && (() => {
                            const scans = profileData.monthly_usage?.scans ?? 0;
                            const limit = getPlanLimit(profileData.plan_type || 'free');
                            const pct = limit > 0 ? Math.min((scans / limit) * 100, 100) : 0;
                            const isHigh = pct > 80;
                            return (
                                <div className={`flex items-center gap-3 border rounded-full px-4 py-2 text-xs font-bold shadow-sm cursor-default transition-all hover:scale-105 ${
                                    isHigh
                                        ? 'bg-red-50/80 border-red-200 text-red-700'
                                        : 'bg-lime-50/80 border-lime-200 text-lime-700'
                                }`}>
                                    <div className="relative w-4 h-4">
                                        <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                                            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5"/>
                                            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.5"
                                                strokeDasharray={`${2 * Math.PI * 6}`}
                                                strokeDashoffset={`${2 * Math.PI * 6 * (1 - pct / 100)}`}
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                            />
                                        </svg>
                                    </div>
                                    <span>{scans} / {limit} Scans</span>
                                </div>
                            );
                        })()}

                        <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-full">
                            <Bell className="w-4.5 h-4.5" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-lime-500 rounded-full"></span>
                        </button>
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

                {/* ── Floating bottom tab bar ── */}
                {!isMobileMenuOpen && (
                    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl shadow-slate-950/15 px-2 py-2">
                            {navItems.slice(0, 3).map((item: any) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                                            isActive
                                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                                            isActive ? 'text-white' : 'text-slate-400'
                                        }`}>{item.name.split(' ')[0]}</span>
                                    </Link>
                                );
                            })}
                            {/* Divider */}
                            <div className="w-px h-8 bg-slate-100 mx-1" />
                            <button
                                onClick={() => setIsSupportOpen(true)}
                                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-wider leading-none">Help</span>
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                <span className="text-[9px] font-black uppercase tracking-wider leading-none">More</span>
                            </button>
                        </div>
                    </div>
                )}
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
                            <button onClick={onClose} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-600 transition-all shadow-xl">Close Relay</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-600 italic">Concierge</span>
                                    <h2 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 leading-tight tracking-tight">Direct Support.</h2>
                                </div>
                                <button type="button" onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">Direct line to the Eixora team. Report issues, request features, or ask for strategy advice.</p>
                            
                            <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 group hover:border-lime-200 transition-colors">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-1">Need immediate help?</h4>
                                    <p className="text-xs text-slate-500 font-medium">Email us at <a href="mailto:hello@eixora.store" className="text-lime-600 hover:text-lime-800 transition-colors">hello@eixora.store</a></p>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-lime-600 group-hover:scale-110 transition-all shadow-sm">
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
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all font-medium text-slate-900 placeholder-slate-400"
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
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all font-medium text-slate-900 placeholder-slate-400 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-950/10 hover:bg-lime-500 hover:text-slate-950 transition-all disabled:opacity-50 active:scale-95"
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

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">

            {/* ── Logo strip ── */}
            <div className="px-6 pt-7 pb-5 flex-shrink-0 flex items-center justify-between">
                <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center shadow-sm group-hover:bg-lime-500 transition-colors duration-200">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-lg font-serif font-bold italic tracking-tight text-slate-900">
                        Eixora<span className="text-lime-500">.</span>
                    </span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* ── Nav ── */}
            <div className="flex-1 overflow-y-auto flex flex-col px-3 pb-4 space-y-0.5 min-h-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 pb-2 pt-1">Menu</p>

                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 rounded-xl ${
                                isActive
                                    ? 'bg-slate-950 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            } ${item.id || ''}`}
                        >
                            <span className={`flex-shrink-0 transition-all ${
                                isActive ? 'text-lime-400' : 'text-slate-400 group-hover:text-slate-600'
                            }`}>
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.name}</span>
                            {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 flex-shrink-0" />
                            )}
                            {item.comingSoon && (
                                <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full tracking-normal">soon</span>
                            )}
                        </Link>
                    );
                })}

                {/* Divider */}
                <div className="pt-3 pb-1">
                    <div className="h-px bg-slate-100" />
                </div>

                <button
                    onClick={() => { onOpenSupport(); onClose?.(); }}
                    className="tour-support group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 w-full text-left"
                >
                    <span className="text-slate-400 group-hover:text-slate-600 flex-shrink-0">
                        <HelpCircle className="w-4 h-4" />
                    </span>
                    <span>Help & Support</span>
                </button>
            </div>

            {/* ── Scan usage card ── */}
            {profile && (
                <div className="px-4 pb-3 flex-shrink-0">
                    <ScanUsageBar profile={profile} />
                </div>
            )}

            {/* ── Profile footer ── */}
            <div className="px-3 pb-4 pt-2 border-t border-slate-100 flex-shrink-0">
                {profile ? (
                    <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                        <div className="flex items-center gap-3 min-w-0">
                            {profile.image ? (
                                <img
                                    src={profile.image}
                                    alt={profile.full_name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                                    {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-slate-900 leading-tight">{profile.full_name || 'User'}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-lime-600 leading-tight mt-0.5">{
                                    !profile.plan_type || profile.plan_type === 'free' ? 'Free' :
                                    profile.plan_type === 'creator' ? 'Creator' :
                                    'Studio'
                                }</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-2.5 w-24 bg-slate-100 rounded" />
                            <div className="h-2 w-14 bg-slate-100 rounded" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ScanUsageBar({ profile }: { profile: any }) {
    const used   = profile?.monthly_usage?.scans ?? profile?.scan_count ?? 0;
    const limit  = getPlanLimit(profile?.plan_type || 'free');
    const pct    = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const isHigh = pct > 80;
    const isMid  = pct > 50;
    const planLabel =
        !profile?.plan_type || profile.plan_type === 'free' ? 'Free Trial'
        : profile.plan_type === 'creator' ? 'Creator'
        : 'Studio';

    return (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scan Usage</p>
                    <p className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                        {used} <span className="text-slate-400 font-normal text-sm">/ {limit}</span>
                    </p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    isHigh ? 'bg-red-100 text-red-600' : 'bg-lime-100 text-lime-700'
                }`}>{planLabel}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${
                        isHigh ? 'bg-red-500' : isMid ? 'bg-amber-500' : 'bg-lime-500'
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
                {Math.max(0, limit - used)} scan{limit - used !== 1 ? 's' : ''} remaining this period
            </p>
        </div>
    );
}
