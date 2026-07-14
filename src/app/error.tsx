'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {}, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-slate-500 font-medium">Something went wrong.{' '}
        <button onClick={() => reset()} className="text-lime-600 underline underline-offset-4">Try again</button>
        {' '}or{' '}
        <Link href="/" className="text-lime-600 underline underline-offset-4">go home →</Link>
      </p>
    </div>
  );
}
