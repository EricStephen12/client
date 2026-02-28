'use client';
import { useSession } from 'next-auth/react';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function UpgradePage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const userId = (session?.user as any)?.id || '';

    const handleCheckout = () => {
        const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FOUNDING || 'pri_founding_monthly_placeholder';
        // @ts-ignore
        if (window.Paddle) {
            // @ts-ignore
            window.Paddle.Checkout.open({
                items: [{ priceId: priceId, quantity: 1 }],
                customer: { email: userEmail },
                customData: { userId: userId },
                settings: {
                    displayMode: "overlay",
                    theme: "light",
                    locale: "en"
                }
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <div className="text-center space-y-8 mb-20">
                <RevealOnScroll>
                    <span className="text-xs font-bold tracking-[0.5em] uppercase text-purple-600 block">The Elite Bridge</span>
                </RevealOnScroll>
                <RevealOnScroll delay={100}>
                    <h2 className="text-6xl md:text-8xl font-serif tracking-tighter italic">Founding <br />Architect.</h2>
                </RevealOnScroll>
                <RevealOnScroll delay={200}>
                    <p className="text-gray-500 max-w-xl mx-auto font-light text-lg">
                        Unlock the full spectrum of viral intelligence. Join the founding 100 at our lifetime legacy rate.
                    </p>
                </RevealOnScroll>
            </div>

            <RevealOnScroll delay={300}>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white border border-purple-100 p-12 md:p-20 rounded-xl shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg">LIFETIME RATE</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 w-full">
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-7xl md:text-8xl font-serif">$9.99</span>
                                    <span className="text-gray-400 font-light italic text-xl">/month</span>
                                </div>
                                <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-12">Full Access • Founding Status</h3>

                                <ul className="space-y-6 mb-12">
                                    {[
                                        'Unlimited Viral DNA Extractions',
                                        'Infinite AI Script Generation',
                                        'Deep Psychology Trigger Mapping',
                                        'Direct Creative Director Mentality',
                                        'Priority Feature Reservation'
                                    ].map(feature => (
                                        <li key={feature} className="flex gap-4 text-sm font-light text-gray-600 group/item">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 group-hover/item:w-6 transition-all"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-6 bg-black text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-purple-900 transition-all transform hover:-translate-y-1 rounded-sm shadow-xl"
                                >
                                    Claim Founding Spot
                                </button>
                                <p className="mt-8 text-[10px] text-center uppercase tracking-widest opacity-40">Only 100 spots at this rate &bull; No hidden fees</p>
                            </div>

                            <div className="hidden lg:block w-px h-64 bg-gradient-to-b from-transparent via-purple-100 to-transparent"></div>

                            <div className="hidden lg:block flex-1 text-left">
                                <p className="font-serif italic text-3xl mb-8 leading-tight">"In the attention economy, precision beats volume."</p>
                                <div className="space-y-6 text-sm font-light text-gray-500 opacity-80 leading-relaxed">
                                    <p>As a founding member, you aren't just buying software. You're securing the algorithmic edge before it goes mainstream.</p>
                                    <p>Your rate is locked forever. Your influence starts today.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </RevealOnScroll>

            <div className="text-center mt-20 opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    Powered by <span className="text-black">Paddle</span> &bull; Secure Encrypted Payments
                </p>
            </div>
        </div>
    );
}
