<?php
use App\Config\App;
use App\Controllers\AuthController;
use App\Controllers\ForgotPasswordController;
use App\Controllers\SongController;
use App\Controllers\PlaylistController;
use App\Controllers\FavoriteController;
use App\Controllers\RecentlyPlayedController;
use App\Controllers\NotificationController;

$method = $_SERVER['REQUEST_METHOD'];
$rawUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pos    = strpos($rawUri, '/v1');
$uri    = $pos !== false ? substr($rawUri, $pos) : $rawUri;
$uri    = rtrim($uri, '/') ?: '/v1';
$parts  = explode('/', ltrim($uri, '/'));

$resource = $parts[1] ?? '';
$id       = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;
$sub      = isset($parts[2]) && !is_numeric($parts[2]) ? $parts[2] : ($parts[3] ?? '');
$subId    = isset($parts[4]) && is_numeric($parts[4]) ? (int)$parts[4] : null;

// DEBUG — hapus setelah berhasil
if (isset($_GET['debug'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'rawUri'   => $rawUri,
        'uri'      => $uri,
        'parts'    => $parts,
        'resource' => $resource,
        'sub'      => $sub,
        'id'       => $id,
        'method'   => $method,
    ]);
    exit;
}

match(true) {
    $resource === 'auth' && $sub === 'login'    && $method === 'POST' => AuthController::login(),
    $resource === 'auth' && $sub === 'register' && $method === 'POST' => AuthController::register(),
    $resource === 'auth' && $sub === 'me'       && $method === 'GET'  => AuthController::me(),
    $resource === 'auth' && $sub === 'logout'   && $method === 'POST' => AuthController::logout(),

    $resource === 'forgot-password' && $method === 'POST' => ForgotPasswordController::sendReset(),
    $resource === 'reset-password'  && $method === 'POST' => ForgotPasswordController::resetPassword(),

    $resource === 'songs' && $id === null && $sub === ''       && $method === 'GET'  => SongController::index(),
    $resource === 'songs' && $id === null && $sub === 'search' && $method === 'GET'  => SongController::search(),
    $resource === 'songs' && $id !== null && $sub === ''       && $method === 'GET'  => SongController::show($id),
    $resource === 'songs' && $id !== null && $sub === 'play'   && $method === 'POST' => SongController::play($id),

    $resource === 'playlists' && $id === null && $method === 'GET'    => PlaylistController::index(),
    $resource === 'playlists' && $id === null && $method === 'POST'   => PlaylistController::create(),
    $resource === 'playlists' && $id !== null && $sub === '' && $method === 'GET'    => PlaylistController::show($id),
    $resource === 'playlists' && $id !== null && $sub === '' && $method === 'PUT'    => PlaylistController::update($id),
    $resource === 'playlists' && $id !== null && $sub === '' && $method === 'DELETE' => PlaylistController::delete($id),
    $resource === 'playlists' && $id !== null && $sub === 'songs' && $method === 'POST' => PlaylistController::addSong($id),
    $resource === 'playlists' && $id !== null && $sub === 'songs' && $subId !== null && $method === 'DELETE' => PlaylistController::removeSong($id, $subId),

    $resource === 'favorites' && $id === null && $method === 'GET'  => FavoriteController::index(),
    $resource === 'favorites' && $id !== null && $method === 'POST' => FavoriteController::toggle($id),

    $resource === 'recently-played' && $id === null && $method === 'GET'  => RecentlyPlayedController::index(),
    $resource === 'recently-played' && $id !== null && $method === 'POST' => RecentlyPlayedController::record($id),

    $resource === 'notifications' && $id === null && $sub === ''             && $method === 'GET'    => NotificationController::index(),
    $resource === 'notifications' && $id === null && $sub === 'unread-count' && $method === 'GET'    => NotificationController::unreadCount(),
    $resource === 'notifications' && $id === null && $sub === 'read-all'     && $method === 'POST'   => NotificationController::markAllRead(),
    $resource === 'notifications' && $id !== null && $sub === 'read'         && $method === 'POST'   => NotificationController::markRead($id),
    $resource === 'notifications' && $id !== null && $sub === ''             && $method === 'DELETE'  => NotificationController::delete($id),

    default => App::error('Endpoint not found.', 404),
};