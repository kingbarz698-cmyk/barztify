<?php
namespace App\Controllers;

use App\Config\App;
use App\Config\Database;
use App\Models\SongModel;
use App\Middleware\AuthMiddleware;
use App\Services\NotificationService;

class FavoriteController {
    public static function index(): void {
        $user = AuthMiddleware::handle();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url, s.is_explicit,
                    a.name AS artist, al.title AS album
             FROM favorites f
             JOIN songs s    ON s.id  = f.song_id
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             WHERE f.user_id = ? ORDER BY f.created_at DESC'
        );
        $stmt->execute([(int)$user['id']]);
        $songs = $stmt->fetchAll();
        App::response(array_map(fn($s) => [
            'id' => (string)$s['id'], 'title' => $s['title'], 'artist' => $s['artist'],
            'album' => $s['album'] ?? '', 'duration' => (int)$s['duration'],
            'durationFormatted' => sprintf('%d:%02d', intdiv((int)$s['duration'], 60), (int)$s['duration'] % 60),
            'coverUrl' => $s['cover_url'] ?? '', 'isLiked' => true,
        ], $songs));
    }

    public static function toggle(int $songId): void {
        $user = AuthMiddleware::handle();
        $db   = Database::getInstance();
        $uid  = (int)$user['id'];

        $exists = $db->prepare('SELECT id FROM favorites WHERE user_id=? AND song_id=?');
        $exists->execute([$uid, $songId]);

        if ($exists->fetch()) {
            $db->prepare('DELETE FROM favorites WHERE user_id=? AND song_id=?')->execute([$uid, $songId]);
            App::response(['isLiked' => false], 200, 'Removed from favorites.');
        } else {
            $db->prepare('INSERT IGNORE INTO favorites (user_id, song_id) VALUES (?,?)')->execute([$uid, $songId]);
            $song = SongModel::findById($songId);
            if ($song) NotificationService::create($uid, 'Added to Liked Songs', "\"{$song['title']}\" was added to your liked songs.", 'track_liked');
            App::response(['isLiked' => true], 200, 'Added to favorites.');
        }
    }
}
