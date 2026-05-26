-- Barztify v2 Database Schema
-- MySQL 8.0+ | UTF8MB4 | Fully normalized

CREATE DATABASE IF NOT EXISTS barztify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barztify;

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                    INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
    name                  VARCHAR(100)     NOT NULL,
    username              VARCHAR(50)      DEFAULT NULL UNIQUE,
    email                 VARCHAR(255)     NOT NULL UNIQUE,
    password_hash         VARCHAR(255)     NOT NULL,
    avatar_url            VARCHAR(500)     DEFAULT NULL,
    is_premium            TINYINT(1)       NOT NULL DEFAULT 0,
    remember_token        VARCHAR(100)     DEFAULT NULL,
    reset_token           VARCHAR(100)     DEFAULT NULL,
    reset_token_expired_at DATETIME        DEFAULT NULL,
    created_at            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email    (email),
    INDEX idx_username (username),
    INDEX idx_reset    (reset_token)
);

-- ─── Auth Tokens ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED  NOT NULL,
    token      VARCHAR(120)  NOT NULL UNIQUE,
    expires_at DATETIME      NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token   (token),
    INDEX idx_expires (expires_at)
);

-- ─── Artists ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artists (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    image_url         VARCHAR(500) DEFAULT NULL,
    monthly_listeners INT UNSIGNED DEFAULT 0,
    bio               TEXT         DEFAULT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Albums ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS albums (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    artist_id  INT UNSIGNED NOT NULL,
    title      VARCHAR(200) NOT NULL,
    cover_url  VARCHAR(500) DEFAULT NULL,
    year       SMALLINT     DEFAULT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    INDEX idx_artist (artist_id)
);

-- ─── Songs ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    artist_id   INT UNSIGNED     NOT NULL,
    album_id    INT UNSIGNED     DEFAULT NULL,
    title       VARCHAR(200)     NOT NULL,
    duration    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    audio_url   VARCHAR(500)     DEFAULT NULL,
    cover_url   VARCHAR(500)     DEFAULT NULL,
    play_count  INT UNSIGNED     NOT NULL DEFAULT 0,
    is_explicit TINYINT(1)       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id)  REFERENCES albums(id)  ON DELETE SET NULL,
    FULLTEXT INDEX ft_title (title),
    INDEX idx_artist (artist_id),
    INDEX idx_album  (album_id)
);

-- ─── Playlists ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlists (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT         DEFAULT NULL,
    cover_url   VARCHAR(500) DEFAULT NULL,
    is_public   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user   (user_id),
    INDEX idx_public (is_public)
);

-- ─── Playlist Songs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist_songs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT UNSIGNED NOT NULL,
    song_id     INT UNSIGNED NOT NULL,
    position    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    added_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_playlist_song (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id)     REFERENCES songs(id)     ON DELETE CASCADE,
    INDEX idx_playlist_position (playlist_id, position)
);

-- ─── Favorites ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    song_id    INT UNSIGNED NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_favorite (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- ─── Recently Played ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recently_played (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    song_id    INT UNSIGNED NOT NULL,
    played_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_recent (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    INDEX idx_user_played (user_id, played_at)
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    title      VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    type       ENUM('playlist_created','track_liked','track_added','login','password_reset','system') NOT NULL DEFAULT 'system',
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read  (user_id, is_read),
    INDEX idx_created    (created_at)
);

-- ─── Rate Limits ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_hash  CHAR(32)  NOT NULL PRIMARY KEY,
    count    INT       NOT NULL DEFAULT 1,
    reset_at DATETIME  NOT NULL,
    INDEX idx_reset (reset_at)
);

-- ─── Demo Data ───────────────────────────────────────────────────────────────
-- Demo user: jacob@barztify.com / barztify123
INSERT IGNORE INTO users (id, name, username, email, password_hash, is_premium) VALUES
(1, 'Jacob Alexandro', 'jacob', 'jacob@barztify.com',
 '$2y$10$wVjKXr.pOdT1qMl7N0xJkuWwLEzP8bX6qNzHf9GvtYZbMbDkOIsHi', 1);

INSERT IGNORE INTO artists (id, name, monthly_listeners) VALUES
(1,'Luna Echo',2800000),(2,'Drift & Pulse',1500000),(3,'Korvax',3200000),
(4,'Aether',980000),(5,'Synthwave Collective',4100000);

INSERT IGNORE INTO albums (id, artist_id, title, year) VALUES
(1,1,'Nightfall',2024),(2,2,'Chrome Sessions',2023),(3,3,'Orbital',2024),
(4,4,'Weightless',2023),(5,5,'Frequencies',2024);

INSERT IGNORE INTO songs (id, artist_id, album_id, title, duration, cover_url) VALUES
(1,1,1,'Midnight Bloom',214,'https://picsum.photos/seed/t1/400/400'),
(2,2,2,'Neon Haze',187,'https://picsum.photos/seed/t2/400/400'),
(3,3,3,'Solar Drift',253,'https://picsum.photos/seed/t3/400/400'),
(4,4,4,'Glass Skies',198,'https://picsum.photos/seed/t4/400/400'),
(5,5,5,'Deep Signal',301,'https://picsum.photos/seed/t5/400/400'),
(6,1,1,'Echo Chamber',222,'https://picsum.photos/seed/t6/400/400'),
(7,2,2,'Pulse Wave',176,'https://picsum.photos/seed/t7/400/400'),
(8,3,3,'Arctic Lullaby',264,'https://picsum.photos/seed/t8/400/400');

INSERT IGNORE INTO notifications (user_id, title, message, type) VALUES
(1,'Welcome to Barztify','Your account is ready. Start exploring premium music.','system'),
(1,'New login detected','A new login was detected on your account.','login');
