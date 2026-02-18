
import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/client'; // Using client for now, but ideally server client
import { createClient as createServerClient } from '@supabase/supabase-js';

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
        const eventData = paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET, signature);

        // Initialize Supabase Admin Client (to bypass RLS for updates)
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { eventType, data } = eventData;
        let userId = data.customData?.userId; // Expecting userId in customData from checkout

        // If userId not in customData (e.g. renewal), try to find by customer_id in DB
        if (!userId && data.customerId) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('paddle_customer_id', data.customerId)
                .single();
            if (profile) userId = profile.id;
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
                let planType = 'free';

                // Simple mapping logic - in prod, use Env vars for Price IDs
                const priceId = items[0]?.price?.id;
                if (priceId === process.env.PADDLE_PRICE_ID_PRO) planType = 'pro';
                else if (priceId === process.env.PADDLE_PRICE_ID_AGENCY) planType = 'agency';
                else if (items[0]?.price?.description?.toLowerCase().includes('pro')) planType = 'pro'; // Fallback
                else if (items[0]?.price?.description?.toLowerCase().includes('agency')) planType = 'agency'; // Fallback

                await supabaseAdmin.from('profiles').update({
                    plan_type: planType,
                    subscription_status: data.status,
                    paddle_customer_id: data.customerId
                }).eq('id', userId);
                break;

            case EventName.SubscriptionCanceled:
            case EventName.SubscriptionPastDue:
                await supabaseAdmin.from('profiles').update({
                    subscription_status: data.status
                }).eq('id', userId);
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
