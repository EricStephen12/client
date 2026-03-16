'use client';
import { useSession } from 'next-auth/react';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function UpgradePage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';

    const foundingUrl = process.env.NEXT_PUBLIC_GUMROAD_FOUNDING_URL || 'https://eixora.gumroad.com/l/foundingplan';
    const agencyUrl = process.env.NEXT_PUBLIC_GUMROAD_AGENCY_URL || 'https://eixora.gumroad.com/l/agencyplan';

    const handleCheckout = (gumroadUrl: string) => {
        const url = `${gumroadUrl}?email=${encodeURIComponent(userEmail)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-20 space-y-6">
                <RevealOnScroll>
                    <span className="text-xs font-bold tracking-[0.5em] uppercase text-purple-600 block mb-4">Account Elevation</span>
                    <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight">Upgrade Studio.</h2>
                    <p className="text-gray-500 max-w-lg mx-auto font-light text-lg mt-6">
                        Unlock the full spectrum of viral intelligence. 30 days money back guarantee.
                    </p>
                </RevealOnScroll>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Founding Card */}
                <RevealOnScroll delay={100}>
                    <div className="bg-white border border-purple-100 p-12 rounded-xl shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                        <div className="mb-8">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full inline-block mb-6">FOUNDING PLAN</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-serif">$9.99</span>
                                <span className="text-gray-400 font-light italic text-xl">/month</span>
                            </div>
                            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Early adopter pricing — locked in forever</p>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                            {[
                                'Unlimited Viral DNA Scans',
                                'Unlimited AI Script Generation',
                                'Strategy Lounge (AI Creative Director)',
                                'Private Ad Vault',
                                'Session History & Replay',
                                'Email Support'
                            ].map(feature => (
                                <li key={feature} className="flex gap-4 text-sm font-light text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleCheckout(foundingUrl)}
                            className="w-full py-6 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-purple-900 transition-all rounded-sm shadow-xl"
                        >
                            Claim Founding Spot
                        </button>
                    </div>
                </RevealOnScroll>

                {/* Agency Card */}
                <RevealOnScroll delay={200}>
                    <div className="bg-white border-2 border-purple-600 p-12 rounded-xl shadow-2xl h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-600">AGENCY SCALE</span>
                        </div>

                        <div className="mb-8">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-gray-900 text-white px-4 py-1.5 rounded-full inline-block mb-6">MOST POWERFUL</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-serif">$29.99</span>
                                <span className="text-gray-400 font-light italic text-xl">/month</span>
                            </div>
                            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Scale your ad intelligence</p>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                            {[
                                'Everything in Founding',
                                'Batch URL Processing (Analyze Multiple Videos)',
                                'Exportable DNA Reports (Download)',
                                'Unlimited Session History',
                                'Priority Support'
                            ].map(feature => (
                                <li key={feature} className="flex gap-4 text-sm font-medium text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleCheckout(agencyUrl)}
                            className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:scale-[1.02] transition-all rounded-sm shadow-2xl"
                        >
                            Upgrade to Agency
                        </button>
                    </div>
                </RevealOnScroll>
            </div>

            <div className="text-center mt-20 opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    Eixora by EXRICX &bull; Powered by <span className="text-black">Gumroad</span> &bull; 30 Days Money Back Guarantee
                </p>
            </div>
        </div>
    );
}
