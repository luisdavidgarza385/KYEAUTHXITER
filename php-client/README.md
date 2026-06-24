# KeyAuth PHP Client

Cliente PHP para conectarse a tu API KeyAuth. Implementación completa y fácil de usar.

## 📋 Requisitos

- PHP 7.4 o superior
- Extensión cURL habilitada
- Extensión JSON habilitada (viene por defecto en PHP moderno)

## 🚀 Instalación

Simplemente copia el archivo `KeyAuth.php` a tu proyecto:

```php
require_once 'KeyAuth.php';
```

## 🔧 Configuración Inicial

Antes de usar el cliente, necesitas obtener tus credenciales:

1. **App ID**: El ID de tu aplicación (puedes encontrarlo en el dashboard)
2. **App Secret**: El secret de tu aplicación (guárdalo de forma segura)
3. **API URL**: La URL de tu API (ejemplo: `https://tu-app.vercel.app/api/1.0`)

## 📖 Uso Básico

### Inicialización

```php
require_once 'KeyAuth.php';

// Configurar credenciales
$appId = 'TU_APP_ID';
$appSecret = 'TU_APP_SECRET';
$apiUrl = 'https://tu-app.vercel.app/api/1.0';

// Crear instancia
$keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);

// Inicializar sesión (SIEMPRE REQUERIDO PRIMERO)
if (!$keyAuth->init()) {
    die('Error: ' . $keyAuth->getLastError());
}
```

### Login de Usuario

```php
if ($keyAuth->login('username', 'password')) {
    echo "Login exitoso!";
    
    // Obtener datos del usuario
    $userData = $keyAuth->getUserData();
    print_r($userData);
} else {
    echo "Error: " . $keyAuth->getLastError();
}
```

### Registro de Usuario

```php
if ($keyAuth->register('username', 'password', 'XXXXX-XXXXX-XXXXX-XXXXX')) {
    echo "Usuario registrado exitosamente!";
    $userData = $keyAuth->getUserData();
} else {
    echo "Error: " . $keyAuth->getLastError();
}
```

### Validar Licencia

```php
if ($keyAuth->license('XXXXX-XXXXX-XXXXX-XXXXX')) {
    echo "Licencia válida!";
    // Permitir acceso a la aplicación
} else {
    echo "Licencia inválida: " . $keyAuth->getLastError();
    // Bloquear acceso
}
```

### Obtener Variables

```php
$updateUrl = $keyAuth->getVar('update_url');
if ($updateUrl) {
    echo "URL de actualización: $updateUrl";
}

$version = $keyAuth->getVar('version');
$maintenanceMode = $keyAuth->getVar('maintenance_mode');
```

### Enviar Logs

```php
// Diferentes niveles: info, warn, error, debug
$keyAuth->log('Usuario inició sesión', 'info');
$keyAuth->log('Configuración cargada', 'debug');
$keyAuth->log('Error al cargar datos', 'error');
```

### Cerrar Sesión

```php
$keyAuth->logout();
```

## 📚 Métodos Disponibles

### `__construct($appId, $appSecret, $apiUrl, $hwid = null)`
Crea una nueva instancia del cliente KeyAuth.

**Parámetros:**
- `$appId` (string): ID de tu aplicación
- `$appSecret` (string): Secret de tu aplicación
- `$apiUrl` (string): URL base de tu API
- `$hwid` (string, opcional): Hardware ID personalizado (se genera automáticamente si no se proporciona)

---

### `init()`
Inicializa una sesión con el servidor KeyAuth. **DEBE ser llamado antes de cualquier otra operación.**

**Retorna:** `bool` - True si la inicialización fue exitosa

---

### `register($username, $password, $licenseKey)`
Registra un nuevo usuario con una clave de licencia.

**Parámetros:**
- `$username` (string): Nombre de usuario deseado
- `$password` (string): Contraseña del usuario
- `$licenseKey` (string): Clave de licencia válida

**Retorna:** `bool` - True si el registro fue exitoso

