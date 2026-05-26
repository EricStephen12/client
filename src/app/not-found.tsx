'use client';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-6 text-center">
            <span className="text-5xl">🎬</span>
            <p className="text-slate-500 font-medium">This page doesn't exist. <Link href="/" className="text-purple-600 underline underline-offset-4">Go home →</Link></p>
        </div>
    );
}
