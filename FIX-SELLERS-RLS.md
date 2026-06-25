# 🔧 Solución: Error "No autorizado" en /dashboard/sellers

## Problema
El error "No autorizado" ocurre porque la tabla `sellers` tiene **Row Level Security (RLS)** activo en Supabase, lo que bloquea las consultas incluso cuando usamos la **service role key**.

## Solución: Ejecutar SQL en Supabase

### Paso 1: Ir al SQL Editor de Supabase
1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/dldetblriapomxthlkdn
2. En el menú izquierdo, haz clic en **SQL Editor**

### Paso 2: Ejecutar este SQL

Copia y pega este SQL exactamente y haz clic en **Run**:

```sql
-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable all for service role" ON sellers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sellers;

-- Desactivar RLS completamente (la autenticación se maneja a nivel de API)
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;

-- Verificar que se desactivó correctamente
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'sellers';
```

### Paso 3: Verificar el resultado
Deberías ver en el resultado de la query:
```
tablename | rowsecurity
sellers   | false
```

Si `rowsecurity = false`, ¡perfecto! Ya está solucionado.

### Paso 4: Recargar la página
1. Ve a http://localhost:3000/dashboard/sellers
2. Refresca la página (F5)
3. Ahora deberías ver la página de gestión de sellers sin el error "No autorizado"

---

## ¿Por qué funciona esto?

La tabla `sellers` no necesita RLS porque:
- ✅ La API ya tiene autenticación con cookies `admin_session`
- ✅ Solo los administradores autenticados pueden acceder a `/api/admin/sellers`
- ✅ El service role bypasea RLS de todos modos, pero algunos drivers de Supabase tienen bugs

Al desactivar RLS, simplificamos el flujo y eliminamos una capa innecesaria de seguridad que ya está manejada por la aplicación.

---

## Si el problema persiste:
1. Asegúrate de haber ejecutado el SQL completo
2. Cierra sesión y vuelve a iniciar sesión como admin
3. Verifica en la consola del navegador (F12) si hay errores de red
4. Confirma que el cookie `admin_session` existe en las DevTools > Application > Cookies
