-- Crear tabla de suscriptores
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY DEFAULT (
    extract(epoch from now())::bigint::text || '-' || 
    substr(md5(random()::text), 1, 8) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 12)
  ),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_type TEXT NOT NULL DEFAULT 'VIP',
  credits INTEGER NOT NULL DEFAULT -1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_subscribers_username ON subscribers(username);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_type ON subscribers(subscription_type);

-- Comentarios
COMMENT ON TABLE subscribers IS 'Suscriptores del sistema - pueden crear sus propias aplicaciones';
COMMENT ON COLUMN subscribers.username IS 'Nombre de usuario único';
COMMENT ON COLUMN subscribers.password_hash IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN subscribers.subscription_type IS 'Tipo de suscripción (VIP, Basic, Premium, etc.)';
COMMENT ON COLUMN subscribers.credits IS 'Créditos disponibles (-1 = ilimitado)';
COMMENT ON COLUMN subscribers.status IS 'Estado de la cuenta (active/inactive)';
