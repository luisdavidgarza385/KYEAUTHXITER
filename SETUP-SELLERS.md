# 🚀 Setup: Sistema de Sellers

## ⚠️ IMPORTANTE - Ejecutar SQL en Supabase

Para que el sistema de Sellers funcione, **DEBES** ejecutar el SQL en tu base de datos de Supabase.

### 📝 Pasos para ejecutar el SQL:

#### 1. Ve a tu proyecto de Supabase
```
https://supabase.com/dashboard
```

#### 2. Abre el SQL Editor
- Click en el ícono de SQL (</>) en el menú lateral
- O ve a: `SQL Editor` en el menú

#### 3. Ejecuta el SQL de Sellers

**Copia y pega este código completo:**

```sql
-- ============================================
-- TABLA DE SELLERS
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS sellers CASCADE;

-- Crear tabla de sellers
CREATE TABLE sellers (
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

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sellers_username ON sellers(username);
CREATE INDEX IF NOT EXISTS idx_sellers_seller_key ON sellers(seller_key);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- Comentarios para documentación
COMMENT ON TABLE sellers IS 'Tabla de sellers que pueden crear apps y licencias';
COMMENT ON COLUMN sellers.id IS 'ID único del seller';
COMMENT ON COLUMN sellers.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN sellers.password_hash IS 'Password hasheado con bcrypt';
COMMENT ON COLUMN sellers.seller_key IS 'API key única para uso externo';
COMMENT ON COLUMN sellers.credits IS 'Créditos disponibles (999999999 = ilimitado)';
COMMENT ON COLUMN sellers.unlimited_credits IS 'Si tiene créditos ilimitados';
COMMENT ON COLUMN sellers.can_use_api IS 'Si puede usar la API externa';
COMMENT ON COLUMN sellers.status IS 'Estado: active o inactive';

-- Enable RLS (Row Level Security)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Policies para Supabase (permitir todo desde service_role)
CREATE POLICY "Enable all for service role" ON sellers
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Policy para lectura pública (opcional, ajusta según necesites)
CREATE POLICY "Enable read for authenticated users" ON sellers
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sellers'
ORDER BY ordinal_position;

-- Mostrar índices creados
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'sellers';
```

#### 4. Click en "RUN" o presiona `Ctrl + Enter`

Deberías ver un mensaje de éxito: ✅ `Success. No rows returned`

#### 5. Verificar que la tabla existe

Ejecuta este query para verificar:

```sql
SELECT * FROM sellers LIMIT 1;
```

Debería retornar: `No rows` (tabla vacía pero existe)

### 🔍 Solución de Problemas

#### Error: "No autorizado"
- ✅ Asegúrate de haber ejecutado el SQL arriba
- ✅ Verifica que estés logueado como admin
- ✅ Recarga la página después de ejecutar el SQL

#### Error: "relation sellers does not exist"
- ❌ No has ejecutado el SQL aún
- 🔧 Solución: Ejecuta el SQL del paso 3

#### Error: "permission denied"
- ❌ Las policies de RLS están mal configuradas
- 🔧 Solución: Ejecuta el SQL completo nuevamente

### ✅ Confirmar que funciona

1. Ve a `/dashboard/sellers` en tu KeyAuth
2. Deberías ver la página sin errores
3. Intenta crear un seller de prueba

### 📦 Orden de ejecución de SQL

Si es tu primera vez, ejecuta en este orden:

1. **`sellers.sql`** ← ESTE PRIMERO
2. `subscription_plans.sql` (opcional)
3. `subscribers.sql` (opcional)

### 🔐 Seguridad

- ✅ Los passwords se hashean con bcrypt
- ✅ Las API keys son únicas y aleatorias
- ✅ RLS está habilitado para seguridad
- ✅ Solo service_role puede modificar

### 📝 Notas

- La tabla se puede borrar y recrear sin problemas (DROP TABLE)
- Los créditos `999999999` significa "ilimitado" en la práctica
- `unlimited_credits: true` es la bandera correcta para créditos ilimitados
- El `seller_key` se genera automáticamente al crear un seller

### 🆘 ¿Necesitas ayuda?

Si después de ejecutar el SQL sigues viendo errores:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca la petición a `/api/admin/sellers`
5. Copia el error exacto y compártelo
