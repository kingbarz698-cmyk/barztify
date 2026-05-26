<?php
namespace App\Middleware;

use App\Config\App;
use App\Config\Database;

class AuthMiddleware {
    public static function handle(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($header, 'Bearer ')) {
            App::error('Unauthorized.', 401);
        }
        $token = trim(substr($header, 7));
        if (!$token) App::error('Unauthorized.', 401);

        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT u.id, u.name, u.username, u.email, u.avatar_url, u.is_premium
             FROM auth_tokens t
             JOIN users u ON u.id = t.user_id
             WHERE t.token = ? AND t.expires_at > NOW()'
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        if (!$user) App::error('Unauthorized.', 401);
        return $user;
    }

    /** Returns user or null — does NOT abort */
    public static function optional(): ?array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($header, 'Bearer ')) return null;
        $token = trim(substr($header, 7));
        if (!$token) return null;

        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT u.id, u.name, u.username, u.email, u.avatar_url, u.is_premium
             FROM auth_tokens t
             JOIN users u ON u.id = t.user_id
             WHERE t.token = ? AND t.expires_at > NOW()'
        );
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }
}
