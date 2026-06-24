# 🚀 Portal de Revendedores - KeyAuth

## ¿Qué es el Portal de Revendedores?

El Portal de Revendedores es una funcionalidad completa que permite a cualquier persona registrarse, crear aplicaciones y vender licencias usando tu infraestructura KeyAuth.

## 🎯 Características

### Para Revendedores:
- ✅ Registro público y gratuito
- ✅ Dashboard completo para gestión
- ✅ Crear hasta 10 aplicaciones
- ✅ Generar licencias ilimitadas
- ✅ Gestionar usuarios y suscripciones
- ✅ Ver estadísticas en tiempo real
- ✅ Sistema de créditos para funciones premium
- ✅ Acceso a API completa

### Para Administradores:
- ✅ Control total sobre revendedores
- ✅ Asignar créditos y permisos
- ✅ Ver actividad de revendedores
- ✅ Gestionar límites de aplicaciones

## 🌐 URLs del Portal

### Páginas Públicas:
- **Registro:** `https://tu-dominio.com/reseller`
- **Login:** `https://tu-dominio.com/reseller/login`
- **Dashboard:** `https://tu-dominio.com/reseller/dashboard` (requiere login)

### API Endpoints:
- `POST /api/reseller/register` - Registrar nuevo revendedor
- `POST /api/reseller/login` - Login de revendedor
- `GET /api/reseller/me` - Obtener info del revendedor actual
- `GET /api/reseller/stats` - Estadísticas del revendedor
- `POST /api/reseller/logout` - Cerrar sesión

## 📝 Flujo de Uso

### 1. Registro de Revendedor

```
Usuario → /reseller (página de registro)
↓
Completa formulario:
  - Email
  - Username
  - Password
↓
POST /api/reseller/register
↓
Cuenta creada con permisos completos
```

### 2. Login

```
Usuario → /reseller/login
↓
Ingresa credenciales
↓
POST /api/reseller/login
↓
Redirige a /reseller/dashboard
```

### 3. Dashboard

El revendedor tiene acceso a:
- **Mis Aplicaciones:** Crear y gestionar apps
- **Licencias:** Generar y administrar keys
- **Usuarios:** Ver y gestionar usuarios de sus apps
- **Variables:** Configurar variables server-side
- **Logs:** Ver actividad de sus aplicaciones
- **Créditos:** Comprar más créditos

## 🔧 Configuración Inicial

### Permisos por Defecto (Revendedores)

Cuando un usuario se registra como revendedor, automáticamente recibe:

```typescript
{
  role: "reseller",
  credits: 1000,              // Créditos iniciales
  max_apps: 10,              // Máximo 10 aplicaciones
  can_create_apps: true,
  can_generate_licenses: true,
  can_delete_licenses: true,
  can_reset_hwid: true,
  can_ban_users: true,
  can_modify_profile: true
}
```

### Personalizar Permisos

Edita el archivo `/app/api/reseller/register/route.ts` para cambiar los permisos iniciales:

```typescript
const reseller = await store.createAdmin({
  email,
  password: hashedPassword,
  username,
  role: "reseller",
  credits: 5000,        // Cambiar créditos iniciales
  max_apps: 20,         // Cambiar límite de apps
  // ... otros permisos
});
```

## 💰 Sistema de Créditos

Los créditos se consumen al:
- Crear nuevas aplicaciones (20 créditos por app)
- Generar licencias en masa (variable)
- Realizar operaciones premium

### Recargar Créditos

Los revendedores pueden comprar créditos desde:
```
/reseller/dashboard → Comprar Créditos
```

O el admin puede asignar créditos manualmente desde el panel de administración.

## 🔐 Seguridad

### Autenticación
- Passwords hasheados con bcrypt (10 rounds)
- Sesiones con cookies HttpOnly
- Duración de sesión: 7 días
- Verificación de role en cada request

### Permisos
Cada revendedor solo puede:
- Ver sus propias aplicaciones
- Gestionar sus propios usuarios
- Acceder a sus propios logs

## 🎨 Personalización

### Cambiar Colores

Edita los colores del portal de revendedores en cada página:
- Morado: `purple-600`, `purple-700`
- Rosa: `pink-600`, `pink-700`

### Cambiar Créditos Iniciales

En `/app/api/reseller/register/route.ts`:
```typescript
credits: 1000, // Cambiar este valor
```

### Cambiar Límite de Apps

En `/app/api/reseller/register/route.ts`:
```typescript
max_apps: 10, // Cambiar este valor
```

## 📊 Ejemplo de Uso Completo

### Caso: Juan quiere revender licencias

1. **Registro:**
   ```
   Juan va a: https://keyauth-clone-xi.vercel.app/reseller
   Se registra con email: juan@email.com
   ```

2. **Login:**
   ```
   Juan hace login en: /reseller/login
   Accede a su dashboard
   ```

3. **Crear App:**
   ```
   Juan crea app "MiSoftware v1.0"
   Sistema genera: APP_ID y APP_SECRET
   ```

4. **Generar Licencias:**
   ```
   Juan genera 100 licencias
   Cada licencia tiene formato: XXXXX-XXXXX-XXXXX-XXXXX
   ```

5. **Vender:**
   ```
   Juan vende licencias a sus clientes
   Clientes usan las licencias en su software
   ```

6. **Gestión:**
   ```
   Juan ve estadísticas:
   - 100 licencias activas
   - 50 usuarios registrados
   - 30 usuarios online
   ```

## 🚀 Integración con Software del Cliente

Los clientes de Juan pueden usar las licencias así:

```php
// Cliente usa la API de KeyAuth
$keyAuth = new KeyAuth('JUAN_APP_ID', 'JUAN_APP_SECRET', 'API_URL');
$keyAuth->init();

if ($keyAuth->license('XXXXX-XXXXX-XXXXX-XXXXX')) {
    echo "Licencia válida!";
    // Software funciona
} else {
    echo "Licencia inválida!";
    // Software bloqueado
}
```

## 📱 Acceso Desde Móvil

El portal es 100% responsive y funciona en:
- ✅ Desktop
- ✅ Tablets
- ✅ Móviles

## 🛠️ Troubleshooting

### Error: "Email ya registrado"
**Solución:** Usar un email diferente o recuperar contraseña

### Error: "No autorizado"
**Solución:** Hacer login nuevamente

### No puedo crear más apps
**Solución:** 
- Has llegado al límite (10 apps)
- Contacta al admin para aumentar el límite
- O elimina apps antiguas

### Me quedé sin créditos
**Solución:** 
- Comprar más créditos desde el dashboard
- Contactar al admin para solicitar créditos

## 🎯 Roadmap Futuro

- [ ] Sistema de pagos integrado (Stripe/PayPal)
- [ ] Marketplace de aplicaciones
- [ ] Programa de afiliados
- [ ] Estadísticas avanzadas con gráficas
- [ ] API Keys para revendedores
- [ ] Webhooks personalizados
- [ ] Temas personalizables
- [ ] White-label para revendedores premium

## 📞 Soporte

Para soporte del portal de revendedores:
- 📧 Email: spectralx@gmail.com
- 💬 Dashboard Admin: /dashboard
- 📖 Documentación: /docs

## 📄 Licencia

Este portal está incluido en KeyAuth Clone bajo licencia MIT.

---

**¡El Portal de Revendedores está listo para usar!** 🎉

Cualquier persona puede registrarse en `/reseller` y comenzar a crear aplicaciones inmediatamente.
