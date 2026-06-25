# 🛒 Guía: Tienda Web Pública para Sellers

## ¿Qué es la Tienda Web?

La **Tienda Web** es una página pública donde tus clientes pueden generar licencias automáticamente sin necesidad de usar Discord bots o APIs directamente. Es como tener tu propia "Web Loader" personalizada.

## 🌐 URL de Acceso

Cada seller tiene su propia URL única:

```
https://tu-dominio.vercel.app/store/[SELLER_KEY]
```

**Ejemplo:**
```
https://keyauth-pro.vercel.app/store/abc123def456xyz789
```

## ✨ Características

### Para el Cliente (Usuario Final):
- ✅ Formulario simple y moderno
- ✅ Ingresa: usuario, email (opcional), Discord tag (opcional)
- ✅ Selecciona: App ID, días de duración, cantidad de licencias
- ✅ Genera licencias al instante
- ✅ Copia las licencias fácilmente
- ✅ Recibe notificación por email/Discord (configurable)
- ✅ UI con gradientes y animaciones modernas

### Para el Seller:
- ✅ No requiere programación
- ✅ Enlace único y fácil de compartir
- ✅ Se integra con tu API de seller existente
- ✅ Consume automáticamente tus créditos
- ✅ Branding personalizable (nombre del seller)

## 🔗 Cómo Obtener tu Enlace

### Método 1: Desde el Dashboard
1. Inicia sesión como seller
2. Ve a **"API & Discord Bot"** en el sidebar
3. En la sección **"Tienda Web Pública"**:
   - Verás tu enlace completo
   - Haz click en **"Copiar"** para copiarlo
   - Haz click en **"Abrir Tienda"** para verla

### Método 2: Manual
Tu enlace es:
```
[TU_URL]/store/[TU_SELLER_KEY]
```

Donde `[TU_SELLER_KEY]` es la API key que ves en el dashboard.

## 📋 Flujo de Uso

### 1. **Cliente accede a tu tienda web**
   - Visita: `tu-dominio.com/store/abc123`

### 2. **Cliente completa el formulario**
   ```
   Usuario: *          juan_gamer
   Email:              juan@email.com (opcional)
   Discord:            juan#1234 (opcional)
   App ID: *           d-9067c98495.xxx-xxx
   Días:               30 días
   Cantidad:           1
   ```

### 3. **Cliente hace click en "Generar Licencia"**

### 4. **Sistema procesa:**
   - Valida el seller key
   - Verifica créditos disponibles
   - Genera licencias usando la API
   - Descuenta créditos del seller

### 5. **Cliente recibe:**
   - ✅ Licencias mostradas en pantalla
   - ✅ Botón de copiar para cada licencia
   - ✅ Notificación enviada a email/Discord (si configurado)

## 🎨 Personalización

