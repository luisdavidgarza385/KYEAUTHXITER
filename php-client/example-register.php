<?php
/**
 * Ejemplo de Registro con KeyAuth PHP Client
 */

require_once 'KeyAuth.php';

// Configuración
$appId = 'TU_APP_ID';           // Reemplaza con tu App ID
$appSecret = 'TU_APP_SECRET';   // Reemplaza con tu App Secret
$apiUrl = 'https://tu-app.vercel.app/api/1.0'; // Reemplaza con tu URL

// Crear instancia de KeyAuth
$keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);

// Inicializar sesión
if (!$keyAuth->init()) {
    die('Error al inicializar: ' . $keyAuth->getLastError());
}

echo "✓ Sesión inicializada correctamente\n";

// Datos de registro
$username = 'nuevo_usuario';
$password = 'password123';
$licenseKey = 'XXXXX-XXXXX-XXXXX-XXXXX'; // Tu clave de licencia

// Registrar usuario
if ($keyAuth->register($username, $password, $licenseKey)) {
    echo "✓ Usuario registrado exitosamente!\n\n";
    
    // Obtener datos del usuario
    $userData = $keyAuth->getUserData();
    if ($userData) {
        echo "Datos del nuevo usuario:\n";
        echo "- Username: " . ($userData['username'] ?? 'N/A') . "\n";
        echo "- Nivel: " . ($userData['level'] ?? 'N/A') . "\n";
        echo "- Expira: " . ($userData['expires_at'] ?? 'N/A') . "\n";
    }
    
    // Cerrar sesión
    $keyAuth->logout();
    
} else {
    echo "✗ Error en registro: " . $keyAuth->getLastError() . "\n";
}
