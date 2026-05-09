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

        // Check if user is logged in
        if (!user) {
            router.push(`/sign-in?redirect_url=/pricing`); // Using Clerk's default sign-in route
            return;
        }

        setIsLoading(true);
        
        // Use the productId (which comes from .env variables like NEXT_PUBLIC_GUMROAD_CREATOR_ID)
        // Since we are using Gumroad/Stripe/Polar links, the productId is usually the checkout URL.
        const checkoutUrl = productId.startsWith('http') ? productId : `https://selar.co/m/${productId}`;

        if (checkoutUrl && checkoutUrl !== 'creator_placeholder' && checkoutUrl !== 'studio_placeholder') {
            // Append user email to the link if possible for auto-fill
            const finalUrl = checkoutUrl.includes('?') 
                ? `${checkoutUrl}&email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
                : `${checkoutUrl}?email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`;
            window.location.href = finalUrl;
        } else {
            console.warn('Payment link not configured in environment variables.');
            alert('Payment gateways are currently being configured. Please contact support.');
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
