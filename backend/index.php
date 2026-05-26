<?php
declare(strict_types=1);

define('ROOT', dirname(__DIR__));
define('BACKEND_ROOT', __DIR__);

/**
 * =========================
 * COMPOSER AUTOLOAD
 * =========================
 */
$autoloadFile = BACKEND_ROOT . '/vendor/autoload.php';
if (!file_exists($autoloadFile)) {
    http_response_code(500);
    echo json_encode(["error" => "Composer autoload not found. Run composer install/dump-autoload."]);
    exit;
}

require $autoloadFile;

// use HARUS setelah require autoload, tapi di PHP 7+ use adalah compile-time
// Solusi paling aman: pakai fully-qualified class name (FQCN) di seluruh file
// sehingga tidak butuh use statement sama sekali

/**
 * =========================
 * GLOBAL CORS
 * =========================
 */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://barztify-frontend-885870364096.asia-southeast2.run.app'
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Vary: Origin");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * =========================
 * LOAD .ENV
 * =========================
 */
$envFile = BACKEND_ROOT . '/.env';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        if (
            $line === '' ||
            str_starts_with($line, '#') ||
            !str_contains($line, '=')
        ) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);

        $key = trim($key);
        $value = trim($value);

        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

/**
 * =========================
 * ROUTER
 * =========================
 */
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

/**
 * API ROUTE
 */
if (str_contains($uri, '/v1')) {
    require BACKEND_ROOT . '/app/routes/api.php';
    exit;
}

/**
 * DEFAULT RESPONSE
 */
\App\Config\App::response([
    'name'    => \App\Config\App::$name,
    'version' => \App\Config\App::$version,
    'status'  => 'running'
]);