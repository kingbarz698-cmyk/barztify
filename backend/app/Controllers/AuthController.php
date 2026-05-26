<?php
namespace App\Controllers;

use App\Config\App;
use App\Config\Database;
use App\Models\UserModel;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Services\NotificationService;

class AuthController {
    public static function login(): void {
        RateLimitMiddleware::handle(10, 60);
        $body       = json_decode(file_get_contents('php://input'), true) ?? [];
        $identifier = trim($body['identifier'] ?? $body['email'] ?? '');
        $password   = trim($body['password'] ?? '');

        if (!$identifier || !$password) App::error('Email/username and password are required.', 422);

        $user = UserModel::findByIdentifierForAuth($identifier);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            App::error('Invalid email/username or password.', 401);
        }

        $token  = bin2hex(random_bytes(40));
        $expiry = date('Y-m-d H:i:s', strtotime('+30 days'));
        $db     = Database::getInstance();
        $db->prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?,?,?)')->execute([$user['id'], $token, $expiry]);

        unset($user['password_hash']);
        App::response([
            'token' => $token,
            'user'  => array_merge($user, ['isPremium' => (bool)$user['is_premium']]),
        ], 200, 'Login successful.');
    }

    public static function register(): void {
        RateLimitMiddleware::handle(5, 60);
        $body     = json_decode(file_get_contents('php://input'), true) ?? [];
        $name     = trim($body['name']     ?? '');
        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');

        if (!$name || !$email || !$password) App::error('All fields are required.', 422);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) App::error('Invalid email address.', 422);
        if (strlen($password) < 8) App::error('Password must be at least 8 characters.', 422);
        if (UserModel::findByEmail($email)) App::error('Email is already registered.', 409);

        // Auto-generate username from email local part
        $baseUsername = preg_replace('/[^a-z0-9_]/', '', strtolower(explode('@', $email)[0]));
        $username     = $baseUsername;
        $i            = 1;
        while (UserModel::findByUsername($username)) { $username = $baseUsername . $i++; }

        $hash   = password_hash($password, PASSWORD_BCRYPT);
        $userId = UserModel::create($name, $username, $email, $hash);

        $token  = bin2hex(random_bytes(40));
        $expiry = date('Y-m-d H:i:s', strtotime('+30 days'));
        $db     = Database::getInstance();
        $db->prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?,?,?)')->execute([$userId, $token, $expiry]);

        NotificationService::create($userId, 'Welcome to Barztify!', 'Your account is ready. Start exploring premium music.', 'system');

        $user = UserModel::findById($userId);
        App::response([
            'token' => $token,
            'user'  => array_merge($user, ['isPremium' => false]),
        ], 201, 'Account created successfully.');
    }

    public static function me(): void {
        $user = AuthMiddleware::handle();
        App::response(['user' => array_merge($user, ['isPremium' => (bool)($user['is_premium'] ?? 0)])]);
    }

    public static function logout(): void {
        $user   = AuthMiddleware::handle();
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token  = trim(substr($header, 7));
        $db     = Database::getInstance();
        $db->prepare('DELETE FROM auth_tokens WHERE token = ?')->execute([$token]);
        App::response(null, 200, 'Logged out successfully.');
    }
}
