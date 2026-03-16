'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    gumroadUrl: string;
    children: React.ReactNode;
    className?: string;
}

export default function CheckoutButton({ gumroadUrl, children, className }: CheckoutButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleCheckout = () => {
        if (!session?.user) {
            router.push('/login?callbackUrl=/pricing');
            return;
        }

        // Open Gumroad checkout with user's email pre-filled
        const email = session.user.email || '';
        const url = `${gumroadUrl}?email=${encodeURIComponent(email)}`;
        window.open(url, '_blank');
    };

    return (
        <button onClick={handleCheckout} className={className}>
            {children}
        </button>
    );
}
