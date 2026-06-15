# KeyAuth Clone

Plataforma self-hosted de autenticación y gestión de licencias, similar a [KeyAuth](https://keyauth.cc). Construida con **Next.js 14 + TypeScript + Tailwind + Supabase (PostgreSQL)**.

## Features

- **Multi-aplicación**: crea y gestiona varias apps independientes
- **Licencias**: generación masiva, expiración por tiempo, HWID/IP lock, niveles
- **Usuarios**: registro, login, baneo, tracking de HWID e IP
- **Sesiones**: tokens con expiración automática (24h)
- **Variables**: configuración server-side que tu app consulta en runtime
- **Logs**: recibe eventos desde tu software (info/warn/error/debug)
- **API estilo KeyAuth**: `init → login/register → license → var → log → logout`
- **Panel admin**: dashboard moderno dark, login protegido, sin dependencias externas

## Stack

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14 (App Router), React, Tailwind |
| Backend    | Next.js API Routes (Node.js)      |
| Database   | Supabase / PostgreSQL             |
| Auth admin | Cookie + bcrypt (no Supabase Auth) |
| Deploy     | Vercel (1-click)                  |

## Setup

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratis
2. En **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo
3. Copia la **URL** y la **anon key** desde **Settings → API**
4. Copia la **service_role key** (⚠️ solo para el server, no la expongas)

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
ADMIN_BOOTSTRAP_EMAIL=admin@tu-dominio.com
ADMIN_BOOTSTRAP_PASSWORD=una-clave-fuerte-123
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y entra a **/dashboard/login** con las credenciales que pusiste en `ADMIN_BOOTSTRAP_*`. La primera vez se creará el admin automáticamente.

### 4. Deploy en Vercel

1. Sube el repo a GitHub
2. Importa en [vercel.com/new](https://vercel.com/new)
3. Agrega las mismas variables de entorno en **Settings → Environment Variables**
4. Deploy. Tu API quedará en `https://tu-app.vercel.app/api/1.0/...`

## API para tu software

Todos los endpoints aceptan JSON o `application/x-www-form-urlencoded`. Envía `appid` y `secret` (header `x-secret` o query) en cada request.

### 1) Init — crear sesión

```http
POST /api/1.0/init
Content-Type: application/json

{ "appid": "TU_APP_ID", "secret": "TU_APP_SECRET", "hwid": "abc123" }
```

Respuesta:
```json
{ "success": true, "data": { "sessionid": "...", "appinfo": { "name": "MiApp", "version": "1.0" } } }
```

### 2) Register — registrar usuario con license

```http
POST /api/1.0/register
{ "appid":"...", "secret":"...", "sessionid":"...", "username":"user1", "password":"pass", "key":"XXXXX-XXXXX-XXXXX-XXXXX", "hwid":"abc123" }
```

### 3) Login — autenticar usuario

```http
POST /api/1.0/login
{ "appid":"...", "secret":"...", "sessionid":"...", "username":"user1", "password":"pass", "hwid":"abc123" }
```

### 4) License — validar license key

```http
POST /api/1.0/license
{ "appid":"...", "secret":"...", "sessionid":"...", "key":"XXXXX-XXXXX-XXXXX-XXXXX", "hwid":"abc123" }
```

### 5) Var — leer variable

```http
POST /api/1.0/var
{ "appid":"...", "secret":"...", "sessionid":"...", "name":"update_url" }
```

### 6) Log — enviar log

```http
POST /api/1.0/log
{ "appid":"...", "secret":"...", "sessionid":"...", "message":"App started", "level":"info" }
```

### 7) Logout

```http
POST /api/1.0/logout
{ "appid":"...", "secret":"...", "sessionid":"..." }
```

## Estructura

```
keyauth-clone/
├── app/
│   ├── api/1.0/          # API estilo KeyAuth
│   ├── api/admin/        # API del panel admin
│   ├── dashboard/        # Panel admin (protegido)
│   ├── docs/             # Documentación pública
│   ├── layout.tsx
│   ├── page.tsx          # Landing
│   └── globals.css
├── components/           # Componentes UI
├── lib/                  # Utilidades + Supabase
├── supabase/schema.sql   # Schema de la base de datos
├── types/                # Tipos TypeScript
└── ...
```

## Seguridad

- Las passwords se hashean con **bcrypt (10 rounds)**
- Los secrets de aplicación se validan en cada request
- Las sesiones expiran en 24h y son invalidables
- El `app_secret` nunca debe exponerse en el cliente de tu software
- Row Level Security habilitado en Supabase (las policies se pueden añadir según necesidad)
- En producción, asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` solo se use en el server (ya está protegido, nunca se envía al cliente)

## Roadmap

- [ ] Reset password por email
- [ ] 2FA para el admin
- [ ] Webhooks salientes
- [ ] Seller panel con comisiones
- [ ] API key de solo-lectura para métricas
- [ ] App de ejemplo en C#/Python para integración

## Licencia

MIT — úsalo, modifícalo y véndelo como quieras.
