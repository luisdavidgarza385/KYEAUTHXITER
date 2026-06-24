# 🤖 Bot de Discord para KeyAuth

Bot de Discord que genera licencias automáticamente usando la API de Seller de KeyAuth.

## 📋 Características

- ✅ Generar licencias automáticamente
- 💰 Consultar balance de créditos
- 🔒 Permisos por roles
- 📨 Envío de licencias por DM
- 📝 Sistema de logs
- 🎨 Embeds elegantes

## 🚀 Instalación

### 1. Requisitos Previos
- Node.js v16 o superior
- Un bot de Discord creado en [Discord Developer Portal](https://discord.com/developers/applications)
- Una cuenta de Seller en KeyAuth con API habilitada

### 2. Obtener tu Seller Key

1. Entra al dashboard del admin en `/dashboard/sellers`
2. Crea un seller o usa uno existente
3. Asegúrate que tiene "Acceso API" habilitado
4. Copia la **API Key** (seller_key)

### 3. Crear Bot de Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Click en "New Application"
3. Ve a la sección "Bot"
4. Click en "Add Bot"
5. Copia el **Token** del bot
6. Habilita estos intents:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ PRESENCE INTENT

7. Ve a OAuth2 > URL Generator
8. Selecciona scopes:
   - ✅ bot
   - ✅ applications.commands
9. Selecciona permisos:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
10. Copia la URL generada e invita el bot a tu servidor

### 4. Configurar el Bot

1. Abre `bot.js`
2. Configura las variables en el objeto `CONFIG`:

```javascript
const CONFIG = {
  BOT_TOKEN: 'TU_BOT_TOKEN_AQUI',           // Token del bot
  SELLER_KEY: 'TU_SELLER_KEY_AQUI',         // Tu seller key
  API_URL: 'https://tu-keyauth.vercel.app/api/seller',  // URL de tu KeyAuth
  APP_ID: 'd-9067c98495.xxx',               // ID de tu aplicación
  DEFAULT_EXPIRY: 30,                       // Días por defecto
  DEFAULT_LEVEL: 1,                         // Nivel por defecto
  LOG_CHANNEL_ID: null,                     // ID del canal de logs (opcional)
  ADMIN_ROLES: ['Admin', 'Moderator'],      // Roles que pueden usar comandos
};
```

### 5. Instalar Dependencias

```bash
npm install
```

### 6. Ejecutar el Bot

```bash
npm start
```

O en modo desarrollo (con auto-reload):
```bash
npm run dev
```

## 📖 Comandos

### Para Administradores

#### `!generar [cantidad] [días]`
Genera licencias automáticamente

**Ejemplos:**
```
!generar              # 1 licencia de 30 días
!generar 5            # 5 licencias de 30 días
!generar 10 90        # 10 licencias de 90 días
```

**Comportamiento:**
- Las licencias se envían por DM al usuario
- Se crea un embed con la información
- Se registra la acción en el canal de logs (si está configurado)

#### `!balance`
Consulta los créditos disponibles

**Alias:** `!creditos`

**Ejemplo:**
```
!balance
```

#### `!ayuda`
Muestra la lista de comandos disponibles

**Alias:** `!help`

## 🔒 Permisos

Por defecto, solo usuarios con estos roles pueden usar comandos:
- `Admin`
- `Moderator`

Para cambiar los roles permitidos, edita:
```javascript
ADMIN_ROLES: ['TuRol1', 'TuRol2'],
```

## 📝 Sistema de Logs

Para habilitar logs de acciones:

1. Crea un canal de texto en tu servidor (ejemplo: `#bot-logs`)
2. Copia el ID del canal (Click derecho > Copiar ID)
3. Pega el ID en la configuración:

```javascript
LOG_CHANNEL_ID: '123456789012345678',
```

El bot registrará:
- Generación de licencias
- Usuario que ejecutó la acción
- Timestamp

## 🎨 Personalización

### Cambiar Colores de Embeds

```javascript
// Verde (éxito)
.setColor('#00ff00')

// Rojo (error)
.setColor('#ff0000')

// Azul (información)
.setColor('#0099ff')
```

### Cambiar Prefijo de Comandos

Por defecto es `!`. Para cambiarlo:

```javascript
if (!message.content.startsWith('$')) return;  // Cambia a $
```

### Agregar Más Comandos

Copia este template:

```javascript
if (command === 'tucomando') {
  if (!hasAdminRole(message.member)) {
    return message.reply('❌ No tienes permisos.');
  }
  
  // Tu código aquí
  await message.reply('Tu respuesta');
}
```

## 🔧 Solución de Problemas

### El bot no responde
- ✅ Verifica que el bot esté online
- ✅ Revisa que MESSAGE CONTENT INTENT esté habilitado
- ✅ Verifica que el bot tenga permisos de "Send Messages"

### Error de API
- ✅ Verifica que SELLER_KEY sea correcto
- ✅ Verifica que APP_ID sea correcto
- ✅ Verifica que la URL de API sea correcta
- ✅ Verifica que el seller tenga créditos suficientes

### No se pueden enviar DMs
- El usuario debe tener DMs habilitados
- Si falla, las licencias se envían en el canal (cuidado con la seguridad)

### No tiene permisos
- Verifica que el usuario tenga uno de los roles configurados en ADMIN_ROLES
- Los nombres de roles son case-sensitive

## 📊 Ejemplo de Uso

```
Usuario: !generar 5 30
Bot: ⏳ Generando licencias...
Bot: ✅ Licencias Generadas
     Se generaron 5 licencia(s)
     Duración: 30 días
     Expiran: 25/01/2025
     ✅ Licencias enviadas por DM

[DM del Usuario]
Bot: 🔑 Tus Licencias:
     ABCD-1234-EFGH-5678
     IJKL-9012-MNOP-3456
     QRST-7890-UVWX-1234
     YZAB-5678-CDEF-9012
     GHIJ-3456-KLMN-7890
```

## 🔗 URL de la API

La API sigue este formato:

```
https://tu-keyauth.vercel.app/api/seller/?sellerkey=XXX&type=add&app_id=APP_ID&expiry=30&amount=5&level=1&format=json
```

**Parámetros:**
- `sellerkey` - Tu seller key (obligatorio)
- `type` - Tipo de operación: `add`, `info`, `balance`
- `app_id` - ID de tu aplicación (obligatorio para `add`)
- `expiry` - Días de duración (default: 30)
- `amount` - Cantidad de licencias (default: 1)
- `level` - Nivel de acceso (default: 1)
- `format` - Formato de respuesta: `json` o `text`

## 📦 Estructura del Proyecto

```
discord-bot-example/
├── bot.js           # Código principal del bot
├── package.json     # Dependencias
└── README.md        # Esta documentación
```

## 🤝 Soporte

Si tienes problemas:
1. Revisa la consola del bot para ver errores
2. Verifica que todas las configuraciones sean correctas
3. Prueba la API manualmente en el navegador

## 📝 Notas

- **Seguridad**: Nunca compartas tu BOT_TOKEN ni SELLER_KEY
- **Créditos**: Cada licencia consume 1 crédito (si no es ilimitado)
- **Límites**: Máximo 100 licencias por comando (ajustable en el código)
- **DMs**: Las licencias se envían por DM para mayor seguridad

## ⚡ Tips

1. **Usa créditos ilimitados** para sellers de confianza
2. **Configura logs** para auditoría de acciones
3. **Usa roles específicos** para control de acceso
4. **Envía siempre por DM** para evitar exponer licencias
5. **Haz backups** de las configuraciones importantes
