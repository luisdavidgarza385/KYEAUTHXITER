# 📋 Resumen Completo: Sistema de Sellers

## ✅ Lo que se ha creado

### 1. **Tabla de Sellers en Supabase**
- Ubicación del SQL: `supabase/sellers.sql`
- Campos: id, username, password_hash, seller_key, credits, unlimited_credits, can_use_api, status, created_at
- **RLS desactivado** (la autenticación se maneja a nivel de API)

### 2. **Dashboard de Admin para Sellers**
- Página: `/dashboard/sellers`
- Funciones:
  - ✅ Ver lista de sellers
  - ✅ Crear nuevo seller (username, contraseña, créditos ilimitados/limitados, acceso API)
  - ✅ Mostrar API key de cada seller
  - ✅ Copiar API key al portapapeles
  - ✅ Activar/Desactivar sellers
  - ✅ Regenerar API key
  - ✅ Eliminar seller

### 3. **Login y Dashboard del Seller**
- Login: `/seller/login` (3er tab en la pantalla de login principal)
- Dashboard: `/seller/dashboard`
- Sidebar con menú completo

### 4. **Páginas del Seller** ✅ NUEVO
- ✅ `/seller/api` - Documentación de API y configuración del bot de Discord
- ✅ `/seller/users` - **RECIÉN CREADO** - Lista de usuarios de las apps del seller

### 5. **API del Seller para Discord Bot**
- Endpoint público: `/api/seller/`
- Parámetros:
  - `sellerkey` (requerido): Tu API key
  - `type`: `add`, `info`, `balance`
  - `app_id` (requerido para 'add'): ID de la aplicación
  - `expiry`: Días de duración (default: 30)
  - `amount`: Cantidad de licencias (default: 1)
  - `level`: Nivel de acceso (default: 1)
  - `format`: `json` o `text` (default: json)

### 6. **Bot de Discord** 🤖
- Ubicación: `discord-bot-example/`
- Archivos:
  - `bot.js` - Código completo del bot
  - `package.json` - Dependencias
  - `README.md` - Documentación completa

- **Comandos del Bot:**
  - `!generar [cantidad] [días]` - Genera licencias (envía por DM)
  - `!balance` - Muestra créditos disponibles
  - `!ayuda` - Muestra ayuda

- **Configuración necesaria:**
  ```env
  BOT_TOKEN=tu_token_de_discord
  SELLER_KEY=tu_api_key_del_seller
  API_URL=https://tu-dominio.vercel.app
  APP_ID=id_de_tu_aplicacion
  ```

### 7. **API Interna del Seller** (autenticada con cookie)
Endpoints protegidos para el dashboard del seller:

- **GET** `/api/seller/me` - Info del seller autenticado
- **POST** `/api/seller/login` - Login de seller
- **POST** `/api/seller/logout` - Logout
- **GET** `/api/seller/stats` - Estadísticas
- **GET** `/api/seller/apps` - Lista de apps del seller
- **GET** `/api/seller/users?app_id=XXX` - **NUEVO** - Lista de usuarios
- **PATCH** `/api/seller/users/[id]` - **NUEVO** - Banear/desbanear usuario
- **DELETE** `/api/seller/users/[id]` - **NUEVO** - Eliminar usuario

### 8. **Endpoints de Admin**
- **GET** `/api/admin/sellers` - Listar sellers
- **POST** `/api/admin/sellers` - Crear seller
- **PATCH** `/api/admin/sellers/[id]` - Actualizar seller
- **DELETE** `/api/admin/sellers/[id]` - Eliminar seller
- **POST** `/api/admin/sellers/[id]/regenerate` - Regenerar API key

---

## 🔧 SOLUCIÓN AL ERROR "No autorizado"

### Problema
El error ocurre porque la tabla `sellers` tiene **Row Level Security (RLS)** activo en Supabase, bloqueando las consultas.

### Solución: Ejecutar SQL en Supabase

**PASO 1:** Ve a tu proyecto de Supabase
- URL: https://supabase.com/dashboard/project/dldetblriapomxthlkdn
- Click en **SQL Editor** (menú izquierdo)

**PASO 2:** Copia y pega este SQL completo:

```sql
-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Enable all for service role" ON sellers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sellers;

-- Desactivar RLS (la autenticación se hace en la API)
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'sellers';
```

**PASO 3:** Haz click en **"Run"**

