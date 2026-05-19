'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompetitorSpyPage() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
    );
}
