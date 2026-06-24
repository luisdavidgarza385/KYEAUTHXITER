<?php
/**
 * KeyAuth PHP Client
 * Cliente PHP para conectarse a tu API KeyAuth
 * 
 * @version 1.0.0
 * @author KeyAuth Clone
 */

class KeyAuth {
    private $appId;
    private $appSecret;
    private $apiUrl;
    private $sessionId = null;
    private $hwid;
    private $userData = null;
    private $lastError = null;

    /**
     * Constructor
     * 
     * @param string $appId ID de tu aplicación
     * @param string $appSecret Secret de tu aplicación
     * @param string $apiUrl URL base de tu API (ej: https://tu-app.vercel.app/api/1.0)
     * @param string $hwid Hardware ID del usuario (opcional, se genera automáticamente si no se proporciona)
     */
    public function __construct($appId, $appSecret, $apiUrl, $hwid = null) {
        $this->appId = $appId;
        $this->appSecret = $appSecret;
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->hwid = $hwid ?? $this->generateHWID();
    }

    /**
     * Inicializar sesión
     * 
     * @return bool True si la inicialización fue exitosa
     */
    public function init() {
        $response = $this->request('/init', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'hwid' => $this->hwid
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            $this->sessionId = $response['sessionid'] ?? null;
            return true;
        }

        $this->lastError = $response['message'] ?? 'Failed to initialize session';
        return false;
    }

    /**
     * Registrar nuevo usuario
     * 
     * @param string $username Nombre de usuario
     * @param string $password Contraseña
     * @param string $licenseKey Clave de licencia
     * @return bool True si el registro fue exitoso
     */
    public function register($username, $password, $licenseKey) {
        if (!$this->sessionId) {
            $this->lastError = 'Session not initialized. Call init() first.';
            return false;
        }

        $response = $this->request('/register', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId,
            'username' => $username,
            'password' => $password,
            'key' => $licenseKey,
            'hwid' => $this->hwid
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            $this->userData = $response['data'] ?? null;
            return true;
        }

        $this->lastError = $response['message'] ?? 'Registration failed';
        return false;
    }

    /**
     * Login de usuario
     * 
     * @param string $username Nombre de usuario
     * @param string $password Contraseña
     * @return bool True si el login fue exitoso
     */
    public function login($username, $password) {
        if (!$this->sessionId) {
            $this->lastError = 'Session not initialized. Call init() first.';
            return false;
        }

        $response = $this->request('/login', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId,
            'username' => $username,
            'password' => $password,
            'hwid' => $this->hwid
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            $this->userData = $response['data'] ?? null;
            return true;
        }

        $this->lastError = $response['message'] ?? 'Login failed';
        return false;
    }

    /**
     * Validar clave de licencia
     * 
     * @param string $licenseKey Clave de licencia
     * @return bool True si la licencia es válida
     */
    public function license($licenseKey) {
        if (!$this->sessionId) {
            $this->lastError = 'Session not initialized. Call init() first.';
            return false;
        }

        $response = $this->request('/license', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId,
            'key' => $licenseKey,
            'hwid' => $this->hwid
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            $this->userData = $response['data'] ?? null;
            return true;
        }

        $this->lastError = $response['message'] ?? 'License validation failed';
        return false;
    }

    /**
     * Obtener variable de la aplicación
     * 
     * @param string $varName Nombre de la variable
     * @return string|null Valor de la variable o null si no existe
     */
    public function getVar($varName) {
        if (!$this->sessionId) {
            $this->lastError = 'Session not initialized. Call init() first.';
            return null;
        }

        $response = $this->request('/var', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId,
            'name' => $varName
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            return $response['data']['value'] ?? null;
        }

        $this->lastError = $response['message'] ?? 'Failed to get variable';
        return null;
    }

    /**
     * Enviar log a la aplicación
     * 
     * @param string $message Mensaje del log
     * @param string $level Nivel del log (info, warn, error, debug)
     * @return bool True si el log fue enviado exitosamente
     */
    public function log($message, $level = 'info') {
        if (!$this->sessionId) {
            $this->lastError = 'Session not initialized. Call init() first.';
            return false;
        }

        $response = $this->request('/log', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId,
            'message' => $message,
            'level' => $level
        ]);

        if ($response && isset($response['success']) && $response['success']) {
            return true;
        }

        $this->lastError = $response['message'] ?? 'Failed to send log';
        return false;
    }

    /**
     * Cerrar sesión
     * 
     * @return bool True si el logout fue exitoso
     */
    public function logout() {
        if (!$this->sessionId) {
            return true;
        }

        $response = $this->request('/logout', [
            'appid' => $this->appId,
            'secret' => $this->appSecret,
            'sessionid' => $this->sessionId
        ]);

        $this->sessionId = null;
        $this->userData = null;

        return $response && isset($response['success']) && $response['success'];
    }

    /**
     * Obtener datos del usuario actual
     * 
     * @return array|null Datos del usuario o null si no hay usuario logueado
     */
    public function getUserData() {
        return $this->userData;
    }

    /**
     * Obtener el último error
     * 
     * @return string|null Último error o null si no hay error
     */
    public function getLastError() {
        return $this->lastError;
    }

    /**
     * Verificar si hay una sesión activa
     * 
     * @return bool True si hay una sesión activa
     */
    public function isSessionActive() {
        return $this->sessionId !== null;
    }

    /**
     * Obtener el HWID actual
     * 
     * @return string HWID
     */
    public function getHWID() {
        return $this->hwid;
    }

    /**
     * Realizar petición HTTP a la API
     * 
     * @param string $endpoint Endpoint de la API
     * @param array $data Datos a enviar
     * @return array|null Respuesta de la API o null en caso de error
     */
    private function request($endpoint, $data = []) {
        $url = $this->apiUrl . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-Secret: ' . $this->appSecret
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            $this->lastError = 'cURL Error: ' . $curlError;
            return null;
        }

        if ($httpCode >= 400) {
            $this->lastError = 'HTTP Error: ' . $httpCode;
        }

        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->lastError = 'JSON decode error: ' . json_last_error_msg();
            return null;
        }

        return $decoded;
    }

    /**
     * Generar un HWID único basado en las características del sistema
     * 
     * @return string HWID generado
     */
    private function generateHWID() {
        $hwid = '';
        
        // Intentar obtener información del sistema
        if (PHP_OS_FAMILY === 'Windows') {
            // Windows
            $hwid .= php_uname('n'); // Nombre del equipo
            $hwid .= @exec('wmic csproduct get uuid 2>nul');
        } elseif (PHP_OS_FAMILY === 'Linux') {
            // Linux
            $hwid .= php_uname('n');
            $hwid .= @file_get_contents('/etc/machine-id');
        } elseif (PHP_OS_FAMILY === 'Darwin') {
            // macOS
            $hwid .= php_uname('n');
            $hwid .= @exec('ioreg -rd1 -c IOPlatformExpertDevice 2>/dev/null | awk \'/IOPlatformUUID/ { print $3; }\'');
        }
        
        // Agregar información adicional
        $hwid .= $_SERVER['SERVER_NAME'] ?? '';
        $hwid .= $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Generar hash
        return hash('sha256', $hwid);
    }
}
