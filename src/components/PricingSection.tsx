'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();

    const plans = [
        {
            id: 'creator',
            name: 'The Creator',
            price: '$5',
            period: '/mo',
            badge: 'Essential Access',
            description: 'For individual creatives',
            features: [
                '30 Studio Scans / mo',
                'Up to 5 minute videos',
                '30 Strategy Briefs / mo',
                'Creative Lounge Access'
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_CREATOR_ID || 'creator_placeholder',
            buttonText: currentTier === 'creator' ? 'Active Plan' : 'Upgrade to Creator',
            color: 'slate'
        },
        {
            id: 'studio',
            name: 'The Studio',
            price: '$10',
            period: '/mo',
            badge: 'Best Value',
            description: 'Full team collaboration',
            features: [
                '250 Studio Scans / mo',
                'Up to 30 minute videos',
                '250 Strategy Briefs / mo',
                'Priority AI Speed'
            ],
            productId: process.env.NEXT_PUBLIC_POLAR_STUDIO_ID || 'studio_placeholder',
            buttonText: currentTier === 'studio' ? 'Active Plan' : 'Enter The Studio',
            color: 'indigo',
            popular: true
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-12 w-full max-w-5xl mx-auto">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {plans.map((plan) => {
                    const isCurrent = currentTier === plan.id || (plan.id === 'studio' && currentTier === 'agency');
                    const isIndigo = plan.color === 'indigo';
                    
                    return (
                        <motion.div
                            key={plan.id}
                            variants={cardVariants}
                            className={`relative rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 h-full border ${
                                isIndigo 
                                    ? 'bg-slate-900 border-slate-500/30 text-white shadow-2xl' 
                                    : isCurrent 
                                        ? 'bg-white border-lime-500 shadow-xl ring-1 ring-lime-500' 
                                        : 'bg-white border-slate-100 hover:border-lime-200 hover:shadow-xl'
                            }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-500 text-slate-950 text-[10px] font-bold px-8 py-2 rounded-full tracking-[0.4em] shadow-xl z-10">
                                    CURRENT
                                </div>
                            )}

                            <div className="mb-10">
                                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-6 block italic ${isIndigo ? 'text-lime-500' : 'text-slate-400'}`}>
                                    {plan.badge}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-sans font-bold">{plan.price}</span>
                                    <span className={`font-light italic text-xl ${isIndigo ? 'text-slate-400' : 'text-slate-300'}`}>{plan.period}</span>
                                </div>
                                <p className={`text-[10px] font-bold tracking-[0.3em] uppercase mt-4 italic ${isIndigo ? 'text-slate-400' : 'text-lime-600'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-5 mb-12 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-4 text-sm font-medium opacity-80">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isIndigo || plan.id === 'founding' ? 'bg-lime-500' : 'bg-slate-200'}`}></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.productId ? (
                                <CheckoutButton
                                    productId={plan.productId}
                                    className={`w-full py-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all rounded-2xl shadow-xl text-center ${
                                        isIndigo 
                                            ? 'bg-lime-500 text-slate-950 hover:bg-white' 
                                            : 'bg-slate-950 text-white hover:bg-lime-500 hover:text-slate-950'
                                    }`}
                                >
                                    {plan.buttonText}
                                </CheckoutButton>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.4em] bg-slate-50 text-slate-300 rounded-2xl cursor-not-allowed border border-slate-100"
                                >
                                    {plan.buttonText}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {showQuotas && currentTier === 'free' && usage && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 border-t border-slate-100"
                >
                    <div className="space-y-3 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Studio Scans Remaining</span>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-sans font-bold text-slate-900">{Math.max(0, 3 - usage.scans)}</span>
                            <span className="text-slate-300 font-light mb-1 text-xl">/ 3</span>
                        </div>
                        <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-lime-500 h-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (usage.scans / 3) * 100)}%` }} 
                            />
                        </div>
                    </div>
                    <div className="space-y-3 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Strategy Briefs Remaining</span>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-sans font-bold text-slate-900">{Math.max(0, 3 - usage.scripts)}</span>
                            <span className="text-slate-300 font-light mb-1 text-xl">/ 3</span>
                        </div>
                        <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-slate-600 h-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (usage.scripts / 3) * 100)}%` }} 
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
