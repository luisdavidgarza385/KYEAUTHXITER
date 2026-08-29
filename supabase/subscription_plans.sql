-- Crear tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY DEFAULT (
    extract(epoch from now())::bigint::text || '-' || 
    substr(md5(random()::text), 1, 8) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 4) || '-' || 
    substr(md5(random()::text), 1, 12)
  ),
  app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  level INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_subscription_plans_app_id ON subscription_plans(app_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);

-- Comentarios
COMMENT ON TABLE subscription_plans IS 'Planes de suscripción para las aplicaciones';
COMMENT ON COLUMN subscription_plans.app_id IS 'ID de la aplicación a la que pertenece el plan';
COMMENT ON COLUMN subscription_plans.name IS 'Nombre del plan (ej: Plan Básico, Plan Pro)';
COMMENT ON COLUMN subscription_plans.description IS 'Descripción del plan';
COMMENT ON COLUMN subscription_plans.price IS 'Precio del plan';
COMMENT ON COLUMN subscription_plans.duration_days IS 'Duración en días (30=1 mes, 365=1 año, -1=permanente)';
COMMENT ON COLUMN subscription_plans.level IS 'Nivel de acceso (1-5)';
COMMENT ON COLUMN subscription_plans.features IS 'Array JSON de características del plan';
COMMENT ON COLUMN subscription_plans.status IS 'Estado del plan (active/inactive)';
