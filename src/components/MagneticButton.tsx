'use client';

import { useRef, useState, MouseEvent } from 'react';
import Link from 'next/link';

interface MagneticButtonProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export default function MagneticButton({ href, children, className = '', variant = 'primary' }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.3;
        const deltaY = (e.clientY - centerY) * 0.3;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const baseClasses = variant === 'primary'
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
        : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50';

    return (
        <Link
            ref={buttonRef}
            href={href}
            className={`inline-flex items-center justify-center px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 ${baseClasses} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
        >
            {children}
        </Link>
    );
}
