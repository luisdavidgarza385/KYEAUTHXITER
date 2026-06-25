-- FIX: Cambiar la foreign key de applications.seller_id
-- Actualmente apunta a admin_users(id) pero debe apuntar a sellers(id)

-- Paso 1: Eliminar la constraint antigua
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_seller_id_fkey;

-- Paso 2: Crear la nueva constraint apuntando a sellers(id)
ALTER TABLE applications 
ADD CONSTRAINT applications_seller_id_fkey 
FOREIGN KEY (seller_id) 
REFERENCES sellers(id) 
ON DELETE SET NULL;

-- Verificar
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='applications'
  AND kcu.column_name = 'seller_id';
