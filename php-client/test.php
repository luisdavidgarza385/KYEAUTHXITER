<?php
/**
 * Script de Prueba para KeyAuth PHP Client
 * Verifica que la clase funcione correctamente
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'KeyAuth.php';

echo "===========================================\n";
echo "KeyAuth PHP Client - Test Suite\n";
echo "===========================================\n\n";

// Verificar extensiones requeridas
echo "1. Verificando requisitos del sistema...\n";
$errors = [];

if (!extension_loaded('curl')) {
    $errors[] = "✗ Extensión cURL no está habilitada";
} else {
    echo "✓ cURL está habilitado\n";
}

if (!extension_loaded('json')) {
    $errors[] = "✗ Extensión JSON no está habilitada";
} else {
    echo "✓ JSON está habilitado\n";
}

echo "✓ PHP Version: " . phpversion() . "\n";

if (!empty($errors)) {
    echo "\n❌ Errores encontrados:\n";
    foreach ($errors as $error) {
        echo "  $error\n";
    }
    die("\nPor favor corrige estos errores antes de continuar.\n");
}

echo "\n2. Verificando configuración...\n";

// Pedir credenciales al usuario
echo "\n┌─────────────────────────────────────────┐\n";
echo "│ Ingresa tus credenciales de KeyAuth    │\n";
echo "└─────────────────────────────────────────┘\n\n";

echo "App ID: ";
$appId = trim(fgets(STDIN));

echo "App Secret: ";
$appSecret = trim(fgets(STDIN));

echo "API URL (ej: https://tu-app.vercel.app/api/1.0): ";
$apiUrl = trim(fgets(STDIN));

if (empty($appId) || empty($appSecret) || empty($apiUrl)) {
    die("\n✗ Todas las credenciales son requeridas.\n");
}

echo "\n3. Creando instancia de KeyAuth...\n";

try {
    $keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);
    echo "✓ Instancia creada correctamente\n";
    echo "  HWID generado: " . $keyAuth->getHWID() . "\n";
} catch (Exception $e) {
    die("\n✗ Error al crear instancia: " . $e->getMessage() . "\n");
}

echo "\n4. Probando inicialización...\n";

if ($keyAuth->init()) {
    echo "✓ Sesión inicializada correctamente\n";
    echo "✓ Sesión activa: " . ($keyAuth->isSessionActive() ? 'Sí' : 'No') . "\n";
} else {
    die("\n✗ Error al inicializar: " . $keyAuth->getLastError() . "\n");
}

echo "\n5. ¿Qué deseas probar?\n";
echo "  1. Login de usuario\n";
echo "  2. Registro de usuario\n";
echo "  3. Validar licencia\n";
echo "  4. Solo obtener variables\n";
echo "  5. Salir\n";
echo "\nOpción: ";
$option = trim(fgets(STDIN));

switch ($option) {
    case '1':
        // Test de Login
        echo "\n=== TEST: LOGIN ===\n";
        echo "Username: ";
        $username = trim(fgets(STDIN));
        echo "Password: ";
        $password = trim(fgets(STDIN));
        
        if ($keyAuth->login($username, $password)) {
            echo "✓ Login exitoso!\n\n";
            echo "Datos del usuario:\n";
            $userData = $keyAuth->getUserData();
            if ($userData) {
                foreach ($userData as $key => $value) {
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    echo "  - $key: $value\n";
                }
            }
        } else {
            echo "✗ Login fallido: " . $keyAuth->getLastError() . "\n";
        }
        break;
        
    case '2':
        // Test de Registro
        echo "\n=== TEST: REGISTRO ===\n";
        echo "Username: ";
        $username = trim(fgets(STDIN));
        echo "Password: ";
        $password = trim(fgets(STDIN));
        echo "License Key: ";
        $licenseKey = trim(fgets(STDIN));
        
        if ($keyAuth->register($username, $password, $licenseKey)) {
            echo "✓ Usuario registrado exitosamente!\n\n";
            echo "Datos del usuario:\n";
            $userData = $keyAuth->getUserData();
            if ($userData) {
                foreach ($userData as $key => $value) {
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    echo "  - $key: $value\n";
                }
            }
        } else {
            echo "✗ Registro fallido: " . $keyAuth->getLastError() . "\n";
        }
        break;
        
    case '3':
        // Test de Licencia
        echo "\n=== TEST: VALIDAR LICENCIA ===\n";
        echo "License Key: ";
        $licenseKey = trim(fgets(STDIN));
        
        if ($keyAuth->license($licenseKey)) {
            echo "✓ Licencia válida!\n\n";
            echo "Información de la licencia:\n";
            $userData = $keyAuth->getUserData();
            if ($userData) {
                foreach ($userData as $key => $value) {
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    echo "  - $key: $value\n";
                }
            }
        } else {
            echo "✗ Licencia inválida: " . $keyAuth->getLastError() . "\n";
        }
        break;
        
    case '4':
        echo "\n=== TEST: VARIABLES ===\n";
        echo "Nombre de variable (o presiona Enter para probar 'version'): ";
        $varName = trim(fgets(STDIN));
        if (empty($varName)) {
            $varName = 'version';
        }
        
        $value = $keyAuth->getVar($varName);
        if ($value !== null) {
            echo "✓ Variable '$varName': $value\n";
        } else {
            echo "✗ No se pudo obtener la variable: " . $keyAuth->getLastError() . "\n";
        }
        break;
        
    case '5':
        echo "\nSaliendo...\n";
        exit(0);
        
    default:
        echo "\n✗ Opción inválida\n";
}

// Test adicional: enviar log
if ($keyAuth->isSessionActive()) {
    echo "\n6. Enviando log de prueba...\n";
    if ($keyAuth->log('Test ejecutado desde PHP', 'info')) {
        echo "✓ Log enviado correctamente\n";
    } else {
        echo "✗ Error al enviar log: " . $keyAuth->getLastError() . "\n";
    }
}

// Logout
echo "\n7. Cerrando sesión...\n";
if ($keyAuth->logout()) {
    echo "✓ Sesión cerrada correctamente\n";
} else {
    echo "✗ Error al cerrar sesión\n";
}

echo "\n===========================================\n";
echo "Test completado\n";
echo "===========================================\n";
