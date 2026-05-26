<?php
namespace App\Models;

use App\Config\Database;

class PlaylistModel {
    public static function getForUser(int $userId): array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT p.id, p.name, p.description, p.cover_url, p.is_public,
                    COUNT(ps.song_id) AS track_count
             FROM playlists p
             LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
             WHERE p.user_id = ? OR p.is_public = 1
             GROUP BY p.id ORDER BY p.created_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id, ?int $userId): ?array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT p.id, p.name, p.description, p.cover_url, p.is_public, p.user_id,
                    COUNT(ps.song_id) AS track_count
             FROM playlists p
             LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
             WHERE p.id = ? AND (p.is_public = 1 OR p.user_id = ?)
             GROUP BY p.id LIMIT 1'
        );
        $stmt->execute([$id, $userId ?? -1]);
        return $stmt->fetch() ?: null;
    }

    public static function getTracks(int $playlistId): array {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.id, s.title, s.duration, s.cover_url, s.audio_url, s.is_explicit,
                    a.name AS artist, al.title AS album, ps.position
             FROM playlist_songs ps
             JOIN songs s    ON s.id  = ps.song_id
             JOIN artists a  ON a.id  = s.artist_id
             LEFT JOIN albums al ON al.id = s.album_id
             WHERE ps.playlist_id = ?
             ORDER BY ps.position ASC'
        );
        $stmt->execute([$playlistId]);
        return $stmt->fetchAll();
    }

    public static function create(int $userId, string $name, string $description = '', bool $isPublic = true): int {
        $db   = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)');
        $stmt->execute([$userId, $name, $description, $isPublic ? 1 : 0]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $id, int $userId, string $name, string $description, bool $isPublic): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE playlists SET name=?, description=?, is_public=? WHERE id=? AND user_id=?');
        return $stmt->execute([$name, $description, $isPublic ? 1 : 0, $id, $userId]);
    }

    public static function delete(int $id, int $userId): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?');
        return $stmt->execute([$id, $userId]);
    }

    public static function addSong(int $playlistId, int $songId): bool {
        $db   = Database::getInstance();
        $pos  = $db->prepare('SELECT COALESCE(MAX(position),0)+1 FROM playlist_songs WHERE playlist_id=?');
        $pos->execute([$playlistId]);
        $next = (int) $pos->fetchColumn();
        $stmt = $db->prepare('INSERT IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES (?,?,?)');
        return $stmt->execute([$playlistId, $songId, $next]);
    }

    public static function removeSong(int $playlistId, int $songId, int $userId): bool {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'DELETE ps FROM playlist_songs ps
             JOIN playlists p ON p.id = ps.playlist_id
             WHERE ps.playlist_id=? AND ps.song_id=? AND p.user_id=?'
        );
        return $stmt->execute([$playlistId, $songId, $userId]);
    }
}