**PASO 4:** Verifica el resultado:
```
tablename | rowsecurity
sellers   | false
```
Si `rowsecurity = false`, ¡todo está bien!

**PASO 5:** 
1. Ve a http://localhost:3000/dashboard/sellers
2. Presiona F5 para recargar
3. ✅ Ahora debería funcionar sin errores

---

## 📝 Cómo usar el sistema

### Para el Admin:

1. **Crear un Seller:**
   - Ve a `/dashboard/sellers`
   - Click en "Crear Seller"
   - Completa el formulario:
     - Username
     - Contraseña
     - Tipo de créditos (Ilimitado / Limitado)
     - Acceso a API (checkbox)
   - Click en "Crear Seller"
   - **¡Copia el API Key!** (se muestra en la tarjeta del seller)

2. **Asignar App a un Seller:**
   - Ve a `/dashboard/apps`
   - Edita una app existente
   - En el campo "Seller ID" pega el ID del seller
   - Guarda cambios

### Para el Seller:

1. **Login:**
   - Ve a `/login`
   - Click en el tab "Seller"
   - Ingresa username y contraseña
   - Accede al dashboard

2. **Ver API Key:**
   - En el sidebar, click en "API & Discord Bot"
   - Tu API key se muestra arriba
   - Click en el botón de copiar

3. **Configurar Bot de Discord:**
   - Sigue las instrucciones en `discord-bot-example/README.md`
   - Configura el archivo `.env` con:
     - Tu token de Discord
     - Tu API key del seller
     - La URL de tu API (Vercel)
     - El ID de la app

4. **Ver Usuarios:**
   - Click en "Usuarios" en el sidebar
   - Selecciona una app del dropdown
   - Verás la lista de usuarios registrados
   - Puedes banear/desbanear o eliminar usuarios

---

## 🌐 Ejemplo de URL del Bot

```
https://tu-dominio.vercel.app/api/seller/?sellerkey=abc123&type=add&app_id=d-9067c98495.xxx&expiry=30&amount=5&level=1&format=json
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "5 licencia(s) creada(s)",
  "data": {
    "licenses": [
      "A3B9-5F2C-8D1E-4G7H",
      "K2L8-9M3N-6P1Q-5R4S",
      ...
    ],
    "count": 5,
    "expiry_days": 30,
    "level": 1,
    "expires_at": "2026-07-25T12:00:00.000Z"
  }
}
```

---

## 📦 Archivos Creados/Modificados

### Nuevos archivos creados en esta sesión:
1. ✅ `app/seller/users/page.tsx` - Lista de usuarios del seller
2. ✅ `app/api/seller/users/route.ts` - API para listar usuarios
3. ✅ `app/api/seller/users/[id]/route.ts` - API para acciones sobre usuarios
4. ✅ `FIX-SELLERS-RLS.md` - Instrucciones para solucionar el error RLS
5. ✅ `RESUMEN-SELLERS-COMPLETO.md` - Este archivo

### Archivos modificados:
1. ✅ `supabase/sellers.sql` - RLS desactivado
2. ✅ `app/api/seller/apps/route.ts` - Corregido para buscar apps por ownerId y sellerId

---

## 🎯 Siguiente Paso Inmediato

**EJECUTA EL SQL EN SUPABASE AHORA:**

1. Ve a: https://supabase.com/dashboard/project/dldetblriapomxthlkdn/editor
2. Click en **SQL Editor**
3. Copia el SQL de arriba (sección "PASO 2")
4. Click en **Run**
5. Recarga `/dashboard/sellers`

---

## ✨ Funciones Faltantes (Opcional para futuro)

Páginas del seller que aún no existen (tienen enlaces en el sidebar pero no están creadas):
- `/seller/licenses` - Gestión de licencias
- `/seller/apps` - Gestión de apps (página visual, el endpoint ya existe)
- `/seller/credits` - Ver historial de créditos
- `/seller/security` - Cambiar contraseña, 2FA
- `/seller/settings` - Configuración general

Estas se pueden crear después si el usuario las necesita.

---

## 💡 Tips

- Los sellers solo ven las apps donde `seller_id = su_id` o `owner_id = su_id`
- Los créditos ilimitados se representan como `999999999` en la DB
- El bot envía las licencias por **DM (mensaje directo)** al usuario
- La API key se genera automáticamente al crear el seller
- La API pública `/api/seller/` no requiere autenticación (usa seller_key en URL)
- La API interna `/api/seller/xxx` requiere cookie `seller_session`
