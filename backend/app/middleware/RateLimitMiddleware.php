<?php
namespace App\Middleware;

use App\Config\App;
use App\Config\Database;

class RateLimitMiddleware {
    public static function handle(int $maxRequests = 10, int $windowSeconds = 60): void {
        $ip   = md5($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        $db   = Database::getInstance();

        // Atomic upsert — safe for concurrent requests
        $stmt = $db->prepare(
            'INSERT INTO rate_limits (ip_hash, count, reset_at)
             VALUES (?, 1, DATE_ADD(NOW(), INTERVAL ? SECOND))
             ON DUPLICATE KEY UPDATE
               count    = IF(reset_at < NOW(), 1, count + 1),
               reset_at = IF(reset_at < NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), reset_at)'
        );
        $stmt->execute([$ip, $windowSeconds, $windowSeconds]);

        $stmt = $db->prepare('SELECT count FROM rate_limits WHERE ip_hash = ?');
        $stmt->execute([$ip]);
        $count = (int) $stmt->fetchColumn();

        if ($count > $maxRequests) {
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'Too many requests. Please wait.', 'data' => null]);
            exit;
        }
    }
}
