"""
MusicService — ytmusicapi wrapper
Semua metadata lagu diambil dari YouTube Music.
Mendukung lagu Indonesia, artist lokal, trending ID.
"""

import asyncio
import logging
from typing import Optional
from ytmusicapi import YTMusic

logger = logging.getLogger("music_service")


def _fmt_dur(seconds: Optional[int]) -> str:
    if not seconds:
        return "0:00"
    m, s = divmod(int(seconds), 60)
    return f"{m}:{s:02d}"


def _best_thumb(thumbnails: list, min_size: int = 300) -> str:
    """Pick highest-res thumbnail, then upgrade URL to max resolution."""
    if not thumbnails:
        return ""
    big = [t for t in thumbnails if t.get("width", 0) >= min_size]
    pool = big if big else thumbnails
    url = max(pool, key=lambda t: t.get("width", 0)).get("url", "")
    return _upgrade_thumb(url)


def _upgrade_thumb(url: str) -> str:
    """
    Upgrade YouTube thumbnail URL ke resolusi tertinggi.
    YouTube thumbnail format:
      https://lh3.googleusercontent.com/...=w226-h226-...  → ganti size param
      https://i.ytimg.com/vi/{id}/default.jpg              → ganti ke maxresdefault
    """
    if not url:
        return ""
    import re
    # ytimg.com thumbnails (video thumbnails)
    # default.jpg / mqdefault.jpg / hqdefault.jpg / sddefault.jpg / maxresdefault.jpg
    url = re.sub(
        r'(https://i\.ytimg\.com/vi(?:_webp)?/[^/]+/)(default|mqdefault|hqdefault|sddefault|maxresdefault)(\.jpg|\.webp)',
        r'\1maxresdefault\3',
        url
    )
    # lh3.googleusercontent.com — ganti size param ke w500
    url = re.sub(r'=w\d+-h\d+', '=w500-h500', url)
    url = re.sub(r'=w\d+', '=w500', url)
    return url


def _map_song(item: dict) -> dict:
    """Map ytmusicapi song/video result → normalized Track dict"""
    vid = item.get("videoId") or ""
    artists = item.get("artists") or []
    artist_str = ", ".join(a.get("name", "") for a in artists if a.get("name"))
    album = item.get("album") or {}
    duration_s = item.get("duration_seconds") or 0
    thumbs = item.get("thumbnails") or []

    return {
        "id": vid,
        "videoId": vid,
        "title": item.get("title") or "Unknown",
        "artist": artist_str or item.get("artist") or "Unknown Artist",
        "album": album.get("name") or item.get("album") or "",
        "duration": duration_s,
        "durationFormatted": item.get("duration") or _fmt_dur(duration_s),
        "thumbnail": _best_thumb(thumbs),
        "coverUrl": _best_thumb(thumbs),
        "isExplicit": item.get("isExplicit") or False,
        "streamUrl": None,  # fetched separately via StreamService
    }


def _map_album(item: dict) -> dict:
    artists = item.get("artists") or []
    artist_str = ", ".join(a.get("name", "") for a in artists if a.get("name"))
    thumbs = item.get("thumbnails") or []
    year_raw = item.get("year") or 0
    try:
        year = int(year_raw)
    except (TypeError, ValueError):
        year = 0

    return {
        "id": item.get("browseId") or item.get("albumId") or "",
        "title": item.get("title") or "Unknown Album",
        "artist": artist_str or "Unknown Artist",
        "coverUrl": _best_thumb(thumbs),
        "year": year,
        "trackCount": item.get("trackCount") or 0,
    }


def _map_artist(item: dict) -> dict:
    thumbs = item.get("thumbnails") or []
    return {
        "id": item.get("browseId") or item.get("artistId") or "",
        "name": item.get("artist") or item.get("name") or "Unknown",
        "imageUrl": _best_thumb(thumbs),
        "monthlyListeners": item.get("subscribers") or 0,
        "genres": [],
    }


