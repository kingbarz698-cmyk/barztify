"""
Barztify Music API
Stack: FastAPI + ytmusicapi + yt-dlp
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import os
import re

from services.music_service import MusicService
from services.stream_service import StreamService
from services.cache_service import cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("barztify_api")

app = FastAPI(
    title="Barztify Music API",
    description="YouTube Music powered API — ytmusicapi + yt-dlp",
    version="3.0.0",
)

# CORS: izinkan semua asal lokal (localhost + 192.168.x.x)
# Untuk development — set CORS_ORIGINS di env untuk production
_ENV_ORIGINS = os.getenv("CORS_ORIGINS", "")
if _ENV_ORIGINS:
    ALLOWED_ORIGINS = [o.strip() for o in _ENV_ORIGINS.split(",") if o.strip()]
else:
    # Default: izinkan semua origin lokal (dev friendly)
    ALLOWED_ORIGINS = ["*"]

_use_credentials = "*" not in ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=_use_credentials,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

music = MusicService()
stream = StreamService()

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _valid_video_id(video_id: str) -> bool:
    if not video_id:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_\-]{3,20}$', video_id))


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "barztify-music-api", "version": "3.0.0"}


# ─── Search ───────────────────────────────────────────────────────────────────

@app.get("/search")
async def search(
    q: str = Query(..., min_length=1, max_length=200),
    type: str = Query("tracks", pattern="^(tracks|albums|artists|playlists)$"),
    limit: int = Query(20, ge=1, le=50),
):
    cache_key = f"search:{type}:{q}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        if type == "tracks":
            results = await music.search_tracks(q, limit)
        elif type == "albums":
            results = await music.search_albums(q, limit)
        elif type == "artists":
            results = await music.search_artists(q, limit)
        else:
            results = await music.search_playlists(q, limit)
        response = {"success": True, "data": results, "total": len(results)}
        cache.set(cache_key, response, ttl=30)
        return response
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed. Please try again.")


# ─── Trending ─────────────────────────────────────────────────────────────────

@app.get("/trending")
async def trending(
    country: str = Query("ID", max_length=3),
    limit: int = Query(20, ge=1, le=50),
):
    cache_key = f"trending:{country}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        results = await music.get_trending(country, limit)
        response = {"success": True, "data": results, "total": len(results)}
        cache.set(cache_key, response, ttl=300)
        return response
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending tracks.")


@app.get("/new-releases")
async def new_releases(limit: int = Query(12, ge=1, le=50)):
    cache_key = f"new_releases:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        results = await music.get_new_releases(limit)
        response = {"success": True, "data": results}
        cache.set(cache_key, response, ttl=300)
        return response
    except Exception as e:
        logger.error(f"New releases error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch new releases.")


@app.get("/recommendations")
async def recommendations(
    video_id: str = Query(..., min_length=3, max_length=20),
    limit: int = Query(20, ge=1, le=50),
):
    if not _valid_video_id(video_id):
        raise HTTPException(status_code=400, detail="Invalid videoId format.")
    cache_key = f"reco:{video_id}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        results = await music.get_recommendations(video_id, limit)
        response = {"success": True, "data": results}
        cache.set(cache_key, response, ttl=120)
        return response
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recommendations.")


# ─── Track detail ─────────────────────────────────────────────────────────────

@app.get("/track/{video_id}")
async def get_track(video_id: str):
    if not _valid_video_id(video_id):
        raise HTTPException(status_code=400, detail="Invalid videoId.")
    cache_key = f"track:{video_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        track = await music.get_track(video_id)
        response = {"success": True, "data": track}
        cache.set(cache_key, response, ttl=600)
        return response
    except Exception as e:
        logger.error(f"Track detail error: {e}")
        raise HTTPException(status_code=404, detail="Track not found.")


# ─── Stream URL ───────────────────────────────────────────────────────────────

@app.get("/stream/{video_id}")
async def get_stream_url(
    video_id: str,
    quality: str = Query("bestaudio", pattern="^(bestaudio|128k|320k)$"),
):
    if not _valid_video_id(video_id):
        raise HTTPException(status_code=400, detail="Invalid videoId.")
    cache_key = f"stream:{video_id}:{quality}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        result = await stream.get_audio_url(video_id, quality)
        response = {"success": True, "data": result}
        cache.set(cache_key, response, ttl=18000)
        return response
    except ValueError as e:
        logger.warning(f"Stream client error [{video_id}]: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Stream server error [{video_id}]: {e}")
        raise HTTPException(status_code=503, detail="Stream temporarily unavailable.")


# ─── Lyrics ───────────────────────────────────────────────────────────────────

@app.get("/lyrics/{video_id}")
async def get_lyrics(video_id: str):
    if not _valid_video_id(video_id):
        raise HTTPException(status_code=400, detail="Invalid videoId.")
    cache_key = f"lyrics:{video_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        lyrics = await music.get_lyrics(video_id)
        response = {"success": True, "data": lyrics}
        cache.set(cache_key, response, ttl=3600)
        return response
    except Exception as e:
        logger.error(f"Lyrics error: {e}")
        return {"success": False, "data": None}


# ─── Genre ────────────────────────────────────────────────────────────────────

@app.get("/genre")
async def genre_tracks(
    genre: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(20, ge=1, le=50),
):
    cache_key = f"genre:{genre}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        results = await music.search_tracks(genre, limit)
        response = {"success": True, "data": results}
        cache.set(cache_key, response, ttl=300)
        return response
    except Exception as e:
        logger.error(f"Genre error: {e}")
        raise HTTPException(status_code=500, detail="Genre fetch failed.")


# ─── Artist tracks ────────────────────────────────────────────────────────────

@app.get("/artist/{artist_id}/tracks")
async def artist_tracks(artist_id: str, limit: int = Query(20, ge=1, le=50)):
    cache_key = f"artist_tracks:{artist_id}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        results = await music.get_artist_songs(artist_id, limit)
        response = {"success": True, "data": results}
        cache.set(cache_key, response, ttl=600)
        return response
    except Exception as e:
        logger.error(f"Artist tracks error: {e}")
        raise HTTPException(status_code=500, detail="Artist tracks fetch failed.")


# ─── Debug (HAPUS sebelum production) ────────────────────────────────────────

@app.get("/debug/formats/{video_id}")
async def debug_formats(video_id: str):
    """List semua format tersedia untuk video — untuk diagnosa yt-dlp."""
    import yt_dlp, os
    _COOKIES_FILE = os.path.join(os.path.dirname(__file__), "cookies.txt")
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
    }
    if os.path.exists(_COOKIES_FILE):
        opts["cookiefile"] = _COOKIES_FILE
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        formats = info.get("formats", [])
        audio_fmts = [
            {
                "format_id": f.get("format_id"),
                "ext":        f.get("ext"),
                "acodec":     f.get("acodec"),
                "vcodec":     f.get("vcodec"),
                "abr":        f.get("abr"),
                "tbr":        f.get("tbr"),
                "has_url":    bool(f.get("url")),
            }
            for f in formats
            if f.get("acodec") and f.get("acodec") != "none"
        ]
        return {
            "videoId":       video_id,
            "title":         info.get("title"),
            "cookies_used":  os.path.exists(_COOKIES_FILE),
            "total_formats": len(formats),
            "audio_formats": audio_fmts,
        }
    except Exception as e:
        return {"error": str(e), "cookies_used": os.path.exists(_COOKIES_FILE)}