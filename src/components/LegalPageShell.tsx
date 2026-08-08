import Link from 'next/link';

interface LegalPageShellProps {
    title: string;
    updated: string;
    children: React.ReactNode;
}

export default function LegalPageShell({ title, updated, children }: LegalPageShellProps) {
    return (
        <div className="min-h-screen bg-black text-stone-100 selection:bg-lime-400 selection:text-slate-950">
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-[15px] font-semibold tracking-[0.14em] text-white">
                        EIXORA
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-stone-500 hover:text-lime-300 transition-colors"
                    >
                        Back to home
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-24">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-4">
                    {title}
                </h1>
                <p className="text-[11px] tracking-[0.25em] uppercase text-stone-500 mb-14">
                    Last updated: {updated}
                </p>
                <article className="space-y-10 text-stone-400 font-light leading-relaxed text-[15px] sm:text-base">
                    {children}
                </article>
            </main>

            <footer className="border-t border-white/[0.06] py-10 px-5 text-center text-[11px] tracking-widest uppercase text-stone-600">
                © 2026 Eixora
            </footer>
        </div>
    );
}