class MusicService:
    def __init__(self):
        # Unauthenticated YTMusic — public data only, no account needed
        self._ytm = YTMusic()
        logger.info("YTMusic initialized (unauthenticated)")

    def _run_sync(self, fn, *args, **kwargs):
        """Run blocking ytmusicapi call in thread pool"""
        loop = asyncio.get_running_loop()
        return loop.run_in_executor(None, lambda: fn(*args, **kwargs))

    # ─── Search ───────────────────────────────────────────────────────────────

    async def search_tracks(self, query: str, limit: int = 20) -> list[dict]:
        try:
            results = await self._run_sync(
                self._ytm.search, query, filter="songs", limit=limit, ignore_spelling=False
            )
            tracks = [_map_song(r) for r in (results or []) if r.get("videoId")]
            return tracks[:limit]
        except Exception as e:
            logger.error(f"search_tracks error: {e}")
            # fallback: search videos (includes music videos)
            try:
                results = await self._run_sync(
                    self._ytm.search, query, filter="videos", limit=limit
                )
                return [_map_song(r) for r in (results or []) if r.get("videoId")][:limit]
            except Exception as e2:
                logger.error(f"search_tracks fallback error: {e2}")
                return []

    async def search_albums(self, query: str, limit: int = 10) -> list[dict]:
        try:
            results = await self._run_sync(
                self._ytm.search, query, filter="albums", limit=limit
            )
            return [_map_album(r) for r in (results or [])][:limit]
        except Exception as e:
            logger.error(f"search_albums error: {e}")
            return []

    async def search_artists(self, query: str, limit: int = 10) -> list[dict]:
        try:
            results = await self._run_sync(
                self._ytm.search, query, filter="artists", limit=limit
            )
            return [_map_artist(r) for r in (results or [])][:limit]
        except Exception as e:
            logger.error(f"search_artists error: {e}")
            return []

    async def search_playlists(self, query: str, limit: int = 10) -> list[dict]:
        try:
            results = await self._run_sync(
                self._ytm.search, query, filter="playlists", limit=limit
            )
            mapped = []
            for r in (results or [])[:limit]:
                thumbs = r.get("thumbnails") or []
                mapped.append({
                    "id": r.get("browseId") or "",
                    "name": r.get("title") or "Unknown Playlist",
                    "coverUrl": _best_thumb(thumbs),
                    "trackCount": r.get("itemCount") or 0,
                    "owner": (r.get("author") or [{}])[0].get("name", "") if r.get("author") else "",
                })
            return mapped
        except Exception as e:
            logger.error(f"search_playlists error: {e}")
            return []

    # ─── Trending / Charts ────────────────────────────────────────────────────

    async def get_trending(self, country: str = "ID", limit: int = 20) -> list[dict]:
        """
        Trending via search_trending or charts.
        ytmusicapi.get_charts tersedia untuk beberapa negara.
        """
        try:
            charts = await self._run_sync(self._ytm.get_charts, country=country)
            items = []
            # Try trending songs section
            for section_key in ["songs", "trending", "videos"]:
                section = charts.get(section_key)
                if section:
                    content = section.get("items") or section.get("playlist") or []
                    if content:
                        items = content
                        break

            if not items:
                # Fallback: search popular Indonesian music
                return await self.search_tracks("lagu indonesia terpopuler 2026", limit)

            tracks = []
            for item in items[:limit]:
                song = item.get("title")
                if not song:
                    continue
                vid = item.get("videoId")
                if not vid:
                    continue
                tracks.append(_map_song(item))
            return tracks[:limit]
        except Exception as e:
            logger.warning(f"get_trending charts error ({country}): {e}, falling back to search")
            return await self.search_tracks("lagu indonesia terbaru populer", limit)

    async def get_new_releases(self, limit: int = 12) -> list[dict]:
        try:
            # New releases via search with date bias
            results = await self._run_sync(
                self._ytm.search, "new releases 2026 indonesia", filter="songs", limit=limit
            )
            return [_map_song(r) for r in (results or []) if r.get("videoId")][:limit]
        except Exception as e:
            logger.error(f"get_new_releases error: {e}")
            return await self.search_tracks("rilis baru 2026", limit)

    async def get_recommendations(self, video_id: str, limit: int = 20) -> list[dict]:
        """Next-up / radio from a seed track"""
        try:
            # get_watch_playlist gives "up next" queue
            data = await self._run_sync(
                self._ytm.get_watch_playlist, videoId=video_id, limit=limit + 5
            )
            tracks_raw = data.get("tracks") or []
            # Skip the first one (it's the seed track itself)
            tracks = [_map_song(t) for t in tracks_raw[1:] if t.get("videoId")]
            return tracks[:limit]
        except Exception as e:
            logger.error(f"get_recommendations error: {e}")
            return []

    # ─── Track detail ─────────────────────────────────────────────────────────

    async def get_track(self, video_id: str) -> dict:
        try:
            data = await self._run_sync(self._ytm.get_song, video_id)
            details = data.get("videoDetails") or {}
            thumbs = details.get("thumbnail", {}).get("thumbnails") or []
            duration_s = int(details.get("lengthSeconds") or 0)
            return {
                "id": video_id,
                "videoId": video_id,
                "title": details.get("title") or "Unknown",
                "artist": details.get("author") or "Unknown Artist",
                "album": "",
                "duration": duration_s,
                "durationFormatted": _fmt_dur(duration_s),
                "thumbnail": _best_thumb(thumbs),
                "coverUrl": _best_thumb(thumbs),
                "isExplicit": False,
                "streamUrl": None,
            }
        except Exception as e:
            logger.error(f"get_track error: {e}")
            raise

    # ─── Lyrics ───────────────────────────────────────────────────────────────

    async def get_lyrics(self, video_id: str) -> Optional[dict]:
        """
        Ambil lirik dari YouTube Music.
        Banyak lagu Indonesia tidak punya lirik di YTMusic — return None jika tidak ada.
        """
        try:
            watch = await self._run_sync(
                self._ytm.get_watch_playlist, videoId=video_id, limit=1
            )
            lyrics_id = watch.get("lyrics")
            if not lyrics_id:
                logger.info(f"No lyrics available for {video_id}")
                return None

            lyrics_data = await self._run_sync(self._ytm.get_lyrics, lyrics_id)
            if not lyrics_data:
                return None

            lyrics_text = lyrics_data.get("lyrics") or ""
            if not lyrics_text.strip():
                return None

            return {
                "lyrics": lyrics_text,
                "source": lyrics_data.get("source") or "YouTube Music",
                "hasLyrics": True,
            }
        except Exception as e:
            logger.warning(f"get_lyrics error (non-fatal) [{video_id}]: {e}")
            return None

    # ─── Artist songs ─────────────────────────────────────────────────────────

    async def get_artist_songs(self, artist_id: str, limit: int = 20) -> list[dict]:
        try:
            artist = await self._run_sync(self._ytm.get_artist, artist_id)
            songs_section = artist.get("songs") or {}
            results = songs_section.get("results") or []
            if not results:
                # Try getting more via browseId
                params = songs_section.get("params")
                if params:
                    more = await self._run_sync(
                        self._ytm.get_artist_albums, artist_id, params
                    )
                    results = more or []
            return [_map_song(r) for r in results if r.get("videoId")][:limit]
        except Exception as e:
            logger.error(f"get_artist_songs error: {e}")
            return []