---

### `login($username, $password)`
Autentica un usuario existente.

**Parámetros:**
- `$username` (string): Nombre de usuario
- `$password` (string): Contraseña del usuario

**Retorna:** `bool` - True si el login fue exitoso

---

### `license($licenseKey)`
Valida una clave de licencia sin necesidad de usuario/contraseña.

**Parámetros:**
- `$licenseKey` (string): Clave de licencia a validar

**Retorna:** `bool` - True si la licencia es válida

---

### `getVar($varName)`
Obtiene el valor de una variable de la aplicación.

**Parámetros:**
- `$varName` (string): Nombre de la variable

**Retorna:** `string|null` - Valor de la variable o null si no existe

---

### `log($message, $level = 'info')`
Envía un log al servidor KeyAuth.

**Parámetros:**
- `$message` (string): Mensaje del log
- `$level` (string): Nivel del log (info, warn, error, debug)

**Retorna:** `bool` - True si el log fue enviado exitosamente

---

### `logout()`
Cierra la sesión actual.

**Retorna:** `bool` - True si el logout fue exitoso

---

### `getUserData()`
Obtiene los datos del usuario actual (después de login, register o license exitoso).

**Retorna:** `array|null` - Datos del usuario o null

---

### `getLastError()`
Obtiene el último error ocurrido.

**Retorna:** `string|null` - Mensaje del último error

---

### `isSessionActive()`
Verifica si hay una sesión activa.

**Retorna:** `bool` - True si hay una sesión activa

---

### `getHWID()`
Obtiene el Hardware ID actual.

**Retorna:** `string` - HWID generado o proporcionado

## 💡 Ejemplos Completos

### Ejemplo 1: Sistema de Login

```php
<?php
session_start();
require_once 'KeyAuth.php';

// Configuración
$keyAuth = new KeyAuth('APP_ID', 'APP_SECRET', 'https://tu-api.com/api/1.0');

// Inicializar
if (!$keyAuth->init()) {
    die('Error de conexión');
}

// Procesar login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($keyAuth->login($username, $password)) {
        $_SESSION['user_data'] = $keyAuth->getUserData();
        $_SESSION['logged_in'] = true;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = $keyAuth->getLastError();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <form method="POST">
        <?php if (isset($error)): ?>
            <p style="color: red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        
        <input type="text" name="username" placeholder="Usuario" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Iniciar Sesión</button>
    </form>
</body>
</html>
```

### Ejemplo 2: Validación de Licencia en Script

```php
<?php
require_once 'KeyAuth.php';

// Tu software/script protegido
function checkLicense($licenseKey) {
    $keyAuth = new KeyAuth('APP_ID', 'APP_SECRET', 'https://tu-api.com/api/1.0');
    
    if (!$keyAuth->init()) {
        return false;
    }
    
    if (!$keyAuth->license($licenseKey)) {
        return false;
    }
    
    // Verificar expiración
    $userData = $keyAuth->getUserData();
    if (isset($userData['expires_at'])) {
        $expiresAt = strtotime($userData['expires_at']);
        if ($expiresAt < time()) {
            return false;
        }
    }
    
    $keyAuth->logout();
    return true;
}

// Uso
$userLicense = 'XXXXX-XXXXX-XXXXX-XXXXX';

if (checkLicense($userLicense)) {
    echo "Licencia válida. Ejecutando aplicación...\n";
    // Tu código protegido aquí
} else {
    die("Licencia inválida o expirada. Acceso denegado.\n");
}
```

### Ejemplo 3: Sistema con Variables Dinámicas

