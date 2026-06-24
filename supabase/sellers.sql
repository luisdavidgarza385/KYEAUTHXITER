-- Crear tabla de sellers (vendedores API)
CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY DEFAULT (
    extract(epoch from now())::bigint::text || '-' || 
    substr(md5(random()::text), 1, 8) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 12)
  ),
  username TEXT UNIQUE NOT NULL,
  seller_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT -1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sellers_username ON sellers(username);
CREATE INDEX IF NOT EXISTS idx_sellers_seller_key ON sellers(seller_key);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- Comentarios
COMMENT ON TABLE sellers IS 'Sellers - pueden generar licencias mediante API URL';
COMMENT ON COLUMN sellers.username IS 'Nombre de usuario único';
COMMENT ON COLUMN sellers.seller_key IS 'Clave API única para generar licencias';
COMMENT ON COLUMN sellers.credits IS 'Créditos disponibles (-1 = ilimitado)';
COMMENT ON COLUMN sellers.status IS 'Estado de la cuenta (active/inactive)';
