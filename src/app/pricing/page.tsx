import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import CheckoutButton from "@/components/CheckoutButton";

export default function PricingPage() {
    const foundingUrl = process.env.NEXT_PUBLIC_GUMROAD_FOUNDING_URL || 'https://eixora.gumroad.com/l/foundingplan';
    const agencyUrl = process.env.NEXT_PUBLIC_GUMROAD_AGENCY_URL || 'https://eixora.gumroad.com/l/agencyplan';

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

            <main className="max-w-6xl mx-auto px-6 pt-40 pb-32">
                <div className="text-center mb-20">
                    <RevealOnScroll>
                        <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight italic">Free Beta <span className="text-purple-600">Access.</span></h1>
                        <p className="text-lg md:text-xl font-light opacity-60 max-w-lg mx-auto leading-relaxed">
                            Eixora is currently in exclusive early access. All premium Ad DNA tools are unlocked for early adopters.
                        </p>
                    </RevealOnScroll>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {/* Free Tier */}
                    <RevealOnScroll delay={50}>
                        <div className="relative bg-white border border-gray-200 p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
                            <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full mb-6 inline-block">FREE PLAN</span>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-6xl font-serif tracking-tighter">$0</span>
                                    <span className="text-lg font-light opacity-40 italic">/forever</span>
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">No credit card required</p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {[
                                    "3 DNA Extractions / Month",
                                    "3 Strategy Lounge Sessions / Month",
                                    "Intelligence Studio",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-light text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className="block w-full py-6 border-2 border-gray-200 text-gray-600 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-gray-50 transition-all rounded-sm text-center"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Founding Tier */}
                    <RevealOnScroll delay={150}>
                        <div className="relative bg-white border border-purple-100 p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                            <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full mb-6 inline-block">FOUNDING PLAN</span>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-6xl font-serif tracking-tighter">$9.99</span>
                                    <span className="text-lg font-light opacity-40 italic">/month</span>
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Early adopter pricing — locked in forever</p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {[
                                    "Unlimited DNA Extractions",
                                    "Unlimited Strategy Lounge Sessions",
                                    "Intelligence Studio",
                                    "Email Support"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-light text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className="block w-full py-6 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-purple-900 transition-all rounded-sm shadow-lg text-center"
                            >
                                Start Free Now
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Agency Tier */}
                    <RevealOnScroll delay={250}>
                        <div className="relative bg-white border-2 border-purple-600 p-10 rounded-2xl shadow-2xl transition-all overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 right-0 p-6">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-600 underline underline-offset-4">MOST POWERFUL</span>
                            </div>

                            <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-black text-white px-4 py-1.5 rounded-full mb-6 inline-block">AGENCY PLAN</span>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-6xl font-serif tracking-tighter">$29.99</span>
                                    <span className="text-lg font-light opacity-40 italic">/month</span>
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Scale your ad intelligence</p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {[
                                    "Everything in Founding",
                                    "Competitor Spy",
                                    "Batch URL Processing (10 Videos at Once)",
                                    "Priority Support"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-light text-gray-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className="block w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:scale-[1.02] transition-all rounded-sm shadow-xl text-center"
                            >
                                Get Full Access
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>

                <div className="mt-20 text-center opacity-40">
                    <p className="text-[10px] tracking-[0.3em] uppercase leading-loose">
                        Early Access Beta • No Credit Card Required • Completely Free
                    </p>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="border-t border-purple-100 py-16 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-2xl font-signature italic opacity-80">Eixora by EXRICX.</div>
                    <div className="flex flex-wrap justify-center gap-12 text-[10px] tracking-[0.3em] uppercase opacity-40">
                        <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
                        <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
                        <Link href="/refund" className="hover:opacity-100 transition-opacity">Refunds</Link>
                        <a href="mailto:support@eixora.store" className="hover:opacity-100 transition-opacity">Support</a>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-20">&copy; 2026 EIXORA BY EXRICX</p>
                </div>
            </footer>
        </div>
    );
}
