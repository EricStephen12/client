'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import RevealOnScroll from '@/components/RevealOnScroll';
import Link from 'next/link';

export default function UpgradePage() {
    const supabase = createClient();
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
                setUserId(user.id);
            }
        };
        getUser();
    }, [supabase]);

    const handleCheckout = (priceId: string) => {
        if (!priceId) return;
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

    const plans = [
        {
            name: 'Free',
            price: '$0',
            priceId: '',
            features: ['3 AI Scripts / Month', 'Standard Viral Library', 'Community Access'],
            cta: 'Current Plan',
            popular: false,
            color: 'gray'
        },
        {
            name: 'Pro',
            price: '$49',
            priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO || 'pri_pro_monthly_placeholder',
            features: ['Unlimited AI Scripts', 'Advanced Private Analysis', 'Custom Brand DNA', 'High-Res Asset Curator'],
            cta: 'Upgrade to Pro',
            popular: true,
            color: 'purple'
        },
        {
            name: 'Agency',
            price: '$149',
            priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_AGENCY || 'pri_agency_monthly_placeholder',
            priceSuffix: '/team',
            features: ['Team Workspaces', 'Bulk Scraper API', 'Priority AI Rendering', 'Dedicated Strategist'],
            cta: 'Go Agency',
            popular: false,
            color: 'blue'
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-16 pb-20 mt-8">
                <div className="text-center space-y-4">
                    <RevealOnScroll>
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 block">Monetization Bridge</span>
                    </RevealOnScroll>
                    <RevealOnScroll delay={100}>
                        <h2 className="text-5xl lg:text-7xl font-serif font-medium tracking-tighter text-gray-900 leading-tight">
                            Unlock <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Viral Power.</span>
                        </h2>
                    </RevealOnScroll>
                    <RevealOnScroll delay={200}>
                        <p className="text-gray-500 max-w-2xl mx-auto font-medium opacity-80">
                            Choose the layer of intelligence your dropshipping empire needs. Scale faster with agency-grade creative engineering.
                        </p>
                    </RevealOnScroll>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, i) => (
                        <RevealOnScroll key={plan.name} delay={300 + (i * 100)}>
                            <div className={`relative group p-10 rounded-[3rem] border transition-all duration-500 flex flex-col h-full ${plan.popular
                                ? 'bg-white border-purple-200 shadow-[0_40px_100px_-20px_rgba(168,85,247,0.15)] ring-4 ring-purple-50'
                                : 'bg-gray-50/50 border-gray-100'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute top-8 right-8 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-[10px] text-white font-black uppercase tracking-widest rounded-full">
                                        Most Choice
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className="text-xl font-serif mb-6 text-gray-900">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-serif font-medium tracking-tighter">{plan.price}</span>
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">/ month{plan.priceSuffix}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex gap-3 text-sm font-medium text-gray-500">
                                            <svg className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-purple-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleCheckout(plan.priceId)}
                                    disabled={plan.name === 'Free'}
                                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:-translate-y-1 ${plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-200'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>

                <div className="text-center pt-8">
                    <RevealOnScroll delay={700}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Secure transactions powered by <span className="text-gray-900">Paddle</span>. No hidden fees.
                        </p>
                    </RevealOnScroll>
                </div>
            </div>
        </DashboardLayout>
    );
}
