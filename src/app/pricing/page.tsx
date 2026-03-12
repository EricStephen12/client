import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import CheckoutButton from "@/components/CheckoutButton";

export default function PricingPage() {
    const foundingPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO || 'pri_01j7p3v1z5v5v5v5v5v5v5v5v5';
    const agencyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_AGENCY || 'pri_agency_placeholder';

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
                        <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight italic">The Investment.</h1>
                        <p className="text-lg md:text-xl font-light opacity-60 max-w-lg mx-auto leading-relaxed">
                            Upgrade your creative intelligence. 30 days money back guarantee.
                        </p>
                    </RevealOnScroll>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Founding Tier */}
                    <RevealOnScroll delay={100}>
                        <div className="relative bg-white border border-purple-100 p-12 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                            <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full mb-6 inline-block">FOUNDING PLAN</span>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-6xl font-serif tracking-tighter">$9.99</span>
                                    <span className="text-lg font-light opacity-40 italic">/month</span>
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Lifetime founding rate</p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {[
                                    "Unlimited Creative Analysis",
                                    "Deep Video DNA Extraction",
                                    "Full-Stack Viral Script Engine",
                                    "Priority Feature Access",
                                    "Standard Support"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-light text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <CheckoutButton
                                priceId={foundingPriceId}
                                className="block w-full py-6 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-purple-900 transition-all rounded-sm shadow-lg text-center"
                            >
                                Get Started
                            </CheckoutButton>
                        </div>
                    </RevealOnScroll>

                    {/* Agency Tier */}
                    <RevealOnScroll delay={200}>
                        <div className="relative bg-white border-2 border-purple-600 p-12 rounded-2xl shadow-2xl transition-all overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 right-0 p-6">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-600 underline underline-offset-4">MOST POWERFUL</span>
                            </div>

                            <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-black text-white px-4 py-1.5 rounded-full mb-6 inline-block">AGENCY PLAN</span>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-6xl font-serif tracking-tighter">$29.99</span>
                                    <span className="text-lg font-light opacity-40 italic">/month</span>
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Scale with confidence</p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {[
                                    "Everything in Founding",
                                    "Multi-Profile Support",
                                    "Batch Video Processing",
                                    "Advanced Trend Forecasting",
                                    "24/7 Priority Concierge"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-light text-gray-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <CheckoutButton
                                priceId={agencyPriceId}
                                className="block w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:scale-[1.02] transition-all rounded-sm shadow-xl text-center"
                            >
                                Secure Agency Access
                            </CheckoutButton>
                        </div>
                    </RevealOnScroll>
                </div>

                <div className="mt-20 text-center opacity-40">
                    <p className="text-[10px] tracking-[0.3em] uppercase leading-loose">
                        Cancel anytime • No hidden fees • Secured by Paddle
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
                        <a href="mailto:eixoraservicecenter@gmail.com" className="hover:opacity-100 transition-opacity">Support</a>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-20">&copy; 2026 EIXORA BY EXRICX</p>
                </div>
            </footer>
        </div>
    );
}
