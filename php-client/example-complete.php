<?php
/**
 * Ejemplo Completo de uso de KeyAuth PHP Client
 * Demuestra todas las funcionalidades principales
 */

require_once 'KeyAuth.php';

// ============================================
// CONFIGURACIÓN
// ============================================
$appId = 'TU_APP_ID';           // Reemplaza con tu App ID
$appSecret = 'TU_APP_SECRET';   // Reemplaza con tu App Secret
$apiUrl = 'https://tu-app.vercel.app/api/1.0'; // Reemplaza con tu URL

echo "===========================================\n";
echo "KeyAuth PHP Client - Ejemplo Completo\n";
echo "===========================================\n\n";

// ============================================
// 1. INICIALIZACIÓN
// ============================================
echo "1. Inicializando sesión...\n";
$keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);

if (!$keyAuth->init()) {
    die('✗ Error al inicializar: ' . $keyAuth->getLastError() . "\n");
}

echo "✓ Sesión inicializada\n";
echo "  HWID: " . $keyAuth->getHWID() . "\n\n";

// ============================================
// 2. OPCIÓN A: LOGIN
// ============================================
echo "2. Login de usuario...\n";
$username = 'usuario_demo';
$password = 'password123';

if ($keyAuth->login($username, $password)) {
    echo "✓ Login exitoso\n\n";
    
    // Mostrar datos del usuario
    $userData = $keyAuth->getUserData();
    if ($userData) {
        echo "Datos del usuario:\n";
        foreach ($userData as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            echo "  - $key: $value\n";
        }
        echo "\n";
    }
} else {
    echo "✗ Error en login: " . $keyAuth->getLastError() . "\n\n";
}

// ============================================
// OPCIÓN B: REGISTRO (Descomenta para usar)
// ============================================
/*
echo "2. Registro de nuevo usuario...\n";
$username = 'nuevo_usuario_' . time();
$password = 'password123';
$licenseKey = 'XXXXX-XXXXX-XXXXX-XXXXX';

if ($keyAuth->register($username, $password, $licenseKey)) {
    echo "✓ Usuario registrado exitosamente\n\n";
    $userData = $keyAuth->getUserData();
    if ($userData) {
        echo "Usuario creado: " . ($userData['username'] ?? 'N/A') . "\n\n";
    }
} else {
    echo "✗ Error en registro: " . $keyAuth->getLastError() . "\n\n";
}
*/

// ============================================
// OPCIÓN C: VALIDAR LICENCIA (Descomenta para usar)
// ============================================
/*
echo "2. Validando licencia...\n";
$licenseKey = 'XXXXX-XXXXX-XXXXX-XXXXX';

if ($keyAuth->license($licenseKey)) {
    echo "✓ Licencia válida\n\n";
} else {
    echo "✗ Licencia inválida: " . $keyAuth->getLastError() . "\n\n";
}
*/

// ============================================
// 3. OBTENER VARIABLES
// ============================================
echo "3. Obteniendo variables de la aplicación...\n";

$variables = ['update_url', 'version', 'maintenance_mode'];
foreach ($variables as $varName) {
    $value = $keyAuth->getVar($varName);
    if ($value !== null) {
        echo "✓ $varName: $value\n";
    } else {
        echo "✗ $varName: No encontrada\n";
    }
}
echo "\n";

// ============================================
// 4. ENVIAR LOGS
// ============================================
echo "4. Enviando logs...\n";

$logs = [
    ['message' => 'Aplicación iniciada', 'level' => 'info'],
    ['message' => 'Usuario autenticado correctamente', 'level' => 'info'],
    ['message' => 'Configuración cargada', 'level' => 'debug'],
];

foreach ($logs as $log) {
    if ($keyAuth->log($log['message'], $log['level'])) {
        echo "✓ Log enviado: {$log['message']}\n";
    } else {
        echo "✗ Error al enviar log: " . $keyAuth->getLastError() . "\n";
    }
}
echo "\n";

// ============================================
// 5. VERIFICAR ESTADO DE SESIÓN
// ============================================
echo "5. Estado de la sesión...\n";
if ($keyAuth->isSessionActive()) {
    echo "✓ Sesión activa\n\n";
} else {
    echo "✗ Sin sesión activa\n\n";
}

// ============================================
// 6. CERRAR SESIÓN
// ============================================
echo "6. Cerrando sesión...\n";
if ($keyAuth->logout()) {
    echo "✓ Sesión cerrada correctamente\n";
} else {
    echo "✗ Error al cerrar sesión\n";
}

echo "\n===========================================\n";
echo "Ejemplo completado\n";
echo "===========================================\n";
