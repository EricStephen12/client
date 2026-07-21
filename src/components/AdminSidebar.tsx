'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Hourglass, Users, LifeBuoy, Activity } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Waitlist', href: '/admin/waitlist', icon: Hourglass },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Support', href: '/admin/support', icon: LifeBuoy },
    ];

    return (
        <aside className="w-64 bg-[#0A0A0A] border-r border-slate-800 h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/app-icon.png" alt="Eixora" className="w-8 h-8 rounded-lg shadow-sm" />
                    <span className="font-serif font-bold text-xl tracking-tight text-white">Eixora <span className="text-lime-400 font-sans text-[10px] font-black uppercase tracking-widest ml-1 bg-lime-400/10 px-2 py-0.5 rounded-full">Admin</span></span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6">
                <div className="px-4 pb-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</span>
                </div>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                isActive 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-500'}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</p>
                        <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-lime-500" />
                        <span className="text-xs font-medium text-slate-300">All Systems Operational</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2">
                    <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Admin Account</span>
                        <span className="text-[10px] text-slate-500">Manage settings</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
