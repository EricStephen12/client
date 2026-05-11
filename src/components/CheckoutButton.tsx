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
            router.push(`/sign-in?redirect_url=/pricing`); // Using Clerk's default sign-in route
            return;
        }

        setIsLoading(true);

const checkoutUrl = productId.startsWith('http') ? productId : `https://polar.sh/checkout/${productId}`;

        if (checkoutUrl && checkoutUrl !== 'creator_placeholder' && checkoutUrl !== 'studio_placeholder') {

const finalUrl = checkoutUrl.includes('?') 
                ? `${checkoutUrl}&customer_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
                : `${checkoutUrl}?customer_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`;
            window.location.href = finalUrl;
        } else {

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
