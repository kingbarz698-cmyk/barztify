<?php

namespace App\Config;

class App
{
    public static string $name = 'Barztify';
    public static string $version = '2.0.0';

    /**
     * Get ENV value
     */
    public static function env(string $key, mixed $default = null): mixed
    {
        $value = $_ENV[$key] ?? getenv($key);

        return $value !== false && $value !== null ? $value : $default;
    }

    /**
     * CORS HANDLER (Cloud Run safe)
     */
    public static function cors(): void
    {
        $allowedRaw = self::env(
            'ALLOWED_ORIGIN',
            'http://localhost:5173,http://localhost:3000,https://barztify-frontend-885870364096.asia-southeast2.run.app'
        );

        $allowedList = array_filter(array_map('trim', explode(',', $allowedRaw)));

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $isLocal = preg_match(
            '#^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$#',
            $origin
        );

        if ($origin && (in_array($origin, $allowedList, true) || $isLocal)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
            header('Vary: Origin');
        }

        header('Content-Type: application/json; charset=UTF-8');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * SUCCESS RESPONSE
     */
    public static function response(mixed $data, int $status = 200, string $message = ''): never
    {
        http_response_code($status);

        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);

        exit;
    }

    /**
     * ERROR RESPONSE
     */
    public static function error(string $message, int $status = 400): never
    {
        http_response_code($status);

        echo json_encode([
            'success' => false,
            'message' => $message,
            'data' => null
        ]);

        exit;
    }
}