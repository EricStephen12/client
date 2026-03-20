'use client';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function UpgradePage() {
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';

    const foundingUrl = process.env.NEXT_PUBLIC_GUMROAD_FOUNDING_URL || 'https://eixora.gumroad.com/l/foundingplan';
    const agencyUrl = process.env.NEXT_PUBLIC_GUMROAD_AGENCY_URL || 'https://eixora.gumroad.com/l/agencyplan';

    const handleCheckout = (gumroadUrl: string) => {
        const url = `${gumroadUrl}?email=${encodeURIComponent(userEmail)}`;
        window.open(url, '_blank');
    };

    const currentTier = (user?.publicMetadata as any)?.plan_type || 'free';

    return (
        <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-20 space-y-6">
                <RevealOnScroll>
                    <span className="text-xs font-bold tracking-[0.5em] uppercase text-purple-600 block mb-4">Account Elevation</span>
                    <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight">Free Beta Access.</h2>
                    <p className="text-gray-500 max-w-lg mx-auto font-light text-lg mt-6">
                        Unlock the full spectrum of viral intelligence. Eixora is currently unlocked for all early adopters during our beta phase.
                    </p>
                </RevealOnScroll>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
                {/* Free Card */}
                <RevealOnScroll delay={50}>
                    <div className={`bg-white border p-10 rounded-xl transition-all h-full flex flex-col relative ${currentTier === 'free' ? 'border-gray-400 shadow-xl ring-1 ring-gray-400' : 'border-gray-200 shadow-sm'}`}>
                        {currentTier === 'free' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] font-black px-6 py-2 rounded-full tracking-[0.3em] shadow-lg">
                                CURRENT PLAN
                            </div>
                        )}
                        <div className="mb-8">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full inline-block mb-6">FREE PLAN</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-serif">$0</span>
                                <span className="text-gray-400 font-light italic text-xl">/forever</span>
                            </div>
                            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">No credit card required</p>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                            {[
                                '3 DNA Extractions / Month',
                                '3 Strategy Lounge Sessions / Month',
                                'Intelligence Studio'
                            ].map(feature => (
                                <li key={feature} className="flex gap-4 text-sm font-light text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={true}
                            className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] bg-gray-100 text-gray-400 cursor-not-allowed rounded-sm"
                        >
                            {currentTier === 'free' ? 'Current Plan' : 'Free Plan'}
                        </button>
                    </div>
                </RevealOnScroll>

                {/* Founding Card */}
                <RevealOnScroll delay={150}>
                    <div className={`bg-white border p-10 rounded-xl transition-all h-full flex flex-col relative ${currentTier === 'founding' ? 'border-purple-600 shadow-xl ring-1 ring-purple-600' : 'border-purple-100 shadow-sm hover:shadow-xl'}`}>
                        {currentTier === 'founding' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black px-6 py-2 rounded-full tracking-[0.3em] shadow-lg">
                                CURRENT PLAN
                            </div>
                        )}
                        <div className="mb-8">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full inline-block mb-6 text-center">FOUNDING PLAN</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-serif">$9.99</span>
                                <span className="text-gray-400 font-light italic text-xl">/month</span>
                            </div>
                            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">Early adopter pricing — locked in forever</p>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                            {[
                                'Unlimited DNA Extractions',
                                'Unlimited Strategy Lounge Sessions',
                                'Intelligence Studio',
                                'Email Support'
                            ].map(feature => (
                                <li key={feature} className="flex gap-4 text-sm font-light text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/dashboard/analyze"
                            className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-xl bg-black text-white hover:bg-purple-900 text-center"
                        >
                            Start Analyzing Now
                        </Link>
                    </div>
                </RevealOnScroll>

                {/* Agency Card */}
                <RevealOnScroll delay={250}>
                    <div className={`bg-white border-2 p-10 rounded-xl h-full flex flex-col relative overflow-hidden transition-all ${currentTier === 'agency' ? 'border-blue-600 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] ring-1 ring-blue-600' : 'border-purple-600 shadow-2xl'}`}>
                        {currentTier === 'agency' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-full tracking-[0.3em] shadow-lg">
                                CURRENT PLAN
                            </div>
                        )}
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
                                'Competitor Spy',
                                'Batch URL Processing (10 Videos at Once)',
                                'Priority Support'
                            ].map(feature => (
                                <li key={feature} className="flex gap-4 text-sm font-medium text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/dashboard/analyze"
                            className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] text-center"
                        >
                            Get Full Agency Access
                        </Link>
                    </div>
                </RevealOnScroll>
            </div>

            <div className="text-center mt-20 opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    Eixora by EXRICX &bull; Early Access Beta &bull; 100% Free for Early Adopters
                </p>
            </div>
        </div>
    );
}
