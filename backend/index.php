<?php
declare(strict_types=1);

define('ROOT', dirname(__DIR__));
define('BACKEND_ROOT', __DIR__);

// Load .env
$envFile = BACKEND_ROOT . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $val] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($val);
        putenv(trim($key) . '=' . trim($val));
    }
}

// Autoloader
spl_autoload_register(function (string $class): void {
    $file = BACKEND_ROOT . '/app/' . str_replace(['App\\', '\\'], ['', '/'], $class) . '.php';
    if (file_exists($file)) require_once $file;
});

use App\Config\App;

App::cors();

// Route to api.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize: hapus trailing slash kecuali root
$uri = rtrim($uri, '/') ?: '/';

// Match /v1 di mana saja dalam URI
if (str_contains($uri, '/v1')) {
    require BACKEND_ROOT . '/app/routes/api.php';
} else {
    App::response(['name' => App::$name, 'version' => App::$version, 'status' => 'running']);
}