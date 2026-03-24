'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useState, useEffect, Suspense } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import RevealOnScroll from '@/components/RevealOnScroll';

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
                const res = await fetch(`/api/main/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);
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
        { name: 'Competitor Spy', href: '/dashboard/spy' },
        { name: 'Team Workspace', href: '/dashboard/team' },
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
        <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 text-gray-900 font-sans selection:bg-purple-600 selection:text-white">

            {/* Premium Sidebar (Desktop) */}
            <aside className="w-72 border-r border-purple-50 hidden lg:flex flex-col sticky top-0 h-screen bg-white shadow-[20px_0_40px_-20px_rgba(168,85,247,0.05)]">
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
                <header className="flex lg:hidden items-center justify-between p-6 border-b border-purple-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/" className="text-3xl font-signature">Eixora.</Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>

                <div className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto min-h-screen">
                    <RevealOnScroll>
                        {children}
                    </RevealOnScroll>
                </div>

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
            <div className="p-8 border-b border-purple-50 flex-shrink-0">
                <Link href="/" className="text-4xl font-signature hover:opacity-70 transition-opacity">
                    Eixora.
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-8">
                {/* Navigation Section */}
                <div className="space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-600/40 mb-2 block">Workspace</span>
                    {navItems.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-all duration-300 rounded-xl ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg shadow-purple-200'
                                    : 'font-medium text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-white' : 'bg-gray-300 group-hover:bg-purple-400'}`}></span>
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

                {/* History Section */}
                <div className="space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-600/40 mb-2 block">Recent History</span>
                    <div className="space-y-2">
                        {sessions && sessions.length > 0 ? (
                            sessions.slice(0, 8).map((session: any) => {
                                const isActive = currentSessionId === session.id;
                                return (
                                    <Link
                                        key={session.id}
                                        href={`/dashboard/analyze?sessionId=${session.id}`}
                                        onClick={onClose}
                                        className={`block px-4 py-3 text-[10px] tracking-wider uppercase truncate rounded-xl transition-all ${isActive
                                            ? 'bg-purple-50 text-purple-600 font-bold border border-purple-100'
                                            : 'text-gray-400 font-medium hover:text-purple-400 hover:bg-purple-50/50'
                                            }`}
                                        title={session.title}
                                    >
                                        {session.title || 'Untitled Session'}
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-[10px] text-gray-300 font-medium uppercase tracking-widest border border-dashed border-gray-100 rounded-xl italic">
                                No sessions yet
                            </div>
                        )}
                    </div>
                </div>
                {/* Elite Support Link 🛡️ */}
                <button
                    onClick={() => { onOpenSupport(); onClose?.(); }}
                    className="w-full group flex items-center gap-3 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-all duration-300 rounded-xl font-medium text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 group-hover:scale-125 transition-transform"></span>
                    <span>Elite Support</span>
                </button>
            </div>

            <div className="p-8 border-t border-purple-50 space-y-6 flex-shrink-0">
                {profile ? (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-serif italic text-lg shadow-md">
                            {profile.full_name ? profile.full_name[0] : 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-widest truncate text-gray-900">{profile.full_name || 'Creator'}</p>
                            <p className="text-[10px] text-purple-600 font-medium uppercase tracking-wider">{profile.plan_type === 'free' || !profile.plan_type ? 'No Paid Plan. Upgrade Bro' : `${profile.plan_type} Plan`}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                            <div className="h-2 w-12 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-3 px-4 border border-purple-100 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl disabled:opacity-50"
                >
                    {isLoggingOut ? 'Signing out...' : 'Logout Account'}
                </button>
            </div>
        </div>
    );
}
