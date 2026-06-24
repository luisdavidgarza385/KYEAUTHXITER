<?php
/**
 * Ejemplo de Validación de Licencia con KeyAuth PHP Client
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

// Validar licencia
$licenseKey = 'XXXXX-XXXXX-XXXXX-XXXXX'; // Tu clave de licencia

if ($keyAuth->license($licenseKey)) {
    echo "✓ Licencia válida!\n\n";
    
    // Obtener información de la licencia
    $userData = $keyAuth->getUserData();
    if ($userData) {
        echo "Información de la licencia:\n";
        echo "- Nivel: " . ($userData['level'] ?? 'N/A') . "\n";
        echo "- Expira: " . ($userData['expires_at'] ?? 'N/A') . "\n";
        echo "- Estado: " . ($userData['status'] ?? 'N/A') . "\n";
        echo "- IP bloqueada: " . ($userData['ip_locked'] ?? 'N/A') . "\n";
        echo "- HWID bloqueado: " . ($userData['hwid_locked'] ?? 'N/A') . "\n";
    }
    
    // La aplicación puede continuar...
    echo "\n✓ Acceso permitido a la aplicación\n";
    
    // Cerrar sesión
    $keyAuth->logout();
    
} else {
    echo "✗ Licencia inválida o expirada: " . $keyAuth->getLastError() . "\n";
    echo "✗ Acceso denegado\n";
}
