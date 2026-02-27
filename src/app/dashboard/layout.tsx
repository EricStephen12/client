'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Overview', href: '/dashboard' },
        { name: 'Intelligence Studio', href: '/dashboard/analyze' },
        { name: 'Settings', href: '/dashboard/settings' },
    ];


    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut({ callbackUrl: '/' });
    };

    const profile = session?.user ? {
        full_name: session.user.name || session.user.email?.split('@')[0] || 'Creator',
        email: session.user.email,
        image: session.user.image,
        plan_type: (session.user as any).subscription_tier || 'Free'
    } : null;

    if (status === 'loading') {
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
                <SidebarContent
                    pathname={pathname}
                    navItems={navItems}
                    handleLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                    profile={profile}
                />
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
                        <SidebarContent
                            pathname={pathname}
                            navItems={navItems}
                            handleLogout={handleLogout}
                            isLoggingOut={isLoggingOut}
                            onClose={() => setIsMobileMenuOpen(false)}
                            profile={profile}
                        />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="flex lg:hidden items-center justify-between p-6 border-b border-purple-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/" className="text-2xl font-serif font-bold tracking-tighter">Socially.</Link>
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
            </main>
        </div>
    );
}

function SidebarContent({ pathname, navItems, handleLogout, isLoggingOut, onClose, profile }: any) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-8 border-b border-purple-50">
                <Link href="/" className="text-3xl font-serif font-bold tracking-tighter hover:opacity-70 transition-opacity">
                    Socially.
                </Link>
            </div>

            <nav className="flex-1 flex flex-col p-8 space-y-4">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-600/40 mb-2">Workspace</span>
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
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8 border-t border-purple-50 space-y-6">
                {profile ? (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-serif italic text-lg shadow-md">
                            {profile.full_name ? profile.full_name[0] : 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-widest truncate text-gray-900">{profile.full_name || 'Creator'}</p>
                            <p className="text-[10px] text-purple-600 font-medium uppercase tracking-wider">{profile.plan_type || 'Free'} Plan</p>
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

// Minimal Reveal wrapper if not already imported or available
function RevealOnScrollWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="animate-fade-in-up">
            {children}
        </div>
    );
}
