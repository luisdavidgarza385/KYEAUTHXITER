-- ASIGNAR APP AL SELLER "BOOS"
-- Ejecuta esto en Supabase SQL Editor

-- 1. Buscar el ID del seller "BOOS"
-- 2. Asignar el app al seller

UPDATE applications
SET seller_id = (SELECT id FROM sellers WHERE username = 'BOOS' LIMIT 1)
WHERE app_id = 'd-9067c98495.34b8c4a8-30e1-708a-5a9a-85645d5372d4';

-- Verificar
SELECT 
  a.name as app_name,
  a.app_id,
  s.username as seller_username,
  s.seller_key
FROM applications a
LEFT JOIN sellers s ON a.seller_id = s.id
WHERE a.app_id = 'd-9067c98495.34b8c4a8-30e1-708a-5a9a-85645d5372d4';
