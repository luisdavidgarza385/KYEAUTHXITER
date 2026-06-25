-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  seller_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  unlimited_credits BOOLEAN NOT NULL DEFAULT false,
  can_use_api BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sellers_username ON sellers(username);
CREATE INDEX IF NOT EXISTS idx_sellers_seller_key ON sellers(seller_key);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- Disable RLS since we handle auth at the API level with admin_session cookie
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;
