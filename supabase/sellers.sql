-- Crear tabla de sellers
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  seller_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  unlimited_credits BOOLEAN NOT NULL DEFAULT false,
  can_use_api BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  parent_seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_sellers_username ON sellers(username);
CREATE INDEX IF NOT EXISTS idx_sellers_seller_key ON sellers(seller_key);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_parent ON sellers(parent_seller_id);

-- Disable RLS since we handle auth at the API level with admin_session cookie
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;
