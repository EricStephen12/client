'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/admin', icon: '📊' },
        { name: 'Waitlist', href: '/admin/waitlist', icon: '⏳' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Support', href: '/admin/support', icon: '🎫' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/app-icon.png" alt="Eixora" className="w-8 h-8 rounded-xl" />
                    <span className="font-serif font-bold text-xl tracking-tight">Eixora <span className="text-lime-500 font-sans text-xs uppercase tracking-widest ml-1">Admin</span></span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                isActive 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-lime-50 rounded-xl p-4 border border-lime-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-lime-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-700">Systems Operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
