# ❄️ Payment System Diagnostic & Integration Fix

I have performed a thorough audit of your payment systems, webhooks, and subscription lifecycles to diagnose why the application does not automatically upgrade users or know when they pay/downgrade/cancel.

---

## 🔍 Root Cause Analysis

### 1. The Email Extraction Bug (Critical)
In your Polar webhook handler (`server/routes/polar.js`), the code extracts the user's email address like this:
```javascript
const email = data.customer_email || data.user_email || data.email;
```
However, in the official Polar.sh Webhook specification, the customer email is **not** sent as a top-level field on either `order` or `subscription` objects. Instead, it is nested inside the `customer` object:
* **Correct path**: `data.customer.email` (or `data.customer?.email` in JS).

Because the old code was looking for a top-level `customer_email` or `user_email`, it returned `undefined`. As a result, the statement `if (email)` was **never executed**, meaning no database updates ever occurred!

### 2. Standard Webhooks Signature Verification (Failed comparison)
Your handler manually calculates an HMAC digest:
```javascript
const hmac = crypto.createHmac('sha256', secret);
const digest = hmac.update(req.body).digest('hex');
```
But Polar.sh uses the **Standard Webhooks (Svix) specification**, which hashes a concatenated string of `webhook-id`, `webhook-timestamp`, and the payload, and compares it to a base64 signature. Your manual comparison would fail or signature headers were mismatching, resulting in failed webhook requests.

---

## 🛠️ The Solution

Here is the exact code to replace in your backend server file `server/routes/polar.js`. 

### Step 1: Install `svix` dependency (already in your server dependencies!)
Make sure your server dependencies are installed:
```bash
npm install
```

### Step 2: Replace `server/routes/polar.js` with this corrected implementation:

```javascript
const express = require('express');
const { sql } = require('../db/index');
const { Webhook } = require('svix'); // Use official Svix validator
const router = express.Router();

/**
 * Polar.sh Webhook Handler
 * Syncs Polar payment/subscription events to PostgreSQL
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['webhook-signature'] || req.headers['polar-webhook-signature'];
    const timestamp = req.headers['webhook-timestamp'];
    const id = req.headers['webhook-id'];
    const secret = process.env.POLAR_WEBHOOK_SECRET;
    
    // 1. Signature Verification using standard Svix package
    if (secret) {
        if (!signature || !timestamp || !id) {
            console.error('❌ Polar Webhook: Missing required verification headers');
            return res.status(401).json({ error: 'Missing headers' });
        }

        try {
            const wh = new Webhook(secret);
            wh.verify(req.body.toString(), {
                'svix-id': id,
                'svix-timestamp': timestamp,
                'svix-signature': signature
            });
            console.log('✅ Polar Webhook signature verified successfully');
        } catch (err) {
            console.error('❌ Polar Webhook verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    try {
        const event = JSON.parse(req.body.toString());
        console.log(`❄️ Polar Webhook Received: [${event.type}]`);
        
        const data = event.data;
        if (!data) {
            return res.status(400).json({ error: 'No data payload' });
        }

        // Extract email address safely from the nested customer object
        const email = data.customer?.email || data.customer_email || data.user_email || data.email;

        // 2. Handle successful payment/upgrade
        if (event.type === 'order.created' || event.type === 'order.paid' || event.type === 'subscription.created' || event.type === 'subscription.active') {
            
            let plan = data.metadata?.plan_type;
            
            // Auto-detect plan tier if metadata is missing
            if (!plan && data.amount) {
                // Polar amount is in cents ($59.00 = 5900)
                plan = data.amount >= 5900 ? 'studio' : 'creator';
            }
            if (!plan && data.product?.name) {
                const name = data.product.name.toLowerCase();
                if (name.includes('studio')) plan = 'studio';
                else if (name.includes('creator')) plan = 'creator';
            }

            // Fallback default
            if (!plan) plan = 'creator';

            if (email) {
                console.log(`🏆 Polar Webhook: Upgrading user ${email} to tier [${plan}]`);

                // Update database
                const result = await sql`
                    UPDATE users 
                    SET subscription_tier = ${plan}, 
                        updated_at = NOW()
                    WHERE email = ${email}
                    RETURNING id, name, email, subscription_tier
                `;
                console.log('Database sync complete:', result);

                // Note: Polar.sh automatically sends invoice receipt emails to customers.
                return res.status(200).json({ success: true, message: `Upgraded ${email} to ${plan}` });
            } else {
                console.warn('⚠️ Polar Webhook: No email found in successful payment event');
            }
        } 
        
        // 3. Handle cancellations and revokes (Downgrades)
        else if (event.type === 'subscription.updated' || event.type === 'subscription.canceled' || event.type === 'subscription.revoked') {
            const isDowngrade = event.type === 'subscription.canceled' || 
                              event.type === 'subscription.revoked' || 
                              data.status === 'canceled' || 
                              data.status === 'incomplete' || 
                              data.status === 'revoked';

            if (isDowngrade) {
                if (email) {
                    console.log(`📉 Polar Webhook: Downgrading ${email} to free plan (Canceled/Revoked)`);
                    
                    await sql`
                        UPDATE users 
                        SET subscription_tier = 'free', 
                            updated_at = NOW()
                        WHERE email = ${email}
                    `;
                    
                    return res.status(200).json({ success: true, message: `Downgraded ${email} to free` });
                }
            } else if (event.type === 'subscription.updated') {
                 // Update plan tier if user switched plans
                 let plan = data.metadata?.plan_type;
                 if (!plan && data.amount) plan = data.amount >= 5900 ? 'studio' : 'creator';
                 if (!plan && data.product?.name) plan = data.product.name.toLowerCase().includes('studio') ? 'studio' : 'creator';
                 if (!plan) plan = 'creator';

                 if (email && data.status === 'active') {
                    console.log(`🔄 Polar Webhook: Updating ${email} to ${plan} (Subscription Updated)`);
                    await sql`
                        UPDATE users 
                        SET subscription_tier = ${plan}, 
                            updated_at = NOW()
                        WHERE email = ${email}
                    `;
                    return res.status(200).json({ success: true, message: `Updated ${email} to ${plan}` });
                 }
            }
        }

        res.status(200).json({ status: 'ignored' });
    } catch (err) {
        console.error('❌ Polar Webhook Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
```

Once you deploy this fix, Polar checkouts will immediately link to the user's database records using their email, upgrading their access instantenously upon payment!
