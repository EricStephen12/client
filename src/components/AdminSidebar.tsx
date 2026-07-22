'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Hourglass, Users, LifeBuoy, Zap, ChevronRight } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Waitlist', href: '/admin/waitlist', icon: Hourglass },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Support', href: '/admin/support', icon: LifeBuoy },
    ];

    return (
        <aside className="w-[260px] bg-[#0A0A0A] h-screen sticky top-0 flex flex-col hidden md:flex relative overflow-hidden">
            {/* Subtle gradient glow at top */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-lime-500/5 to-transparent pointer-events-none" />

            {/* Logo */}
            <div className="p-6 pb-4 relative z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <img src="/app-icon.png" alt="Eixora" className="w-9 h-9 rounded-xl shadow-lg ring-1 ring-white/10" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-500 rounded-full border-2 border-[#0A0A0A]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif font-bold text-lg tracking-tight text-white leading-none">Eixora</span>
                        <span className="text-lime-400 font-sans text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Command Center</span>
                    </div>
                </Link>
            </div>

            {/* Divider with glow */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-6 space-y-1 relative z-10">
                <div className="px-3 pb-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Navigation</span>
                </div>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative ${
                                isActive 
                                ? 'bg-gradient-to-r from-lime-500/15 to-lime-500/5 text-white' 
                                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-lime-400 rounded-r-full shadow-[0_0_12px_rgba(163,230,53,0.5)]" />
                            )}
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                                isActive 
                                ? 'bg-lime-500/20 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.15)]' 
                                : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/5'
                            }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="flex-1">{link.name}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-lime-400/60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 space-y-3 relative z-10">
                {/* System Status Card */}
                <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl p-4 border border-white/[0.06] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-lime-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center justify-between mb-2 relative">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-lime-400" />
                            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">System Status</p>
                        </div>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500"></span>
                        </span>
                    </div>
                    <span className="text-xs font-medium text-slate-300">All Systems Operational</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* User Profile */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-semibold text-white truncate">Admin</span>
                        <span className="text-[10px] text-slate-500 truncate">Manage settings</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
