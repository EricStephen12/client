'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CheckoutButtonProps {
    productId: string;
    children: React.ReactNode;
    className?: string;
}

export default function CheckoutButton({ productId, children, className }: CheckoutButtonProps) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        if (!isLoaded) return;

        if (!user) {
            router.push(`/signup?redirect=/pricing&productId=${productId}`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/checkout/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId })
            });

            if (res.ok) {
                const { url } = await res.json();
                window.location.href = url;
            } else {
                console.error('Failed to create session');
                alert('Connection error. Try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
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
