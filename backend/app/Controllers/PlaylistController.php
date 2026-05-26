<?php
namespace App\Controllers;

use App\Config\App;
use App\Models\PlaylistModel;
use App\Models\SongModel;
use App\Middleware\AuthMiddleware;
use App\Services\NotificationService;

class PlaylistController {
    public static function index(): void {
        $user    = AuthMiddleware::optional();
        $userId  = $user ? (int)$user['id'] : -1;
        $playlists = PlaylistModel::getForUser($userId);
        App::response(array_map([self::class, 'format'], $playlists));
    }

    public static function show(int $id): void {
        $user     = AuthMiddleware::optional();
        $userId   = $user ? (int)$user['id'] : null;
        $playlist = PlaylistModel::findById($id, $userId);
        if (!$playlist) App::error('Playlist not found.', 404);
        $tracks   = PlaylistModel::getTracks($id);
        App::response(array_merge(self::format($playlist), [
            'tracks' => array_map(fn($s) => [
                'id' => (string)$s['id'], 'title' => $s['title'], 'artist' => $s['artist'],
                'album' => $s['album'] ?? '', 'duration' => (int)$s['duration'],
                'durationFormatted' => sprintf('%d:%02d', intdiv((int)$s['duration'], 60), (int)$s['duration'] % 60),
                'coverUrl' => $s['cover_url'] ?? '',
            ], $tracks),
        ]));
    }

    public static function create(): void {
        $user  = AuthMiddleware::handle();
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $name  = trim($body['name'] ?? '');
        if (!$name) App::error('Playlist name is required.', 422);
        $id = PlaylistModel::create((int)$user['id'], $name, $body['description'] ?? '', (bool)($body['isPublic'] ?? true));
        NotificationService::create((int)$user['id'], 'Playlist created', "Playlist \"{$name}\" has been created.", 'playlist_created');
        App::response(['id' => (string)$id], 201, 'Playlist created.');
    }

    public static function update(int $id): void {
        $user  = AuthMiddleware::handle();
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $name  = trim($body['name'] ?? '');
        if (!$name) App::error('Playlist name is required.', 422);
        $ok = PlaylistModel::update($id, (int)$user['id'], $name, $body['description'] ?? '', (bool)($body['isPublic'] ?? true));
        if (!$ok) App::error('Playlist not found or unauthorized.', 404);
        App::response(null, 200, 'Playlist updated.');
    }

    public static function delete(int $id): void {
        $user = AuthMiddleware::handle();
        $ok   = PlaylistModel::delete($id, (int)$user['id']);
        if (!$ok) App::error('Playlist not found or unauthorized.', 404);
        App::response(null, 200, 'Playlist deleted.');
    }

    public static function addSong(int $playlistId): void {
        $user   = AuthMiddleware::handle();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $songId = (int)($body['songId'] ?? 0);
        if (!$songId) App::error('songId is required.', 422);
        $pl = PlaylistModel::findById($playlistId, (int)$user['id']);
        if (!$pl || (int)$pl['user_id'] !== (int)$user['id']) App::error('Unauthorized.', 403);
        PlaylistModel::addSong($playlistId, $songId);
        $song = SongModel::findById($songId);
        if ($song) NotificationService::create((int)$user['id'], 'Track added', "\"{$song['title']}\" added to playlist.", 'track_added');
        App::response(null, 200, 'Song added to playlist.');
    }

    public static function removeSong(int $playlistId, int $songId): void {
        $user = AuthMiddleware::handle();
        PlaylistModel::removeSong($playlistId, $songId, (int)$user['id']);
        App::response(null, 200, 'Song removed from playlist.');
    }

    private static function format(array $p): array {
        return [
            'id'          => (string)$p['id'],
            'name'        => $p['name'],
            'description' => $p['description'] ?? '',
            'coverUrl'    => $p['cover_url'] ?? '',
            'trackCount'  => (int)($p['track_count'] ?? 0),
            'isPublic'    => (bool)$p['is_public'],
        ];
    }
}
