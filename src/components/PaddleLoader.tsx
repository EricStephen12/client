'use client';

import Script from 'next/script';

export default function PaddleLoader() {
    return (
        <Script
            src="https://cdn.paddle.com/paddle/paddle.js"
            strategy="afterInteractive"
            onLoad={() => {
                // @ts-ignore
                if (window.Paddle) {
                    const vendorId = Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID);

                    // Skip Paddle setup in development if no valid vendor ID is set
                    if (!vendorId || vendorId === 1234567) {
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('⚠️ Paddle: No valid vendor ID set. Skipping Paddle initialization in development mode.');
                            return;
                        }
                    }

                    // @ts-ignore
                    window.Paddle.Setup({
                        vendor: vendorId,
                        debug: process.env.NODE_ENV === 'development'
                    });
                }
            }}
        />
    );
}
