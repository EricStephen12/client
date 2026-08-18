'use client';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import CheckoutButton from './CheckoutButton';

interface PricingSectionProps {
    currentTier: string;
    userEmail?: string;
    showQuotas?: boolean;
    usage?: {
        scans: number;
        scripts: number;
    };
}

export default function PricingSection({ currentTier, userEmail, showQuotas, usage }: PricingSectionProps) {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: '/mo',
            badge: 'Basic Access',
            description: 'Test the engine — no card needed',
            features: [
                '3 scans / month',
                'Up to 90s videos',
                'Video Intel & Product Intel',
            ],
            productId: null,
            buttonText: currentTier === 'free' ? 'Current Plan ✓' : 'Start Free',
            buttonHref: '/signup',
            highlight: false,
        },
        {
            id: 'creator',
            name: 'Creator',
            price: '$9',
            period: '/mo',
            badge: 'Most Popular',
            description: 'For serious operators and brand builders',
            features: [
                '30 scans / month',
                'Up to 5m videos',
                'Both scan modes',
                'Priority processing',
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_CREATOR_ID || 'creator_placeholder',
            buttonText: currentTier === 'creator' ? 'Current Plan ✓' : 'Upgrade to Creator',
            buttonHref: null,
            highlight: true,
        },
        {
            id: 'studio',
            name: 'Studio',
            price: '$15',
            period: '/mo',
            badge: 'Best Value',
            description: 'Full arsenal for high-volume teams',
            features: [
                '100 scans / month',
                'Up to 30m videos',
                'Premium deep-dive AI',
                'Priority processing',
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_STUDIO_ID || 'studio_placeholder',
            buttonText: currentTier === 'studio' || currentTier === 'agency' ? 'Current Plan ✓' : 'Enter The Studio',
            buttonHref: null,
            highlight: false,
        }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto font-sans">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
            >
                {plans.map((plan) => {
                    const isCurrent = currentTier === plan.id || (plan.id === 'studio' && currentTier === 'agency');
                    const isHighlight = plan.highlight;

                    return (
                        <motion.div
                            key={plan.id}
                            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -3 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 border ${
                                isHighlight
                                    ? 'bg-[#141a16] text-stone-100 border-[#bdf522]/40 shadow-xl shadow-[#bdf522]/5'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            {/* Popular badge */}
                            {isHighlight && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-emerald-400 to-[#bdf522]" />
                            )}
                            {isCurrent && (
                                <div className="absolute top-5 right-5 bg-[#bdf522] text-slate-950 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Active
                                </div>
                            )}
                            {isHighlight && !isCurrent && (
                                <div className="absolute top-5 right-5 flex items-center gap-1 bg-[#bdf522]/15 text-[#bdf522] text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#bdf522]/30">
                                    <Sparkles className="w-3 h-3" />
                                    Popular
                                </div>
                            )}

                            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                                {/* Plan header */}
                                <div>
                                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase block mb-2 ${isHighlight ? 'text-[#bdf522]' : 'text-stone-400'}`}>
                                        {plan.badge}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mb-1 font-sans">{plan.name}</h3>
                                    <p className="text-xs text-stone-400 leading-relaxed">{plan.description}</p>
                                    
                                    <div className="flex items-baseline gap-1 mt-5">
                                        <span className="text-4xl sm:text-5xl font-bold text-white font-sans">{plan.price}</span>
                                        <span className="text-sm text-stone-400 font-mono">{plan.period}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 py-2 flex-1 border-t border-white/5">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2.5 text-xs text-stone-300 font-sans">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isHighlight ? 'bg-[#bdf522]/20 text-[#bdf522]' : 'bg-white/10 text-stone-400'}`}>
                                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                            </div>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div className="pt-2">
                                    {plan.buttonHref ? (
                                        <a
                                            href={plan.buttonHref}
                                            className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl text-center flex items-center justify-center gap-2 font-sans ${
                                                isHighlight
                                                    ? 'bg-[#bdf522] text-slate-950 hover:bg-[#aee618]'
                                                    : 'border border-white/15 text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {plan.buttonText}
                                        </a>
                                    ) : plan.productId && !isCurrent ? (
                                        <CheckoutButton
                                            productId={plan.productId}
                                            className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl text-center flex items-center justify-center gap-2 font-sans ${
                                                isHighlight
                                                    ? 'bg-[#bdf522] text-slate-950 hover:bg-[#aee618] shadow-lg shadow-[#bdf522]/20'
                                                    : 'border border-white/15 text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {plan.buttonText}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </CheckoutButton>
                                    ) : (
                                        <button
                                            disabled
                                            className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-2 font-sans ${
                                                isCurrent
                                                    ? 'bg-[#bdf522]/15 text-[#bdf522] border border-[#bdf522]/30'
                                                    : 'bg-white/5 text-stone-600 border border-white/10'
                                            }`}
                                        >
                                            {plan.buttonText}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
