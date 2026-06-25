-- FIX: Arreglar foreign key de licenses.created_by
-- Debe aceptar tanto admin_users(id) como sellers(id)

-- Paso 1: Eliminar la constraint antigua
ALTER TABLE licenses 
DROP CONSTRAINT IF EXISTS licenses_created_by_fkey;

-- Paso 2: Como no se puede tener FK a dos tablas diferentes,
-- convertimos created_by en un campo UUID sin FK
-- (validaremos en la aplicación si es admin o seller)

-- La columna ya existe como UUID, solo quitamos la constraint
-- Ahora puede ser ID de admin O ID de seller

-- Verificar que se eliminó
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='licenses'
  AND kcu.column_name = 'created_by';

-- Si no hay resultados, la FK fue eliminada correctamente
