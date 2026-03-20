'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    gumroadUrl: string;
    children: React.ReactNode;
    className?: string;
}

export default function CheckoutButton({ gumroadUrl, children, className }: CheckoutButtonProps) {
    const { user } = useUser();
    const router = useRouter();

    const handleCheckout = () => {
        // Platform is currently FREE for early adopters during Beta
        router.push('/signup');
    };

    return (
        <button onClick={handleCheckout} className={className}>
            {children}
        </button>
    );
}
