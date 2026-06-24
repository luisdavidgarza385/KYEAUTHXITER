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

-- Enable RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for authenticated users" ON sellers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON sellers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON sellers
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON sellers
  FOR DELETE USING (true);
