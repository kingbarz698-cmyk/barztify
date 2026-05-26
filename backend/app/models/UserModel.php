<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class UserModel {
    /** Safe columns only — no password_hash */
    public static function findById(int $id): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id, name, username, email, avatar_url, is_premium, created_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /** For login — includes password_hash, supports email OR username */
    public static function findByIdentifierForAuth(string $identifier): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT id, name, username, email, password_hash, avatar_url, is_premium
             FROM users WHERE email = ? OR username = ? LIMIT 1'
        );
        $stmt->execute([$identifier, $identifier]);
        return $stmt->fetch() ?: null;
    }

    public static function findByEmail(string $email): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id, name, email, username FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function findByUsername(string $username): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public static function create(string $name, string $username, string $email, string $passwordHash): int {
        $db   = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $username, $email, $passwordHash]);
        return (int) $db->lastInsertId();
    }

    public static function setResetToken(int $userId, string $token, string $expiry): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE users SET reset_token = ?, reset_token_expired_at = ? WHERE id = ?');
        return $stmt->execute([$token, $expiry, $userId]);
    }

    public static function findByResetToken(string $token): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT id, name, email FROM users
             WHERE reset_token = ? AND reset_token_expired_at > NOW() LIMIT 1'
        );
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    public static function updatePassword(int $userId, string $passwordHash): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expired_at = NULL WHERE id = ?'
        );
        return $stmt->execute([$passwordHash, $userId]);
    }
}
