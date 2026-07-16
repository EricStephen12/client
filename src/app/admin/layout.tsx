'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

const ADMIN_EMAILS = ['deamirclothingstores@gmail.com', 'hello@eixora.store'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
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
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
