<?php
namespace App\Services;

use App\Config\Database;

class NotificationService {
    public static function create(int $userId, string $title, string $message, string $type = 'system'): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)'
        );
        return $stmt->execute([$userId, $title, $message, $type]);
    }

    public static function getByUser(int $userId, int $limit = 50): array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT id, title, message, type, is_read, created_at
             FROM notifications WHERE user_id = ?
             ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }

    public static function markAsRead(int $notifId, int $userId): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
        return $stmt->execute([$notifId, $userId]);
    }

    public static function markAllAsRead(int $userId): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
        return $stmt->execute([$userId]);
    }

    public static function delete(int $notifId, int $userId): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
        return $stmt->execute([$notifId, $userId]);
    }

    public static function unreadCount(int $userId): int {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0');
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }
}
