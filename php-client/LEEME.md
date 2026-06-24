# Cliente PHP para KeyAuth

## 📦 ¿Qué incluye este paquete?

Este directorio contiene todo lo que necesitas para integrar tu sistema KeyAuth con aplicaciones PHP:

### Archivos Principales:

- **KeyAuth.php** - Clase principal del cliente (¡este es el archivo más importante!)
- **README.md** - Documentación completa en inglés
- **LEEME.md** - Este archivo (resumen en español)

### Ejemplos de Uso:

- **example-login.php** - Ejemplo de sistema de login
- **example-register.php** - Ejemplo de registro de usuarios
- **example-license.php** - Ejemplo de validación de licencias
- **example-complete.php** - Ejemplo completo con todas las funcionalidades
- **example-wordpress-plugin.php** - Ejemplo de plugin de WordPress
- **test.php** - Script interactivo para probar la conexión

### Archivos de Configuración:

- **config.example.php** - Plantilla de configuración (copiar a config.php)
- **.gitignore** - Protege tus credenciales

## 🚀 Inicio Rápido

### 1. Obtén tus credenciales

Ve a tu dashboard de KeyAuth y obtén:
- **App ID** 
- **App Secret**
- **URL de tu API** (ejemplo: https://tu-app.vercel.app/api/1.0)

### 2. Copia el archivo de configuración

```bash
# En Windows CMD:
copy config.example.php config.php

# En Windows PowerShell:
Copy-Item config.example.php config.php
```

### 3. Edita config.php con tus credenciales

Abre `config.php` y reemplaza:
```php
define('KEYAUTH_APP_ID', 'tu-app-id-real');
define('KEYAUTH_APP_SECRET', 'tu-app-secret-real');
define('KEYAUTH_API_URL', 'https://tu-app-real.vercel.app/api/1.0');
```

### 4. Prueba la conexión

```bash
php test.php
```

Este script interactivo te guiará para probar tu conexión.

## 💡 Uso Básico

```php
<?php
require_once 'KeyAuth.php';

// Crear instancia
$keyAuth = new KeyAuth(
    'TU_APP_ID',
    'TU_APP_SECRET', 
    'https://tu-app.vercel.app/api/1.0'
);

// SIEMPRE inicializar primero
if (!$keyAuth->init()) {
    die('Error: ' . $keyAuth->getLastError());
}

// Login de usuario
if ($keyAuth->login('username', 'password')) {
    echo "¡Bienvenido!";
    $userData = $keyAuth->getUserData();
} else {
    echo "Error: " . $keyAuth->getLastError();
}

// Cerrar sesión
$keyAuth->logout();
?>
```

## 📋 Casos de Uso Comunes

### 1. Proteger un Script PHP

```php
<?php
require_once 'KeyAuth.php';

$keyAuth = new KeyAuth('APP_ID', 'SECRET', 'API_URL');
$keyAuth->init();

if (!$keyAuth->license('CLAVE-DE-LICENCIA')) {
    die('Licencia inválida');
}

// Tu script protegido aquí
echo "Script ejecutándose con licencia válida";
?>
```

### 2. Sistema de Login para Sitio Web

```php
<?php
session_start();
require_once 'KeyAuth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $keyAuth = new KeyAuth('APP_ID', 'SECRET', 'API_URL');
    $keyAuth->init();
    
    if ($keyAuth->login($_POST['user'], $_POST['pass'])) {
        $_SESSION['logged_in'] = true;
        $_SESSION['user_data'] = $keyAuth->getUserData();
        header('Location: dashboard.php');
    }
}
?>
```

### 3. Verificar Actualizaciones

```php
<?php
$keyAuth = new KeyAuth('APP_ID', 'SECRET', 'API_URL');
$keyAuth->init();
$keyAuth->login('user', 'pass');

$latestVersion = $keyAuth->getVar('latest_version');
$downloadUrl = $keyAuth->getVar('download_url');

if (version_compare($currentVersion, $latestVersion, '<')) {
    echo "Nueva versión disponible: $downloadUrl";
}
?>
```

## 🔧 Requisitos Técnicos

- **PHP 7.4** o superior (compatible con PHP 8.x)
- **Extensión cURL** habilitada
- **Extensión JSON** habilitada (viene por defecto)

### Verificar si tienes todo:

```bash
php -m | findstr curl
php -m | findstr json
php -v
```

### Habilitar cURL en Windows:

1. Abre tu archivo `php.ini`
2. Busca la línea `;extension=curl`
3. Quítale el `;` al inicio: `extension=curl`
4. Reinicia tu servidor web

## 📚 Métodos Disponibles

| Método | Descripción |
|--------|-------------|
| `init()` | Inicializa sesión (¡SIEMPRE llamar primero!) |
| `login($user, $pass)` | Login de usuario |
| `register($user, $pass, $key)` | Registrar nuevo usuario |
| `license($key)` | Validar licencia |
| `getVar($name)` | Obtener variable de la app |
| `log($message, $level)` | Enviar log al servidor |
| `logout()` | Cerrar sesión |
| `getUserData()` | Obtener datos del usuario actual |
| `getLastError()` | Obtener último error |
| `isSessionActive()` | Verificar si hay sesión activa |
| `getHWID()` | Obtener Hardware ID |

## 🛡️ Seguridad

### ⚠️ IMPORTANTE:

1. **NUNCA** expongas tu `APP_SECRET` en código del cliente
2. **NUNCA** subas `config.php` a GitHub/repositorios públicos
3. **SIEMPRE** usa HTTPS en producción
4. **SIEMPRE** valida las fechas de expiración de licencias

### Ejemplo Seguro:

```php
<?php
// ✓ BIEN: Usar variables de entorno
$appSecret = getenv('KEYAUTH_SECRET');

// ✓ BIEN: Usar archivo de config fuera del webroot
require_once '../../config/keyauth.php';

// ✗ MAL: Hardcodear el secret en el código
$appSecret = 'mi-secret-aqui'; // ¡NO HACER ESTO!
?>
```

## 🐛 Solución de Problemas

### Error: "cURL extension not loaded"
**Solución:** Habilita la extensión cURL en php.ini

### Error: "Session not initialized"
**Solución:** Llama a `init()` antes de cualquier otro método

### Error: "Invalid application secret"
**Solución:** Verifica que tu APP_SECRET sea correcto

### Error: "Application not found"
**Solución:** Verifica tu APP_ID y que la aplicación esté activa

### Error de SSL/certificado
**Solución:** Actualiza tu certificado CA o contacta a tu hosting

## 📖 Documentación Completa

Para documentación detallada, ejemplos avanzados y referencia de API completa, consulta **README.md**

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta `test.php` para diagnosticar problemas de conexión
2. Revisa que tus credenciales sean correctas
3. Verifica que tu aplicación esté activa en el dashboard
4. Consulta la documentación completa en README.md

## 📄 Licencia

MIT License - Usa este código libremente en tus proyectos comerciales o personales.

## 🎯 Próximos Pasos

1. ✅ Ejecuta `test.php` para verificar tu conexión
2. ✅ Revisa los ejemplos en `example-*.php`
3. ✅ Integra KeyAuth.php en tu proyecto
4. ✅ Lee la documentación completa en README.md

---

**¿Necesitas ayuda?** Consulta README.md para documentación completa o contacta al equipo de soporte.