```php
<?php
require_once 'KeyAuth.php';

$keyAuth = new KeyAuth('APP_ID', 'APP_SECRET', 'https://tu-api.com/api/1.0');

if (!$keyAuth->init()) {
    die('Error de inicialización');
}

// Login del usuario
if ($keyAuth->login('usuario', 'password')) {
    
    // Verificar modo mantenimiento
    $maintenance = $keyAuth->getVar('maintenance_mode');
    if ($maintenance === 'true') {
        die('Aplicación en mantenimiento. Intente más tarde.');
    }
    
    // Obtener versión mínima requerida
    $minVersion = $keyAuth->getVar('min_version');
    $currentVersion = '1.0.0';
    
    if (version_compare($currentVersion, $minVersion, '<')) {
        $downloadUrl = $keyAuth->getVar('update_url');
        die("Por favor actualice a la versión $minVersion: $downloadUrl");
    }
    
    // Obtener configuración
    $apiEndpoint = $keyAuth->getVar('api_endpoint');
    $timeout = $keyAuth->getVar('request_timeout');
    
    echo "Aplicación iniciada correctamente\n";
    echo "API Endpoint: $apiEndpoint\n";
    echo "Timeout: $timeout segundos\n";
    
    // Log de inicio
    $keyAuth->log('Aplicación iniciada versión ' . $currentVersion, 'info');
}
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca expongas el App Secret** en el código del cliente. El secret debe estar solo en el servidor.

2. **Usa HTTPS** siempre. El cliente verifica SSL por defecto.

3. **Almacena credenciales de forma segura**:
   ```php
   // Usar variables de entorno
   $appSecret = getenv('KEYAUTH_SECRET');
   
   // O un archivo de configuración fuera del webroot
   require_once '../config/keyauth.config.php';
   ```

4. **Valida la expiración de licencias**:
   ```php
   $userData = $keyAuth->getUserData();
   if (isset($userData['expires_at'])) {
       $expiresAt = strtotime($userData['expires_at']);
       if ($expiresAt < time()) {
           die('Licencia expirada');
       }
   }
   ```

5. **Implementa rate limiting** para evitar ataques de fuerza bruta.

## 🐛 Manejo de Errores

```php
$keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);

// Siempre verificar el resultado
if (!$keyAuth->init()) {
    $error = $keyAuth->getLastError();
    
    // Registrar el error
    error_log("KeyAuth init failed: $error");
    
    // Mostrar mensaje amigable al usuario
    die("Error de conexión. Por favor intente más tarde.");
}

// Similar para otros métodos
if (!$keyAuth->login($username, $password)) {
    switch ($keyAuth->getLastError()) {
        case 'Invalid credentials':
            echo "Usuario o contraseña incorrectos";
            break;
        case 'User banned':
            echo "Su cuenta ha sido suspendida";
            break;
        case 'License expired':
            echo "Su licencia ha expirado";
            break;
        default:
            echo "Error: " . $keyAuth->getLastError();
    }
}
```

## ❓ Preguntas Frecuentes

### ¿Necesito llamar init() cada vez?
Sí, `init()` debe ser llamado antes de cualquier operación. Crea una sesión temporal en el servidor.

### ¿Cómo obtengo mi App ID y Secret?
Desde el dashboard de KeyAuth, en la sección de aplicaciones.

### ¿El HWID se genera automáticamente?
Sí, se genera basándose en características del sistema. Puedes proporcionar uno personalizado en el constructor.

### ¿Puedo usar esto en CLI?
Sí, funciona perfectamente en scripts de línea de comandos.

### ¿Qué pasa si no tengo cURL habilitado?
El cliente requiere cURL. Puedes habilitarlo en tu php.ini o contactar a tu proveedor de hosting.

### ¿Es compatible con PHP 8?
Sí, es compatible con PHP 7.4 y todas las versiones de PHP 8.x.

## 📝 Notas Adicionales

- Las sesiones expiran en 24 horas por defecto
- El HWID se verifica para evitar uso compartido de licencias
- Los logs se almacenan en el servidor y son visibles en el dashboard
- Las variables se actualizan en tiempo real sin necesidad de actualizar tu aplicación

## 📄 Licencia

MIT License - Úsalo libremente en tus proyectos.

## 🤝 Soporte

Si encuentras algún problema o tienes sugerencias, por favor contacta al equipo de desarrollo.
