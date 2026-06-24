# 💳 Sistema de Planes de Suscripción - KeyAuth

## 🎯 ¿Qué es?

Un sistema completo de planes de suscripción que permite a los revendedores crear diferentes niveles de acceso con precios y duraciones personalizadas.

## ✨ Características

- ✅ Crear planes ilimitados por aplicación
- ✅ Precios personalizados ($0.99 hasta $999+)
- ✅ Duraciones flexibles (1 día, 1 mes, 1 año, lifetime)
- ✅ Niveles de acceso (1-5)
- ✅ Lista de características por plan
- ✅ Activar/desactivar planes
- ✅ UI moderna y responsive

## 📦 Instalación

### 1. Crear la tabla en Supabase

Ve a tu proyecto de Supabase → SQL Editor → Ejecuta:

```sql
-- Leer y ejecutar el contenido de: supabase/subscription_plans.sql
```

O copia este código:

```sql
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

CREATE INDEX IF NOT EXISTS idx_subscription_plans_app_id ON subscription_plans(app_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);
```

### 2. Reiniciar servidor (si es local)

```bash
npm run dev
```

### 3. Acceder al dashboard

Ve a: `https://tu-dominio.com/dashboard/subscriptions`

## 🎨 Cómo Usar

### 1. Crear un Plan

1. Ve a **Dashboard → Suscripciones**
2. Selecciona tu aplicación
3. Click en **"Crear Plan"**
4. Completa el formulario:

```
Nombre: Plan Premium
Descripción: Acceso completo con soporte VIP
Precio: 29.99
Duración: 30 días (1 mes)
Nivel: 3 - Avanzado
Características:
  - Acceso completo
  - Soporte prioritario 24/7
  - Sin anuncios
  - Actualizaciones gratis
  - 50GB de almacenamiento
```

5. Click **"Crear Plan"**

### 2. Ejemplos de Planes

#### Plan Básico
```
Nombre: Plan Básico
Precio: $9.99
Duración: 30 días
Nivel: 1
Características:
  - Funciones básicas
  - Soporte por email
  - 5GB almacenamiento
```

#### Plan Pro
```
Nombre: Plan Pro
Precio: $29.99
Duración: 30 días
Nivel: 2
Características:
  - Todas las funciones
  - Soporte prioritario
  - 25GB almacenamiento
  - Sin anuncios
```

#### Plan VIP Anual
```
Nombre: Plan VIP Anual
Precio: $299.99
Duración: 365 días
Nivel: 5
Características:
  - Acceso ilimitado
  - Soporte VIP 24/7
  - 500GB almacenamiento
  - Actualizaciones beta
  - API personalizada
```

#### Plan Lifetime
```
Nombre: Acceso Permanente
Precio: $999.99
Duración: -1 (Permanente)
Nivel: 5
Características:
  - Acceso de por vida
  - Todo ilimitado
  - Soporte VIP prioritario
  - Todas las actualizaciones futuras
```

## 🔧 Duraciones Disponibles

| Valor | Descripción | Uso |
|-------|-------------|-----|
| 1 | 1 día | Pruebas, demos |
| 7 | 1 semana | Promociones |
| 30 | 1 mes | Plan mensual estándar |
| 90 | 3 meses | Plan trimestral |
| 180 | 6 meses | Plan semestral |
| 365 | 1 año | Plan anual con descuento |
| 730 | 2 años | Plan bianual |
| -1 | Lifetime | Acceso permanente |

## 💰 Estrategias de Precios

### Freemium
```
Plan Gratis: $0 (7 días) - Nivel 1
Plan Pro: $9.99/mes - Nivel 2
Plan Premium: $29.99/mes - Nivel 3
```

### Descuento por Compromiso
```
Mensual: $19.99/mes
Trimestral: $49.99 (ahorro 17%)
Anual: $179.99 (ahorro 25%)
```

### Tiers Progresivos
```
Starter: $4.99/mes - 1 usuario
Team: $19.99/mes - 5 usuarios
Business: $49.99/mes - 20 usuarios
Enterprise: $199.99/mes - Ilimitado
```

## 📊 Integración con tu Software

Los usuarios compran planes y obtienen una licencia que validan así:

### En PHP:
```php
<?php
require_once 'KeyAuth.php';

$keyAuth = new KeyAuth('APP_ID', 'SECRET', 'API_URL');
$keyAuth->init();

if ($keyAuth->license('XXXXX-XXXXX-XXXXX-XXXXX')) {
    $userData = $keyAuth->getUserData();
    $level = $userData['level']; // Nivel del plan (1-5)
    
    if ($level >= 3) {
        // Usuario tiene Plan Premium o superior
        echo "Acceso a funciones premium";
    } else {
        echo "Acceso básico";
    }
} else {
    echo "Licencia inválida";
}
```

### En Python:
```python
import keyauth

auth = keyauth.api("APP_ID", "SECRET", "API_URL")
auth.init()

if auth.license("XXXXX-XXXXX-XXXXX-XXXXX"):
    level = auth.user_data.level
    
    if level >= 3:
        print("Acceso premium")
    else:
        print("Acceso básico")
else:
    print("Licencia inválida")
```

## 🎯 Niveles de Acceso

