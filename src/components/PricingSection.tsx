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
            name: 'Free Trial',
            price: '$0',
            period: '/mo',
            badge: 'Get Started',
            description: 'Test the engine — no card needed',
            features: [
                '3 Studio Scans / month',
                'Up to 90 second videos',
                'Ad & Content Intelligence',
                'Product Intelligence',
            ],
            productId: null,
            buttonText: currentTier === 'free' ? 'Current Plan ✓' : 'Start Free',
            buttonHref: '/signup',
            highlight: false,
        },
        {
            id: 'creator',
            name: 'The Creator',
            price: '$9',
            period: '/mo',
            badge: 'Most Popular',
            description: 'For serious creators and dropshippers',
            features: [
                '30 Studio Scans / month',
                'Up to 5 minute videos',
                '30 Strategy Briefs / month',
                'Creative Lounge Chat',
                'Niche Benchmark Reports',
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_CREATOR_ID || 'creator_placeholder',
            buttonText: currentTier === 'creator' ? 'Current Plan ✓' : 'Upgrade to Creator',
            buttonHref: null,
            highlight: false,
        },
        {
            id: 'studio',
            name: 'The Studio',
            price: '$29',
            period: '/mo',
            badge: 'Best Value',
            description: 'Full arsenal for high-volume teams',
            features: [
                '100 Studio Scans / month',
                'Up to 30 minute videos',
                '100 Strategy Briefs / month',
                'Priority AI Processing',
                'Niche Benchmark Reports',
                'Batch Analysis (up to 10 URLs)',
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_STUDIO_ID || 'studio_placeholder',
            buttonText: currentTier === 'studio' || currentTier === 'agency' ? 'Current Plan ✓' : 'Enter The Studio',
            buttonHref: null,
            highlight: true,
        }
    ];

    return (
        <div className="space-y-16 w-full max-w-5xl mx-auto">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
                {plans.map((plan) => {
                    const isCurrent = currentTier === plan.id || (plan.id === 'studio' && currentTier === 'agency');
                    const isHighlight = plan.highlight;

                    return (
                        <motion.div
                            key={plan.id}
                            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`relative rounded-3xl flex flex-col overflow-hidden transition-shadow duration-300 ${
                                isHighlight
                                    ? 'bg-slate-950 text-white shadow-2xl shadow-slate-950/30'
                                    : 'bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200'
                            }`}
                        >
                            {/* Popular badge */}
                            {isHighlight && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-500" />
                            )}
                            {isCurrent && (
                                <div className="absolute top-5 right-5 bg-lime-500 text-slate-950 text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase shadow-md">
                                    Active
                                </div>
                            )}
                            {isHighlight && !isCurrent && (
                                <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-lime-500/20 text-lime-400 text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
                                    <Sparkles className="w-3 h-3" />
                                    Popular
                                </div>
                            )}

                            <div className="p-8 sm:p-10 flex-1 flex flex-col">
                                {/* Plan header */}
                                <div className="mb-8">
                                    <span className={`text-[10px] font-black tracking-[0.3em] uppercase italic block mb-4 ${isHighlight ? 'text-lime-500' : 'text-slate-400'}`}>
                                        {plan.badge}
                                    </span>
                                    <h3 className={`text-2xl font-bold mb-1 ${isHighlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                    <p className={`text-sm font-medium ${isHighlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                                    
                                    <div className="flex items-baseline gap-1.5 mt-6">
                                        <span className={`text-5xl sm:text-6xl font-bold ${isHighlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                        <span className={`text-xl font-light italic ${isHighlight ? 'text-slate-500' : 'text-slate-400'}`}>{plan.period}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isHighlight ? 'bg-lime-500/20 text-lime-400' : 'bg-slate-100 text-slate-600'}`}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm font-medium leading-snug ${isHighlight ? 'text-slate-300' : 'text-slate-700'}`}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {plan.buttonHref ? (
                                    <a
                                        href={plan.buttonHref}
                                        className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-2xl text-center flex items-center justify-center gap-2 active:scale-95 ${
                                            isHighlight
                                                ? 'bg-lime-500 text-slate-950 hover:bg-lime-400 shadow-xl shadow-lime-500/20'
                                                : 'bg-slate-950 text-white hover:bg-lime-500 hover:text-slate-950'
                                        }`}
                                    >
                                        {plan.buttonText}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                ) : plan.productId && !isCurrent ? (
                                ) : plan.productId && !isCurrent ? (
                                    <CheckoutButton
                                        productId={plan.productId}
                                        className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-2xl text-center flex items-center justify-center gap-2 active:scale-95 ${
                                            isHighlight
                                                ? 'bg-lime-500 text-slate-950 hover:bg-lime-400 shadow-xl shadow-lime-500/20'
                                                : 'bg-slate-950 text-white hover:bg-lime-500 hover:text-slate-950'
                                        }`}
                                    >
                                        {plan.buttonText}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </CheckoutButton>
                                ) : (
                                    <button
                                        disabled
                                        className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 ${
                                            isCurrent
                                                ? isHighlight ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-lime-50 text-lime-600 border border-lime-200'
                                                : 'bg-slate-50 text-slate-300 border border-slate-100'
                                        }`}
                                    >
                                        {plan.buttonText}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Usage quotas */}
            {showQuotas && currentTier === 'free' && usage && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {[
                        { label: 'Studio Scans Remaining', used: usage.scans, max: 3, color: 'lime' },
                        { label: 'Strategy Briefs Remaining', used: usage.scripts, max: 3, color: 'slate' },
                    ].map(({ label, used, max, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{label}</span>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-slate-900">{Math.max(0, max - used)}</span>
                                <span className="text-slate-300 font-light mb-1 text-xl">/ {max}</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${color === 'lime' ? 'bg-lime-500' : 'bg-slate-600'}`}
                                    style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
