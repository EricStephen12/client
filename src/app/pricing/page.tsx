import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] text-[#1c1917] font-sans selection:bg-purple-100">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-purple-200">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-3xl font-signature">
                        Eixora.
                    </Link>
                    <div className="flex gap-12 text-xs font-medium tracking-[0.2em] uppercase">
                        <Link href="/" className="hover:underline">Home</Link>
                        <Link href="/login" className="hover:underline">Sign In</Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-48 pb-32">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <RevealOnScroll>
                            <h1 className="text-7xl md:text-9xl font-serif mb-12 tracking-tighter italic">The <br />Investment.</h1>
                            <p className="text-xl md:text-2xl font-light leading-relaxed mb-12 max-w-md opacity-80">
                                Founding member access to the most advanced AI creative laboratory for dropshippers.
                            </p>
                        </RevealOnScroll>

                        <div className="space-y-12">
                            <RevealOnScroll delay={200}>
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600">The Offer</span>
                                    <p className="text-4xl md:text-5xl font-serif italic text-balance">Become a founding architect of the attention economy.</p>
                                </div>
                            </RevealOnScroll>

                            <RevealOnScroll delay={300}>
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-purple-200">
                                    {[
                                        { l: "AI Analysis", r: "UNLIMITED" },
                                        { l: "DNA Extraction", r: "INFINITE" },
                                        { l: "Script Engine", r: "PRO LEVEL" },
                                        { l: "Support", r: "ELITE" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-widest opacity-40">{item.l}</span>
                                            <span className="text-sm font-bold uppercase tracking-widest">{item.r}</span>
                                        </div>
                                    ))}
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>

                    <div className="relative">
                        <RevealOnScroll delay={400}>
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white border border-purple-100 p-12 md:p-24 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full">FOUNDING PLAN</span>
                                    </div>

                                    <div className="mb-16">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-7xl md:text-8xl font-serif tracking-tighter">$9.99</span>
                                            <span className="text-xl font-light opacity-50 italic">/month</span>
                                        </div>
                                        <p className="text-xs tracking-[0.3em] uppercase opacity-40">Lifetime founding rate • Billed monthly</p>
                                    </div>

                                    <div className="space-y-8 mb-16">
                                        {[
                                            "Unlimited Creative Analysis",
                                            "Deep Video DNA Extraction",
                                            "Full-Stack Viral Script Engine",
                                            "Priority Feature Access",
                                            "1-Click Boardroom Reports"
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-6 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 transition-all group-hover/item:w-8"></div>
                                                <span className="text-sm md:text-base font-light tracking-wide">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/signup"
                                        className="block w-full py-8 bg-black text-white text-xs font-bold tracking-[0.5em] uppercase hover:bg-purple-900 transition-all transform hover:-translate-y-1 rounded-sm shadow-2xl text-center"
                                    >
                                        Secure Founding Spot
                                    </Link>

                                    <div className="mt-12 text-center">
                                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 leading-loose">
                                            Limited to the first 100 members <br />
                                            Beta testing phase access included
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="border-t border-purple-100 py-16 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-2xl font-signature italic opacity-80">Eixora.</div>
                    <div className="flex flex-wrap justify-center gap-12 text-[10px] tracking-[0.3em] uppercase opacity-40">
                        <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
                        <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
                        <Link href="/refund" className="hover:opacity-100 transition-opacity">Refunds</Link>
                        <a href="mailto:support@eixora.com" className="hover:opacity-100 transition-opacity">Support</a>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-20">&copy; 2026 EXRICX</p>
                </div>
            </footer>
        </div>
    );
}
