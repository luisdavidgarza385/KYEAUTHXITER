-- MIGRACIÓN: Agregar soporte para Sub-sellers
-- Ejecuta esto en Supabase SQL Editor

-- Agregar columnas nuevas a la tabla sellers
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS parent_seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL;

-- Crear índice para búsquedas por padre
CREATE INDEX IF NOT EXISTS idx_sellers_parent ON sellers(parent_seller_id);

-- Verificar que se agregaron las columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sellers'
ORDER BY ordinal_position;
