<?php
/**
 * Archivo de Configuración de Ejemplo para KeyAuth PHP Client
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo a 'config.php'
 * 2. Reemplaza los valores con tus credenciales reales
 * 3. NUNCA subas config.php a tu repositorio
 */

// Configuración de KeyAuth
define('KEYAUTH_APP_ID', 'TU_APP_ID_AQUI');
define('KEYAUTH_APP_SECRET', 'TU_APP_SECRET_AQUI');
define('KEYAUTH_API_URL', 'https://tu-app.vercel.app/api/1.0');

// Configuración opcional
define('KEYAUTH_TIMEOUT', 30); // Timeout en segundos para peticiones
define('KEYAUTH_DEBUG', false); // Activar modo debug

// Ejemplo de uso:
/*
require_once 'config.php';
require_once 'KeyAuth.php';

$keyAuth = new KeyAuth(
    KEYAUTH_APP_ID,
    KEYAUTH_APP_SECRET,
    KEYAUTH_API_URL
);
*/
