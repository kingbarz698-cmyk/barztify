<?php
namespace App\Controllers;

use App\Config\App;
use App\Models\SongModel;
use App\Middleware\AuthMiddleware;

class SongController {
    public static function index(): void {
        AuthMiddleware::handle();
        $limit  = min((int)($_GET['limit']  ?? 50), 100);
        $offset = (int)($_GET['offset'] ?? 0);
        $songs  = SongModel::getAll($limit, $offset);
        App::response(array_map([self::class, 'format'], $songs));
    }

    public static function search(): void {
        AuthMiddleware::handle();
        $q = trim($_GET['q'] ?? '');
        if (!$q) App::error('Query parameter q is required.', 422);
        App::response(array_map([self::class, 'format'], SongModel::search($q)));
    }

    public static function show(int $id): void {
        AuthMiddleware::handle();
        $song = SongModel::findById($id);
        if (!$song) App::error('Song not found.', 404);
        App::response(self::format($song));
    }

    public static function play(int $id): void {
        AuthMiddleware::handle();
        $song = SongModel::findById($id);
        if (!$song) App::error('Song not found.', 404);
        SongModel::incrementPlayCount($id);
        App::response(['audioUrl' => $song['audio_url']], 200, 'Stream ready.');
    }

    private static function format(array $s): array {
        $dur = (int)$s['duration'];
        return [
            'id'                => (string)$s['id'],
            'title'             => $s['title'],
            'artist'            => $s['artist'],
            'album'             => $s['album'] ?? '',
            'duration'          => $dur,
            'durationFormatted' => sprintf('%d:%02d', intdiv($dur, 60), $dur % 60),
            'coverUrl'          => $s['cover_url'] ?? '',
            'audioUrl'          => $s['audio_url'] ?? null,
            'isExplicit'        => (bool)($s['is_explicit'] ?? false),
        ];
    }
}
