<?php
/**
 * Ejemplo de API REST protegida con KeyAuth
 * 
 * Este archivo muestra cómo crear una API REST simple en PHP
 * que valida todas las peticiones con KeyAuth
 * 
 * Uso:
 * POST /example-rest-api.php
 * Headers: X-License-Key: XXXXX-XXXXX-XXXXX-XXXXX
 * Body: {"action": "get_data"}
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-License-Key');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'KeyAuth.php';

// Configuración
$KEYAUTH_APP_ID = 'TU_APP_ID';
$KEYAUTH_APP_SECRET = 'TU_APP_SECRET';
$KEYAUTH_API_URL = 'https://tu-app.vercel.app/api/1.0';

/**
 * Función para enviar respuesta JSON
 */
function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => time()
    ]);
    exit;
}

/**
 * Función para validar licencia
 */
function validateLicense($licenseKey) {
    global $KEYAUTH_APP_ID, $KEYAUTH_APP_SECRET, $KEYAUTH_API_URL;
    
    try {
        $keyAuth = new KeyAuth($KEYAUTH_APP_ID, $KEYAUTH_APP_SECRET, $KEYAUTH_API_URL);
        
        if (!$keyAuth->init()) {
            return [false, 'Failed to initialize KeyAuth'];
        }
        
        if (!$keyAuth->license($licenseKey)) {
            return [false, $keyAuth->getLastError()];
        }
        
        $userData = $keyAuth->getUserData();
        $keyAuth->logout();
        
        return [true, 'License valid', $userData];
        
    } catch (Exception $e) {
        return [false, 'Error: ' . $e->getMessage()];
    }
}

// Obtener la licencia del header o del body
$licenseKey = null;

// Intentar obtener de headers
if (isset($_SERVER['HTTP_X_LICENSE_KEY'])) {
    $licenseKey = $_SERVER['HTTP_X_LICENSE_KEY'];
}

// Intentar obtener del body
$input = json_decode(file_get_contents('php://input'), true);
if (!$licenseKey && isset($input['license_key'])) {
    $licenseKey = $input['license_key'];
}

// Intentar obtener de query string (GET)
if (!$licenseKey && isset($_GET['license_key'])) {
    $licenseKey = $_GET['license_key'];
}

// Validar que se proporcionó licencia
if (!$licenseKey) {
    sendResponse(false, null, 'License key is required', 401);
}

// Validar la licencia
list($valid, $message, $userData) = validateLicense($licenseKey);

if (!$valid) {
    sendResponse(false, null, 'Invalid license: ' . $message, 403);
}

// La licencia es válida, procesar la petición
$action = $input['action'] ?? 'unknown';

switch ($action) {
    case 'get_data':
        // Ejemplo: Retornar datos protegidos
        sendResponse(true, [
            'items' => [
                ['id' => 1, 'name' => 'Item 1', 'value' => 100],
                ['id' => 2, 'name' => 'Item 2', 'value' => 200],
                ['id' => 3, 'name' => 'Item 3', 'value' => 300],
            ],
            'user_level' => $userData['level'] ?? 'N/A',
            'expires_at' => $userData['expires_at'] ?? 'N/A'
        ], 'Data retrieved successfully');
        break;
        
    case 'get_user_info':
        // Retornar información del usuario
        sendResponse(true, [
            'username' => $userData['username'] ?? 'N/A',
            'level' => $userData['level'] ?? 'N/A',
            'expires_at' => $userData['expires_at'] ?? 'N/A',
            'status' => $userData['status'] ?? 'N/A'
        ], 'User info retrieved');
        break;
        
    case 'process_order':
        // Ejemplo: procesar una orden
        $orderId = $input['order_id'] ?? null;
        
        if (!$orderId) {
            sendResponse(false, null, 'Order ID is required', 400);
        }
        
        // Verificar nivel del usuario
        $userLevel = $userData['level'] ?? 0;
        if ($userLevel < 2) {
            sendResponse(false, null, 'Insufficient permissions. Level 2 required.', 403);
        }
        
        // Procesar la orden (simulado)
        sendResponse(true, [
            'order_id' => $orderId,
            'status' => 'processed',
            'processed_by' => $userData['username'] ?? 'system',
            'processed_at' => date('Y-m-d H:i:s')
        ], 'Order processed successfully');
        break;
        
    case 'premium_feature':
        // Característica solo para usuarios premium (nivel 3+)
        $userLevel = $userData['level'] ?? 0;
        
        if ($userLevel < 3) {
            sendResponse(false, null, 'This is a premium feature. Upgrade required.', 403);
        }
        
        sendResponse(true, [
            'feature' => 'Premium Analytics',
            'data' => [
                'total_sales' => 15420.50,
                'total_orders' => 234,
                'conversion_rate' => 3.2,
                'avg_order_value' => 65.90
            ]
        ], 'Premium feature accessed');
        break;
        
    case 'ping':
        // Ping simple para verificar que la API funciona
        sendResponse(true, [
            'message' => 'pong',
            'server_time' => date('Y-m-d H:i:s'),
            'license_valid' => true
        ], 'API is working');
        break;
        
    default:
        sendResponse(false, null, 'Unknown action: ' . $action, 400);
}

// Ejemplo de uso desde cliente (JavaScript):
/*

// Ejemplo 1: Fetch con header
fetch('https://tu-dominio.com/example-rest-api.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-License-Key': 'XXXXX-XXXXX-XXXXX-XXXXX'
    },
    body: JSON.stringify({
        action: 'get_data'
    })
})
.then(response => response.json())
.then(data => console.log(data));

// Ejemplo 2: Fetch con licencia en body
fetch('https://tu-dominio.com/example-rest-api.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        action: 'get_user_info',
        license_key: 'XXXXX-XXXXX-XXXXX-XXXXX'
    })
})
.then(response => response.json())
.then(data => console.log(data));

// Ejemplo 3: cURL desde PHP
$ch = curl_init('https://tu-dominio.com/example-rest-api.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-License-Key: XXXXX-XXXXX-XXXXX-XXXXX'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'action' => 'get_data'
]));
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);

*/
