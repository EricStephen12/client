import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import postgres from 'postgres';

// Initialize Neon database connection
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

// Initialize Paddle
const paddle = new Paddle(process.env.PADDLE_API_KEY || 'test');

export async function POST(req: NextRequest) {
    const signature = req.headers.get('paddle-signature');
    const body = await req.text();

    if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    try {
        // Verify the webhook signature
        const eventData = await paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET, signature);

        const { eventType, data } = eventData as any;
        let userId = data.customData?.userId;

        // If userId not in customData (e.g. renewal), try to find by customer_id in DB
        if (!userId && data.customerId) {
            const [user] = await sql`
                SELECT id FROM users WHERE paddle_customer_id = ${data.customerId}
            `;
            if (user) userId = user.id;
        }

        if (!userId) {
            console.warn(`Webhook: No User ID found for event ${eventType}`);
            return NextResponse.json({ status: 'ignored (no user)' });
        }

        switch (eventType) {
            case EventName.SubscriptionCreated:
            case EventName.SubscriptionUpdated:
            case EventName.SubscriptionActivated:
                const items = data.items;
                let subscriptionTier = 'free';

                const priceId = items[0]?.price?.id;
                if (priceId === process.env.PADDLE_PRICE_ID_PRO) subscriptionTier = 'pro';
                else if (priceId === process.env.PADDLE_PRICE_ID_AGENCY) subscriptionTier = 'agency';
                else if (items[0]?.price?.description?.toLowerCase().includes('pro')) subscriptionTier = 'pro';
                else if (items[0]?.price?.description?.toLowerCase().includes('agency')) subscriptionTier = 'agency';

                await sql`
                    UPDATE users 
                    SET subscription_tier = ${subscriptionTier},
                        subscription_status = ${data.status},
                        paddle_customer_id = ${data.customerId}
                    WHERE id = ${userId}
                `;
                break;

            case EventName.SubscriptionCanceled:
            case EventName.SubscriptionPastDue:
                await sql`
                    UPDATE users 
                    SET subscription_status = ${data.status}
                    WHERE id = ${userId}
                `;
                break;

            default:
                console.log(`Webhook: Unhandled event ${eventType}`);
        }

        return NextResponse.json({ status: 'success' });
    } catch (err) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