### Colores y Tema
El tema actual usa:
- Fondo: Gradiente oscuro (gris → verde esmeralda)
- Acento: Verde esmeralda (#10b981)
- Tarjetas: Gris oscuro con blur
- Efectos: Sombras y bordes brillantes

### Branding
El nombre del seller aparece automáticamente:
```
"Tienda de [USERNAME]"
```

## 🔒 Seguridad

### Lo que se verifica:
- ✅ Seller key válido
- ✅ Seller activo (no suspendido)
- ✅ Créditos suficientes
- ✅ App ID existe
- ✅ Límites de cantidad (máx 10 licencias por request)

### Lo que NO se expone:
- ❌ Información del seller (email, contraseña)
- ❌ Créditos totales
- ❌ Otras apps del seller
- ❌ API key completa (solo se usa internamente)

## 📧 Notificaciones (Configuración Futura)

El sistema ya tiene la estructura para enviar notificaciones:

### Email
```javascript
// En /api/store/notify
// TODO: Configurar nodemailer, sendgrid, resend, etc.
```

### Discord Webhook
```javascript
// TODO: Enviar mensaje a webhook con:
// - Usuario que generó
// - Licencias generadas
// - Duración
```

### Configuración Recomendada
1. Agregar variables de entorno:
   ```env
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=xxx
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
   ```

2. Implementar lógica en `/api/store/notify/route.ts`

## 🚀 Casos de Uso

### 1. Venta de Licencias
- Cliente compra en tu tienda (Stripe, PayPal, etc.)
- Cliente recibe el enlace de tu Web Store
- Cliente genera su licencia
- Sistema valida el pago antes de generar

### 2. Distribución Gratuita
- Compartes el enlace en Discord/Telegram
- Los usuarios generan licencias gratis
- Controlas límites con tus créditos

### 3. Programa de Referidos
- Afiliados reciben tu enlace de Web Store
- Cada licencia generada se rastrea
- Pagas comisiones basadas en uso

### 4. Discord Bot Alternativo
- En lugar de bot de Discord, usas Web Store
- Más simple para usuarios no técnicos
- No requiere configurar bot

## 📊 Monitoreo

### Desde el Dashboard:
- Ve a **"Créditos"** para ver:
  - Créditos restantes
  - Historial de licencias generadas
  - Quién generó qué

### Logs (Futuro):
- Fecha/hora de generación
- IP del cliente
- Usuario ingresado
- Cantidad generada

## 🔧 Mantenimiento

### Cambiar Seller Key
Si regeneras tu seller key:
1. El enlace antiguo deja de funcionar
2. Obtienes nuevo enlace automáticamente
3. Actualiza donde hayas compartido el enlace

### Suspender Tienda
Para desactivar temporalmente:
1. Admin cambia tu status a "inactive"
2. La tienda muestra "Seller inactivo"
3. No se pueden generar más licencias

## 💡 Tips y Mejores Prácticas

1. **Acorta tu URL:**
   ```
   bit.ly/mi-tienda-keys
   → Redirige a tu Web Store
   ```

2. **Agrega instrucciones:**
   - Crea un video tutorial
   - Pin en Discord explicando el proceso

3. **Limita cantidad:**
   - Configura máximo de licencias por request
   - Evita abuso

4. **Monitorea créditos:**
   - Revisa frecuentemente
   - Configura alertas cuando estés bajo

5. **Personaliza el mensaje:**
   - Edita el formulario según tus necesidades
   - Agrega campos custom

## 🎯 Próximos Pasos

Para usar tu Web Store ahora mismo:

1. **Obtén tu enlace:**
   - Dashboard → API & Discord Bot → Copiar enlace

2. **Compártelo:**
   - Discord
   - Telegram
   - Redes sociales
   - Email

3. **Prueba:**
   - Abre el enlace
   - Genera una licencia de prueba
   - Verifica que funciona

4. **Configura notificaciones (opcional):**
   - Edita `/app/api/store/notify/route.ts`
   - Agrega tu email/webhook

---

## 🆚 Web Store vs Discord Bot

| Característica | Web Store | Discord Bot |
|---------------|-----------|-------------|
| Configuración | ✅ Cero config | ❌ Requiere token + hosting |
| Uso | ✅ Cualquier navegador | ❌ Solo Discord |
| UI | ✅ Moderna y visual | ❌ Solo texto |
| Email | ✅ Soportado | ❌ No disponible |
| Mobile | ✅ Responsive | ⚠️ App Discord |
| Personalización | ✅ HTML/CSS | ❌ Solo mensajes |

## 📝 Ejemplo Visual

```
┌─────────────────────────────────────┐
│  🔑 Tienda de SellerName            │
│  Genera tu licencia al instante     │
│                                      │
│  👤 Usuario: [____________]          │
│  📧 Email:   [____________]          │
│  💬 Discord: [____________]          │
│  📱 App ID:  [____________]          │
│  ⏱️  Días:    [30 ▼]                 │
│  🔢 Cantidad:[1  ]                   │
│                                      │
│  [🔐 Generar Licencia]               │
└─────────────────────────────────────┘

        ↓ Cliente hace click

┌─────────────────────────────────────┐
│  ✅ ¡Licencia Generada!              │
│                                      │
│  A3B9-5F2C-8D1E-4G7H  [📋]          │
│                                      │
│  📧 Revisa tu email                  │
│  También enviado a Discord           │
│                                      │
│  👤 Usuario: juan_gamer              │
│  ⏱️ Duración: 30 días                │
│  🔢 Cantidad: 1                      │
│                                      │
│  [Generar Otra Licencia]             │
└─────────────────────────────────────┘
```

---

## ⚙️ Archivos Técnicos

- **Página pública:** `/app/store/[seller_key]/page.tsx`
- **API info seller:** `/app/api/store/seller-info/route.ts`
- **API notificaciones:** `/app/api/store/notify/route.ts`
- **API generación:** `/app/api/seller/route.ts` (ya existente)

---

¿Necesitas ayuda? Contacta al administrador del sistema.
