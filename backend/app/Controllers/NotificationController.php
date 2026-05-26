<?php
namespace App\Controllers;

use App\Config\App;
use App\Middleware\AuthMiddleware;
use App\Services\NotificationService;

class NotificationController {
    public static function index(): void {
        $user  = AuthMiddleware::handle();
        $items = NotificationService::getByUser((int)$user['id']);
        $result = array_map(fn($n) => [
            'id'        => (string)$n['id'],
            'title'     => $n['title'],
            'message'   => $n['message'],
            'type'      => $n['type'],
            'isRead'    => (bool)$n['is_read'],
            'createdAt' => $n['created_at'],
        ], $items);
        App::response($result);
    }

    public static function unreadCount(): void {
        $user  = AuthMiddleware::handle();
        $count = NotificationService::unreadCount((int)$user['id']);
        App::response(['count' => $count]);
    }

    public static function markRead(int $id): void {
        $user = AuthMiddleware::handle();
        NotificationService::markAsRead($id, (int)$user['id']);
        App::response(null, 200, 'Marked as read.');
    }

    public static function markAllRead(): void {
        $user = AuthMiddleware::handle();
        NotificationService::markAllAsRead((int)$user['id']);
        App::response(null, 200, 'All notifications marked as read.');
    }

    public static function delete(int $id): void {
        $user = AuthMiddleware::handle();
        NotificationService::delete($id, (int)$user['id']);
        App::response(null, 200, 'Notification deleted.');
    }
}
