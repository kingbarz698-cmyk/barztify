"""
StreamService — yt-dlp audio URL extractor
Tidak download file — hanya extract direct audio URL dari YouTube.
URL yang dikembalikan adalah signed CDN URL yang bisa di-stream browser.

FIXES:
  - Added extract_flat=False explicitly
  - Added extractor_retries for network resilience
  - Added fragment_retries
  - Sanitized video_id before constructing URL (defense in depth)
  - Improved error classification
"""

import asyncio
import logging
import re
from typing import Optional
import yt_dlp

logger = logging.getLogger("stream_service")

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

_QUALITY_FORMAT_MAP = {
    "bestaudio": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best",
    "128k":      "bestaudio[abr<=128]/bestaudio",
    "320k":      "bestaudio[ext=m4a]/bestaudio[abr>=256]/bestaudio/best",
}

# Whitelist: only alphanumeric, dash, underscore (matches YouTube videoId format)
_VIDEO_ID_RE = re.compile(r'^[a-zA-Z0-9_\-]{3,20}$')


def _sanitize_video_id(video_id: str) -> str:
    """Ensure videoId is safe before embedding in URL."""
    if not _VIDEO_ID_RE.match(video_id):
        raise ValueError(f"Invalid videoId format: {video_id!r}")
    return video_id


def _extract_info(video_id: str, quality: str) -> dict:
    """Blocking yt-dlp call — run in executor. Never called from async context directly."""
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
    """Pick the best audio-only format from yt-dlp info."""
    formats = info.get("formats") or []
    # Filter: must have URL and audio codec
    audio_formats = [
        f for f in formats
        if f.get("acodec") != "none" and f.get("url")
    ]
    if not audio_formats:
        return None

    # Prefer audio-only (no video), then sort by bitrate desc
    audio_only = [f for f in audio_formats if f.get("vcodec") == "none"]
    pool = audio_only if audio_only else audio_formats
    pool.sort(key=lambda f: (f.get("abr") or 0) + (f.get("tbr") or 0), reverse=True)
    return pool[0]


class StreamService:

    async def get_audio_url(self, video_id: str, quality: str = "bestaudio") -> dict:
        """
        Extract audio stream URL for a YouTube videoId.
        Returns:
          - url: direct audio CDN URL
          - format: m4a / webm / mp4
          - bitrate: in kbps
          - duration: seconds
          - title: track title from YT
          - expiresIn: approximate TTL in seconds
        """
        loop = asyncio.get_event_loop()
        try:
            info = await asyncio.wait_for(
                loop.run_in_executor(None, _extract_info, video_id, quality),
                timeout=30.0,  # Hard cap — yt-dlp can hang
            )
        except asyncio.TimeoutError:
            raise ValueError("Stream extraction timed out — try again")
        except yt_dlp.utils.DownloadError as e:
            raise _classify_dl_error(e)
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Stream extraction failed: {e}") from e

        # Try direct URL first (single-format response)
        direct_url = info.get("url")
        fmt_ext    = info.get("ext") or "m4a"
        bitrate    = info.get("abr") or info.get("tbr") or 0
        duration   = info.get("duration") or 0
        title      = info.get("title") or video_id

        if not direct_url:
            best = _pick_stream(info)
            if not best:
                raise ValueError("No audio stream found in yt-dlp response")
            direct_url = best.get("url")
            fmt_ext    = best.get("ext") or "m4a"
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
            # YouTube signed URLs expire in ~6 hours
            "expiresIn": 21600,
        }


def _classify_dl_error(e: yt_dlp.utils.DownloadError) -> ValueError:
    """Convert yt-dlp DownloadError to a user-friendly ValueError."""
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
    return ValueError(f"yt-dlp error: {e}")
