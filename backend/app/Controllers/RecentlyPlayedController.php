<?php
namespace App\Controllers;

use App\Config\App;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class RecentlyPlayedController {
    public static function index(): void {
        $user = AuthMiddleware::handle();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url,
                    a.name AS artist, al.title AS album, rp.played_at
             FROM recently_played rp
             JOIN songs s    ON s.id  = rp.song_id
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             WHERE rp.user_id = ? ORDER BY rp.played_at DESC LIMIT 20'
        );
        $stmt->execute([(int)$user['id']]);
        App::response($stmt->fetchAll());
    }

    public static function record(int $songId): void {
        $user = AuthMiddleware::handle();
        $db   = Database::getInstance();
        $db->prepare(
            'INSERT INTO recently_played (user_id, song_id)
             VALUES (?,?) ON DUPLICATE KEY UPDATE played_at = NOW()'
        )->execute([(int)$user['id'], $songId]);
        App::response(null, 200, 'Recorded.');
    }
}