Usa los niveles para controlar funciones:

```javascript
// Ejemplo en tu software
switch(userLevel) {
    case 1: // Básico
        enableFeature('basic');
        break;
    case 2: // Intermedio
        enableFeature('basic');
        enableFeature('advanced');
        break;
    case 3: // Avanzado
        enableFeature('basic');
        enableFeature('advanced');
        enableFeature('premium');
        break;
    case 4: // Premium
        enableAll();
        break;
    case 5: // VIP
        enableAll();
        enableFeature('vip_support');
        enableFeature('beta_access');
        break;
}
```

## 🛍️ Flujo de Compra Recomendado

1. **Usuario visita tu sitio web**
   ```
   https://tu-sitio.com/pricing
   ```

2. **Muestra los planes disponibles**
   ```
   GET /api/admin/subscription-plans?app_id=TU_APP_ID
   ```

3. **Usuario selecciona un plan**
   ```
   Plan Pro - $29.99/mes
   ```

4. **Procesas el pago** (Stripe, PayPal, etc.)

5. **Generas la licencia**
   ```
   POST /api/admin/licenses
   {
     "app_id": "...",
     "duration_days": 30,
     "level": 2,
     "key": "XXXXX-XXXXX-XXXXX-XXXXX"
   }
   ```

6. **Envías la licencia al cliente**
   ```
   Email: "Tu licencia: XXXXX-XXXXX-XXXXX-XXXXX"
   ```

7. **Cliente usa la licencia en tu software**

## 🔄 Renovaciones Automáticas

Para implementar renovaciones:

1. Guarda el `subscription_id` del cliente
2. Usa webhooks de tu procesador de pagos (Stripe/PayPal)
3. Cuando llegue el pago:
   - Extiende la licencia existente
   - O genera una nueva licencia
   - Notifica al cliente

## 📱 API Endpoints

### Listar Planes
```
GET /api/admin/subscription-plans?app_id=APP_ID
```

### Crear Plan
```
POST /api/admin/subscription-plans
Body: {
  "app_id": "...",
  "name": "Plan Pro",
  "description": "...",
  "price": 29.99,
  "duration_days": 30,
  "level": 2,
  "features": ["Feature 1", "Feature 2"],
  "status": "active"
}
```

### Actualizar Plan
```
PATCH /api/admin/subscription-plans/PLAN_ID
Body: { "status": "inactive" }
```

### Eliminar Plan
```
DELETE /api/admin/subscription-plans/PLAN_ID
```

## 🎨 Personalización UI

Los planes se muestran en cards con:
- ✅ Nombre y descripción
- ✅ Precio destacado
- ✅ Duración (automática: "1 mes", "1 año", etc.)
- ✅ Nivel de acceso
- ✅ Lista de características con checkmarks
- ✅ Estado (Activo/Inactivo)
- ✅ Botones de acción

## 🚀 Casos de Uso

### Software as a Service (SaaS)
```
Starter: $9/mes - 1GB storage
Pro: $29/mes - 10GB storage
Business: $99/mes - Ilimitado
```

### Aplicación Desktop
```
Trial: $0 (7 días)
Standard: $49 (un pago)
Pro: $99 (un pago)
Lifetime: $299 (un pago)
```

### API Service
```
Free: $0 - 1,000 requests/mes
Basic: $19/mes - 10,000 requests
Pro: $99/mes - 100,000 requests
Enterprise: Contactar ventas
```

### Gaming/Cheats
```
Daily: $4.99 (1 día)
Weekly: $19.99 (7 días)
Monthly: $49.99 (30 días)
Lifetime: $199.99 (permanente)
```

## 🔐 Mejores Prácticas

1. **Validar siempre el nivel de acceso en tu software**
2. **Verificar expiración de licencias periódicamente**
3. **Mostrar fecha de vencimiento al usuario**
4. **Enviar recordatorios de renovación**
5. **Ofrecer upgrade fácil entre planes**
6. **Dar trials gratuitos para conversión**
7. **Usar analytics para optimizar precios**

## 📊 Analítica Recomendada

Trackea:
- Conversión por plan (cual se vende más)
- Tasa de renovación
- Lifetime Value por usuario
- Churn rate
- Revenue por plan
- Upgrades/Downgrades

## ❓ FAQ

**Q: ¿Puedo cambiar el precio de un plan?**
A: Sí, edita el plan. Los usuarios existentes mantienen su precio hasta renovar.

**Q: ¿Puedo tener planes con mismo nombre pero distinto precio?**
A: Sí, pero no es recomendado. Mejor usa nombres distintos.

**Q: ¿Los planes lifetime (-1 días) expiran?**
A: No, son permanentes.

**Q: ¿Puedo tener planes gratis?**
A: Sí, precio = $0.

**Q: ¿Límite de planes por app?**
A: Ilimitados.

**Q: ¿Los usuarios ven estos planes?**
A: No directamente. Tú los muestras en tu web/app.

## 🎉 ¡Listo para Usar!

Tu sistema de suscripciones está completamente configurado y listo para generar ingresos recurrentes.

---

**Soporte:** spectralx@gmail.com
**Dashboard:** https://tu-dominio.com/dashboard/subscriptions
