'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    priceId: string;
    children: React.ReactNode;
    className?: string;
}

export default function CheckoutButton({ priceId, children, className }: CheckoutButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleCheckout = () => {
        if (!session?.user) {
            router.push('/login?callbackUrl=/pricing');
            return;
        }

        // @ts-ignore
        if (window.Paddle) {
            // @ts-ignore
            window.Paddle.Checkout.open({
                settings: {
                    displayMode: 'overlay',
                    theme: 'light',
                    locale: 'en',
                },
                items: [
                    {
                        priceId: priceId,
                        quantity: 1,
                    },
                ],
                customData: {
                    // @ts-ignore
                    userId: session.user.id,
                },
                customer: {
                    email: session.user.email || '',
                },
            });
        } else {
            console.error('Paddle not loaded');
            alert('Payment system is still loading. Please try again in a few seconds.');
        }
    };

    return (
        <button onClick={handleCheckout} className={className}>
            {children}
        </button>
    );
}
