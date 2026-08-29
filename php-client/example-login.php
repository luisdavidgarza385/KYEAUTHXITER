<?php
/**
 * Ejemplo de Login con KeyAuth PHP Client
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
echo "HWID: " . $keyAuth->getHWID() . "\n\n";

// Login de usuario
$username = 'usuario_demo';
$password = 'password123';

if ($keyAuth->login($username, $password)) {
    echo "✓ Login exitoso!\n\n";
    
    // Obtener datos del usuario
    $userData = $keyAuth->getUserData();
    if ($userData) {
        echo "Datos del usuario:\n";
        echo "- Username: " . ($userData['username'] ?? 'N/A') . "\n";
        echo "- Nivel: " . ($userData['level'] ?? 'N/A') . "\n";
        echo "- Expira: " . ($userData['expires_at'] ?? 'N/A') . "\n";
        echo "- IP: " . ($userData['ip'] ?? 'N/A') . "\n";
        echo "- HWID: " . ($userData['hwid'] ?? 'N/A') . "\n";
    }
    
    // Enviar un log
    $keyAuth->log('Usuario inició sesión desde PHP', 'info');
    
    // Obtener una variable
    $updateUrl = $keyAuth->getVar('update_url');
    if ($updateUrl) {
        echo "\nURL de actualización: $updateUrl\n";
    }
    
    // Cerrar sesión
    $keyAuth->logout();
    echo "\n✓ Sesión cerrada\n";
    
} else {
    echo "✗ Error en login: " . $keyAuth->getLastError() . "\n";
}
