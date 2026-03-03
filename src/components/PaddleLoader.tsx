'use client';

import Script from 'next/script';

export default function PaddleLoader() {
    return (
        <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            strategy="afterInteractive"
            onLoad={() => {
                // @ts-ignore
                if (window.Paddle) {
                    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

                    // Skip Paddle setup in development if no valid client token is set
                    if (!clientToken || clientToken === 'your_client_token_here') {
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('⚠️ Paddle: No valid client token set. Skipping Paddle initialization in development mode.');
                            return;
                        }
                    }

                    // @ts-ignore
                    window.Paddle.Initialize({
                        token: clientToken, // In V2, this is the Client-side Token
                        eventCallback: function (data: any) {
                            console.log('Paddle Event:', data);
                        }
                    });
                }
            }}
        />
    );
}
