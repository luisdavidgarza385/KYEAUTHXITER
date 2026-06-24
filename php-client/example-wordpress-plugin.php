<?php
/**
 * Plugin Name: KeyAuth License Validator
 * Description: Ejemplo de integración de KeyAuth en un plugin de WordPress
 * Version: 1.0.0
 * Author: Tu Nombre
 */

// No permitir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . 'KeyAuth.php';

class KeyAuth_WordPress_Plugin {
    
    private $keyAuth;
    private $option_name = 'keyauth_license_data';
    
    public function __construct() {
        // Hooks de WordPress
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Verificar licencia al cargar el plugin
        add_action('plugins_loaded', array($this, 'verify_license'));
    }
    
    /**
     * Agregar página de configuración al menú de WordPress
     */
    public function add_admin_menu() {
        add_options_page(
            'KeyAuth License',
            'KeyAuth License',
            'manage_options',
            'keyauth-license',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Registrar configuraciones
     */
    public function register_settings() {
        register_setting('keyauth_settings', 'keyauth_app_id');
        register_setting('keyauth_settings', 'keyauth_app_secret');
        register_setting('keyauth_settings', 'keyauth_api_url');
        register_setting('keyauth_settings', 'keyauth_license_key');
    }
    
    /**
     * Renderizar página de configuración
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>KeyAuth License Configuration</h1>
            
            <?php
            // Mostrar estado de la licencia
            $licenseData = get_option($this->option_name);
            if ($licenseData && isset($licenseData['valid'])) {
                if ($licenseData['valid']) {
                    echo '<div class="notice notice-success"><p><strong>✓ Licencia válida</strong></p></div>';
                    if (isset($licenseData['expires_at'])) {
                        echo '<p>Expira: ' . esc_html($licenseData['expires_at']) . '</p>';
                    }
                } else {
                    echo '<div class="notice notice-error"><p><strong>✗ Licencia inválida o expirada</strong></p></div>';
                }
            }
            ?>
            
            <form method="post" action="options.php">
                <?php settings_fields('keyauth_settings'); ?>
                <?php do_settings_sections('keyauth_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">App ID</th>
                        <td>
                            <input type="text" name="keyauth_app_id" 
                                   value="<?php echo esc_attr(get_option('keyauth_app_id')); ?>" 
                                   class="regular-text" required />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">App Secret</th>
                        <td>
                            <input type="password" name="keyauth_app_secret" 
                                   value="<?php echo esc_attr(get_option('keyauth_app_secret')); ?>" 
                                   class="regular-text" required />
                            <p class="description">Mantén esto seguro y nunca lo compartas</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">API URL</th>
                        <td>
                            <input type="url" name="keyauth_api_url" 
                                   value="<?php echo esc_attr(get_option('keyauth_api_url')); ?>" 
                                   class="regular-text" required 
                                   placeholder="https://tu-app.vercel.app/api/1.0" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">License Key</th>
                        <td>
                            <input type="text" name="keyauth_license_key" 
                                   value="<?php echo esc_attr(get_option('keyauth_license_key')); ?>" 
                                   class="regular-text" required 
                                   placeholder="XXXXX-XXXXX-XXXXX-XXXXX" />
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Guardar y Validar Licencia'); ?>
            </form>
            
            <hr>
            
            <h2>Verificar Licencia Manualmente</h2>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="keyauth_verify_license">
                <?php wp_nonce_field('keyauth_verify_license'); ?>
                <?php submit_button('Verificar Ahora', 'secondary'); ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * Verificar licencia
     */
    public function verify_license() {
        $appId = get_option('keyauth_app_id');
        $appSecret = get_option('keyauth_app_secret');
        $apiUrl = get_option('keyauth_api_url');
        $licenseKey = get_option('keyauth_license_key');
        
        // Si no hay configuración, no hacer nada
        if (empty($appId) || empty($appSecret) || empty($apiUrl) || empty($licenseKey)) {
            return;
        }
        
        // Verificar solo una vez cada 6 horas
        $lastCheck = get_transient('keyauth_last_check');
        if ($lastCheck !== false) {
            return;
        }
        
        try {
            $keyAuth = new KeyAuth($appId, $appSecret, $apiUrl);
            
            if (!$keyAuth->init()) {
                $this->save_license_status(false, $keyAuth->getLastError());
                return;
            }
            
            if ($keyAuth->license($licenseKey)) {
                $userData = $keyAuth->getUserData();
                $this->save_license_status(true, 'License valid', $userData);
                
                // Log de verificación exitosa
                $keyAuth->log('WordPress plugin license verified', 'info');
            } else {
                $this->save_license_status(false, $keyAuth->getLastError());
            }
            
            $keyAuth->logout();
            
        } catch (Exception $e) {
            $this->save_license_status(false, $e->getMessage());
        }
        
        // Guardar timestamp de la última verificación (6 horas)
        set_transient('keyauth_last_check', time(), 6 * HOUR_IN_SECONDS);
    }
    
    /**
     * Guardar estado de la licencia
     */
    private function save_license_status($valid, $message = '', $userData = null) {
        $data = array(
            'valid' => $valid,
            'message' => $message,
            'checked_at' => current_time('mysql'),
        );
        
        if ($userData) {
            $data = array_merge($data, $userData);
        }
        
        update_option($this->option_name, $data);
    }
    
    /**
     * Verificar si la licencia es válida
     */
    public function is_license_valid() {
        $licenseData = get_option($this->option_name);
        return $licenseData && isset($licenseData['valid']) && $licenseData['valid'] === true;
    }
    
    /**
     * Obtener datos de la licencia
     */
    public function get_license_data() {
        return get_option($this->option_name);
    }
}

// Inicializar el plugin
$keyauth_plugin = new KeyAuth_WordPress_Plugin();

/**
 * Función helper para verificar licencia en tu código
 */
function keyauth_check_license() {
    global $keyauth_plugin;
    
    if (!$keyauth_plugin->is_license_valid()) {
        wp_die(
            '<h1>Licencia Inválida</h1>' .
            '<p>Este plugin requiere una licencia válida para funcionar.</p>' .
            '<p><a href="' . admin_url('options-general.php?page=keyauth-license') . '">Configurar Licencia</a></p>',
            'Licencia Requerida',
            array('response' => 403)
        );
    }
}

/**
 * Ejemplo de uso en tu código del plugin:
 */

/*
// En cualquier parte de tu plugin donde quieras verificar la licencia:
keyauth_check_license();

// O verificar manualmente:
global $keyauth_plugin;
if ($keyauth_plugin->is_license_valid()) {
    // Código protegido aquí
    echo "Funcionalidad premium activada";
} else {
    echo "Por favor activa tu licencia";
}

// Obtener datos de la licencia:
$licenseData = $keyauth_plugin->get_license_data();
if ($licenseData) {
    echo "Nivel: " . $licenseData['level'];
    echo "Expira: " . $licenseData['expires_at'];
}
*/
