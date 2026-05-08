'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CheckoutButtonProps {
    productId: string;
    children: React.ReactNode;
    className?: string;
}

export default function CheckoutButton({ productId, children, className }: CheckoutButtonProps) {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        if (!isLoaded) return;

        if (!user) {
            router.push(`/signup?redirect=/pricing&productId=${productId}`);
            return;
        }

        setIsLoading(true);
        
        // Selar Direct Redirect Logic
        const SELAR_LINKS: Record<string, string> = {
            founding: 'https://selar.co/m/foundingplan', // Placeholder - User to update
            agency: 'https://selar.co/m/agencyplan'      // Placeholder - User to update
        };

        const checkoutUrl = SELAR_LINKS[productId];

        if (checkoutUrl) {
            // Append user email to Selar link if possible for auto-fill
            const finalUrl = `${checkoutUrl}?email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`;
            window.location.href = finalUrl;
        } else {
            console.error('Invalid product ID');
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={`${className} flex items-center justify-center gap-2`}
        >
            {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {children}
        </button>
    );
}
