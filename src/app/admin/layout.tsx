'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Search, Bell, Command } from 'lucide-react';
import { usePathname } from 'next/navigation';

const ADMIN_EMAILS = ['deamirclothingstores@gmail.com', 'hello@eixora.store'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            if (!user) {
                router.push('/login');
                return;
            }

            const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
            if (primaryEmail && ADMIN_EMAILS.includes(primaryEmail)) {
                setAuthorized(true);
            } else {
                router.push('/dashboard');
            }
        }
    }, [isLoaded, user, router]);

    if (!isLoaded || !authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">Loading Command Center</span>
                </div>
            </div>
        );
    }

    const pageName = pathname.split('/').pop() || 'overview';
    const pageLabel = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    return (
        <div className="min-h-screen bg-[#F5F5F4] flex">
            <AdminSidebar />
            <main className="flex-1 overflow-auto flex flex-col h-screen relative">
                {/* Subtle dot pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* Top Header */}
                <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-slate-400">Admin</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold">{pageLabel}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-slate-900" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-200 focus:shadow-sm w-56 transition-all placeholder:text-slate-400"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded text-[10px] font-medium text-slate-400 border border-slate-200 shadow-sm">
                                <Command className="w-2.5 h-2.5" />K
                            </kbd>
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lime-500 rounded-full border-[1.5px] border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto w-full relative z-[1] flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
