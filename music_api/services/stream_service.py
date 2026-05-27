"""
StreamService — yt-dlp audio URL extractor
Tidak download file — hanya extract direct audio URL dari YouTube.
"""

import asyncio
import logging
import os
import re
from typing import Optional
import yt_dlp

logger = logging.getLogger("stream_service")

# Path cookies.txt — di-mount saat deploy
_COOKIES_FILE = os.path.join(os.path.dirname(__file__), "..", "cookies.txt")

_YDL_BASE_OPTS = {
    "quiet":             True,
    "no_warnings":       True,
    "skip_download":     True,
    "noplaylist":        True,
    "extract_flat":      False,
    "socket_timeout":    20,
    "retries":           3,
    "extractor_retries": 3,
    "fragment_retries":  3,
    # format_sort: prioritaskan audio-only, codec opus/mp4a, lalu abr tertinggi
    "format_sort":       ["acodec:opus", "acodec:mp4a", "abr", "asr"],
    # Android client lebih lolos anti-bot YouTube di datacenter
    "extractor_args":    {"youtube": {"player_client": ["android", "web"]}},
    "http_headers": {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
}

# Tambahkan cookies jika file tersedia
if os.path.exists(_COOKIES_FILE):
    _YDL_BASE_OPTS["cookiefile"] = _COOKIES_FILE
    logger.info(f"Using cookies from: {_COOKIES_FILE}")
else:
    logger.warning("cookies.txt not found — YouTube may block stream extraction")

# Format fallback chain — dari yang paling spesifik ke paling generik
# Urutan ini penting: yt-dlp coba kiri ke kanan, ambil yang pertama tersedia
_QUALITY_FORMAT_MAP = {
    # webm/opus biasanya selalu tersedia, m4a kadang diblokir di datacenter
    "bestaudio": (
        "bestaudio[ext=webm][acodec=opus]"
        "/bestaudio[ext=m4a]"
        "/bestaudio[acodec=opus]"
        "/bestaudio[acodec=mp4a]"
        "/bestaudio"
        "/best[height<=360]"   # last resort: video stream terendah
    ),
    "128k": (
        "bestaudio[ext=webm][abr<=128]"
        "/bestaudio[abr<=128]"
        "/bestaudio[ext=webm]"
        "/bestaudio"
    ),
    "320k": (
        "bestaudio[ext=m4a][abr>=256]"
        "/bestaudio[ext=webm][abr>=256]"
        "/bestaudio[abr>=256]"
        "/bestaudio[ext=m4a]"
        "/bestaudio[ext=webm]"
        "/bestaudio"
    ),
}

_VIDEO_ID_RE = re.compile(r'^[a-zA-Z0-9_\-]{3,20}$')


def _sanitize_video_id(video_id: str) -> str:
    if not _VIDEO_ID_RE.match(video_id):
        raise ValueError(f"Invalid videoId format: {video_id!r}")
    return video_id


def _extract_info(video_id: str, quality: str) -> dict:
    safe_id = _sanitize_video_id(video_id)
    url = f"https://www.youtube.com/watch?v={safe_id}"
    fmt = _QUALITY_FORMAT_MAP.get(quality, _QUALITY_FORMAT_MAP["bestaudio"])
    opts = {**_YDL_BASE_OPTS, "format": fmt}

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if not info:
            raise ValueError("yt-dlp returned empty info")
        return info


def _pick_stream(info: dict) -> Optional[dict]:
    formats = info.get("formats") or []
    audio_formats = [
        f for f in formats
        if f.get("acodec") != "none" and f.get("url")
    ]
    if not audio_formats:
        return None
    audio_only = [f for f in audio_formats if f.get("vcodec") == "none"]
    pool = audio_only if audio_only else audio_formats
    pool.sort(key=lambda f: (f.get("abr") or 0) + (f.get("tbr") or 0), reverse=True)
    return pool[0]


class StreamService:

    async def get_audio_url(self, video_id: str, quality: str = "bestaudio") -> dict:
        loop = asyncio.get_event_loop()
        try:
            info = await asyncio.wait_for(
                loop.run_in_executor(None, _extract_info, video_id, quality),
                timeout=30.0,
            )
        except asyncio.TimeoutError:
            raise ValueError("Stream extraction timed out — try again")
        except yt_dlp.utils.DownloadError as e:
            raise _classify_dl_error(e)
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Stream extraction failed: {e}") from e

        direct_url = info.get("url")
        fmt_ext    = info.get("ext") or "webm"
        bitrate    = info.get("abr") or info.get("tbr") or 0
        duration   = info.get("duration") or 0
        title      = info.get("title") or video_id

        if not direct_url:
            best = _pick_stream(info)
            if not best:
                raise ValueError("No audio stream found in yt-dlp response")
            direct_url = best.get("url")
            fmt_ext    = best.get("ext") or "webm"
            bitrate    = best.get("abr") or best.get("tbr") or 0

        if not direct_url:
            raise ValueError("Could not extract stream URL")

        return {
            "url":       direct_url,
            "format":    fmt_ext,
            "bitrate":   round(bitrate) if bitrate else None,
            "duration":  int(duration),
            "title":     title,
            "videoId":   video_id,
            "expiresIn": 21600,
        }


def _classify_dl_error(e: yt_dlp.utils.DownloadError) -> ValueError:
    msg = str(e).lower()
    if "video unavailable" in msg or "private video" in msg:
        return ValueError("Video unavailable or private")
    if "geo" in msg or "not available in your country" in msg:
        return ValueError("Content is geo-restricted")
    if "age" in msg and "restrict" in msg:
        return ValueError("Age-restricted content")
    if "copyright" in msg:
        return ValueError("Content removed due to copyright")
    if "sign in" in msg or "requires authentication" in msg:
        return ValueError("Content requires authentication")
    if "requested format is not available" in msg:
        return ValueError("No available audio format — video may be restricted or unavailable")
    return ValueError(f"yt-dlp error: {e}")