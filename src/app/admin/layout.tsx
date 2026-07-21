'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Search, Bell } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            <AdminSidebar />
            <main className="flex-1 overflow-auto flex flex-col h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium capitalize">
                        <span>Admin</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900">{pathname.split('/').pop() || 'Overview'}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search users, ads..." 
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-64 transition-all"
                            />
                        </div>
                        <button className="relative text-slate-400 hover:text-slate-900 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime-500 border-2 border-white rounded-full"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
