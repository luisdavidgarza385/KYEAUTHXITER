# Sistema de Sellers - KeyAuth Clone

## 📋 Descripción

El sistema de Sellers permite al administrador crear cuentas independientes que pueden:
- Tener su propio login en `/seller/login`
- Crear sus propias aplicaciones
- Gestionar licencias de sus aplicaciones
- Tener créditos ilimitados o limitados
- Opcionalmente tener acceso a la API de Seller

## 🏗️ Arquitectura

### Base de Datos

```sql
CREATE TABLE sellers (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  seller_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  unlimited_credits BOOLEAN NOT NULL DEFAULT false,
  can_use_api BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🚀 Instalación

### 1. Ejecutar SQL en Supabase

Ve a tu proyecto de Supabase > SQL Editor y ejecuta:

```bash
supabase/sellers.sql
```

### 2. El sistema ya está desplegado

Vercel detectará automáticamente el push y desplegará los cambios.

## 📍 Rutas

### Admin (Dashboard)
- `/dashboard/sellers` - Gestión de sellers (crear, editar, eliminar)

### Sellers
- `/seller/login` - Login de sellers
- `/seller/dashboard` - Dashboard del seller
  - Ver sus créditos
  - Ver su API key (si tiene acceso)
  - Crear nuevas aplicaciones
  - Ver lista de sus aplicaciones

### API Endpoints

#### Admin APIs
- `POST /api/admin/sellers` - Crear seller
- `GET /api/admin/sellers` - Listar todos los sellers
- `PATCH /api/admin/sellers/[id]` - Actualizar seller
- `DELETE /api/admin/sellers/[id]` - Eliminar seller
- `POST /api/admin/sellers/[id]/regenerate` - Regenerar API key

#### Seller APIs
- `POST /api/seller/login` - Login de seller
- `POST /api/seller/logout` - Logout de seller
- `GET /api/seller/me` - Información del seller actual
- `GET /api/seller/apps` - Listar aplicaciones del seller
- `POST /api/seller/apps` - Crear nueva aplicación

## 🎯 Uso

### Como Administrador

1. **Ir a Dashboard > Sellers**
   
2. **Crear un Seller**
   - Click en "Crear Seller"
   - Ingresar username y password
   - Elegir si quieres darle acceso a API
   - Elegir si tiene créditos ilimitados o limitados
   - Si es limitado, definir cantidad de créditos

3. **Gestionar Sellers**
   - Ver todos los sellers creados
   - Activar/Desactivar sellers
   - Regenerar API keys
   - Eliminar sellers
   - Ver sus créditos restantes

### Como Seller

1. **Login en `/seller/login`**
   - Usar username y password proporcionado por el admin

2. **En el Dashboard**
   - Ver tus créditos disponibles
   - Ver tu API key (si tienes acceso)
   - Crear nuevas aplicaciones con el botón "Nueva Aplicación"
   - Cada aplicación es completamente independiente

3. **Aplicaciones**
   - Cada seller puede crear sus propias aplicaciones
   - Las aplicaciones tienen su propio app_id único
   - Los sellers pueden gestionar licencias de sus apps
   - Son completamente independientes de otras apps

## 💳 Sistema de Créditos

### Créditos Ilimitados
- El seller puede crear aplicaciones sin límite
- No se descuentan créditos

### Créditos Limitados
- Cada acción consume créditos
- El admin define la cantidad inicial
- Cuando se acaban, el seller no puede crear más recursos

## 🔑 API de Seller (Opcional)

Si el seller tiene `can_use_api: true`, puede usar la API externa:

```bash
/api/seller/?sellerkey=XXXX&type=add&app_id=APP_ID&expiry=30&amount=10&level=1&format=json
```

Parámetros:
- `sellerkey` - La clave única del seller
- `type` - Acción a realizar (add, delete, etc)
- `app_id` - ID de la aplicación
- `expiry` - Días de duración de la licencia
- `amount` - Cantidad de licencias a generar
- `level` - Nivel de la licencia
- `format` - json o text

## 🎨 Interfaz

### Dashboard Admin - Sellers
- Tarjetas con información de cada seller
- Username, status, créditos
- API key visible con botón de copiar
- Botones de activar/desactivar, regenerar key, eliminar

### Dashboard Seller
- Estadísticas: Créditos, Aplicaciones, Acceso API
- API Key visible (si tiene acceso)
- Grid de aplicaciones creadas
- Modal para crear nuevas aplicaciones

## 🔒 Seguridad

- Passwords hasheados con bcrypt
- Sesiones con cookies httpOnly
- API keys únicas generadas con crypto.randomBytes
- Validación de permisos en cada endpoint
- Status activo/inactivo para control de acceso

## 📝 Notas

- Los sellers NO pueden acceder al dashboard del admin
- Los sellers solo ven y gestionan sus propias aplicaciones
- El admin tiene control total sobre todos los sellers
- Las aplicaciones de sellers son completamente independientes
- Los créditos se pueden recargar desde el panel del admin

## 🆕 Diferencias con el sistema anterior

**ELIMINADO:**
- ❌ Revendedores (confuso)
- ❌ Suscriptores (confuso)
- ❌ Suscripciones (innecesario)
- ❌ Sub-resellers (redundante)
- ❌ Sub-usuarios (redundante)

**NUEVO:**
- ✅ Sistema unificado de "Sellers"
- ✅ Login independiente en `/seller/login`
- ✅ Dashboard propio para sellers
- ✅ Sellers pueden crear aplicaciones propias
- ✅ Sistema de créditos limpio
- ✅ API key opcional
- ✅ Interfaz simplificada

## 🔄 Flujo Completo

```
Admin crea Seller
    ↓
Seller recibe username/password
    ↓
Seller hace login en /seller/login
    ↓
Seller ve su dashboard
    ↓
Seller crea aplicaciones
    ↓
Aplicaciones funcionan independientemente
    ↓
Admin monitorea desde /dashboard/sellers
```
