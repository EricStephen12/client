-- Add Stripe columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free', -- 'active', 'past_due', 'canceled', 'free'
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free', -- 'starter', 'growth', 'pro'
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS credits_monthly_limit INTEGER DEFAULT 3; -- Reset to this value each month

-- Function to handle webhook updates (optional, can be done via API too)
-- For now we will handle logic in API, this just ensures schema is ready.
