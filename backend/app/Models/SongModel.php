<?php
namespace App\Models;

use App\Config\Database;

class SongModel {
    public static function getAll(int $limit = 50, int $offset = 0): array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url, s.is_explicit, s.play_count,
                    a.name AS artist, al.title AS album
             FROM songs s
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             ORDER BY s.play_count DESC LIMIT ? OFFSET ?'
        );
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }

    public static function search(string $query, int $limit = 30): array {
        $db   = Database::getInstance();
        $q    = "%{$query}%";
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url, s.is_explicit,
                    a.name AS artist, al.title AS album
             FROM songs s
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             WHERE s.title LIKE ? OR a.name LIKE ? OR al.title LIKE ?
             LIMIT ?'
        );
        $stmt->execute([$q, $q, $q, $limit]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url, s.is_explicit, s.play_count,
                    a.name AS artist, al.title AS album
             FROM songs s
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             WHERE s.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function incrementPlayCount(int $id): void {
        $db   = Database::getInstance();
        $db->prepare('UPDATE songs SET play_count = play_count + 1 WHERE id = ?')->execute([$id]);
    }
}
