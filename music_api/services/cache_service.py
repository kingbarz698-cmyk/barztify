"""
Simple in-memory cache with TTL.
Thread-safe untuk FastAPI async workers.
"""

import time
import threading
from typing import Any, Optional


class TTLCache:
    def __init__(self, max_size: int = 1000):
        self._store: dict[str, tuple[Any, float]] = {}  # key -> (value, expires_at)
        self._lock = threading.Lock()
        self._max_size = max_size

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if expires_at and time.time() > expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: int = 300):
        """ttl in seconds, 0 = no expiry"""
        with self._lock:
            # Evict oldest if at capacity
            if len(self._store) >= self._max_size:
                oldest_key = min(self._store, key=lambda k: self._store[k][1] or 0)
                del self._store[oldest_key]
            expires_at = time.time() + ttl if ttl else 0
            self._store[key] = (value, expires_at)

    def delete(self, key: str):
        with self._lock:
            self._store.pop(key, None)

    def clear(self):
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        return len(self._store)


# Singleton
cache = TTLCache(max_size=2000)
