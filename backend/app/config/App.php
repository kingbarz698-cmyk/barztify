<?php
namespace App\Config;

class App {
    public static string $name    = 'Barztify';
    public static string $version = '2.0.0';

    public static function env(string $key, mixed $default = null): mixed {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }

    public static function cors(): void {
        $allowedRaw = self::env('ALLOWED_ORIGIN', 'http://localhost:5173');

        // Support multiple origins (comma-separated) + auto-allow 192.168.x.x:5173
        $allowedList = array_map('trim', explode(',', $allowedRaw));

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Also allow local network IP (192.168.x.x, 10.x.x.x)
        $isLocalIp = (bool) preg_match(
            '#^https?://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|127\.0\.0\.1|localhost)(:\d+)?$#',
            $origin
        );

        $allowed = in_array($origin, $allowedList, true) || $isLocalIp
            ? $origin
            : $allowedList[0];

        header("Access-Control-Allow-Origin: {$allowed}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Content-Type: application/json; charset=UTF-8');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
    }

    public static function response(mixed $data, int $status = 200, string $message = ''): never {
        http_response_code($status);
        echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
        exit;
    }

    public static function error(string $message, int $status = 400): never {
        http_response_code($status);
        echo json_encode(['success' => false, 'message' => $message, 'data' => null]);
        exit;
    }
}
