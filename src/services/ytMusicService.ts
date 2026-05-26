/**
 * ytMusicService — Frontend service untuk Barztify Music API
 * Backend: FastAPI + ytmusicapi + yt-dlp
 * No Jamendo. No mock. Real YouTube Music data.
 */

import axios, { AxiosError } from 'axios'
import type { Track, Album, Artist } from '@/types'

const MUSIC_API = import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:7979'

const musicApi = axios.create({
  baseURL: MUSIC_API,
  timeout: 25000, // Generous timeout for yt-dlp stream extraction
  headers: { 'Content-Type': 'application/json' },
})

// ─── Response interceptor: normalize errors ───────────────────────────────────
musicApi.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const detail = (err.response?.data as Record<string, unknown>)?.detail
    const msg = typeof detail === 'string'
      ? detail
      : err.message || 'Music API error'
    return Promise.reject(new Error(msg))
  }
)

// ─── Response shape from FastAPI ─────────────────────────────────────────────

interface ApiTrack {
  id: string
  videoId: string
  title: string
  artist: string
  album: string
  duration: number
  durationFormatted: string
  thumbnail: string
  coverUrl: string
  isExplicit?: boolean
  streamUrl?: string | null
}

interface ApiAlbum {
  id: string
  title: string
  artist: string
  coverUrl: string
  year: number
  trackCount: number
}

interface ApiArtist {
  id: string
  name: string
  imageUrl: string
  monthlyListeners?: number
  genres?: string[]
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapTrack(t: ApiTrack): Track {
  return {
    id:                t.videoId || t.id,
    title:             t.title || 'Unknown',
    artist:            t.artist || 'Unknown Artist',
    album:             t.album || '',
    duration:          t.duration || 0,
    durationFormatted: t.durationFormatted || fmtDur(t.duration),
    coverUrl:          t.coverUrl || t.thumbnail || '',
    audioUrl:          t.streamUrl ?? undefined,
    isLiked:           false,
    isExplicit:        t.isExplicit || false,
  }
}

function fmtDur(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

// ─── Stream cache (in-memory, per session) ───────────────────────────────────
// Mirrors backend cache; prevents re-fetching stream URL within 5h session

const streamCache = new Map<string, { url: string; cachedAt: number }>()
const STREAM_CACHE_TTL = 5 * 60 * 60 * 1000 // 5h in ms (YT URL valid ~6h)

async function getStreamUrl(videoId: string): Promise<string> {
  const cached = streamCache.get(videoId)
  if (cached && Date.now() - cached.cachedAt < STREAM_CACHE_TTL) {
    return cached.url
  }
  const { data } = await musicApi.get(`/stream/${videoId}`)
  const url: string = data.data?.url
  if (!url) throw new Error('No stream URL returned from backend')
  streamCache.set(videoId, { url, cachedAt: Date.now() })
  return url
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface PaginatedTracks {
  tracks: Track[]
  total: number
  hasMore: boolean
}

/** Search tracks — supports Indonesian songs, typos, artist names */
export async function searchTracks(
  query: string,
  limit = 20,
  offset = 0
): Promise<PaginatedTracks> {
  if (!query.trim()) return { tracks: [], total: 0, hasMore: false }
  const { data } = await musicApi.get('/search', {
    params: { q: query.trim(), type: 'tracks', limit },
  })
  const tracks = ((data.data || []) as ApiTrack[]).map(mapTrack)
  const sliced = tracks.slice(offset, offset + limit)
  return {
    tracks: sliced,
    total: data.total || tracks.length,
    hasMore: offset + limit < tracks.length,
  }
}

/** Search albums */
export async function searchAlbums(query: string, limit = 10): Promise<Album[]> {
  if (!query.trim()) return []
  const { data } = await musicApi.get('/search', {
    params: { q: query.trim(), type: 'albums', limit },
  })
  return ((data.data || []) as ApiAlbum[]).map((a) => ({
    id:         a.id,
    title:      a.title,
    artist:     a.artist,
    coverUrl:   a.coverUrl,
    year:       a.year,
    trackCount: a.trackCount,
  }))
}

/** Search artists */
export async function searchArtists(query: string, limit = 10): Promise<Artist[]> {
  if (!query.trim()) return []
  const { data } = await musicApi.get('/search', {
    params: { q: query.trim(), type: 'artists', limit },
  })
  return ((data.data || []) as ApiArtist[]).map((a) => ({
    id:               a.id,
    name:             a.name,
    imageUrl:         a.imageUrl,
    monthlyListeners: a.monthlyListeners,
    genres:           a.genres || [],
    isFollowing:      false,
  }))
}

/** Trending tracks — default Indonesia */
export async function getTrendingTracks(
  country = 'ID',
  limit = 20
): Promise<PaginatedTracks> {
  const { data } = await musicApi.get('/trending', { params: { country, limit } })
  const tracks = ((data.data || []) as ApiTrack[]).map(mapTrack)
  return { tracks, total: tracks.length, hasMore: false }
}

/** New releases */
export async function getNewReleases(limit = 12): Promise<PaginatedTracks> {
  const { data } = await musicApi.get('/new-releases', { params: { limit } })
  const tracks = ((data.data || []) as ApiTrack[]).map(mapTrack)
  return { tracks, total: tracks.length, hasMore: false }
}

/** Tracks by genre keyword */
export async function getTracksByGenre(
  genre: string,
  limit = 20,
  offset = 0
): Promise<PaginatedTracks> {
  if (!genre.trim()) return { tracks: [], total: 0, hasMore: false }
  const { data } = await musicApi.get('/genre', {
    params: { genre: genre.trim(), limit },
  })
  const tracks = ((data.data || []) as ApiTrack[]).map(mapTrack)
  const sliced = tracks.slice(offset, offset + limit)
  return { tracks: sliced, total: tracks.length, hasMore: offset + limit < tracks.length }
}

/** Recommendations / radio based on seed track */
export async function getRecommendations(videoId: string, limit = 20): Promise<Track[]> {
  if (!videoId) return []
  const { data } = await musicApi.get('/recommendations', {
    params: { video_id: videoId, limit },
  })
  return ((data.data || []) as ApiTrack[]).map(mapTrack)
}

/** Get audio stream URL — called by player before playback */
export async function resolveStreamUrl(videoId: string): Promise<string> {
  return getStreamUrl(videoId)
}

/** Get lyrics if available */
export async function getLyrics(
  videoId: string
): Promise<{ lyrics: string; source: string } | null> {
  try {
    const { data } = await musicApi.get(`/lyrics/${videoId}`)
    return data.data || null
  } catch {
    return null
  }
}

/** Invalidate a stream URL cache entry (call on audio error to force re-fetch) */
export function invalidateStreamUrl(videoId: string): void {
  streamCache.delete(videoId)
}

// ─── Genres (Indonesian + Global) ────────────────────────────────────────────

export const MUSIC_GENRES = [
  { id: 'pop indonesia',     name: 'Pop Indonesia',  gradient: 'from-rose-500 to-pink-900' },
  { id: 'dangdut',           name: 'Dangdut',        gradient: 'from-orange-500 to-amber-900' },
  { id: 'rock indonesia',    name: 'Rock Indonesia', gradient: 'from-red-600 to-rose-900' },
  { id: 'indie indonesia',   name: 'Indie',          gradient: 'from-violet-500 to-purple-900' },
  { id: 'hip hop indonesia', name: 'Hip-Hop',        gradient: 'from-sky-500 to-blue-900' },
  { id: 'jazz indonesia',    name: 'Jazz',           gradient: 'from-amber-500 to-orange-900' },
  { id: 'rnb indonesia',     name: 'R&B',            gradient: 'from-fuchsia-500 to-purple-900' },
  { id: 'keroncong',         name: 'Keroncong',      gradient: 'from-lime-500 to-green-900' },
  { id: 'pop',               name: 'Pop Global',     gradient: 'from-emerald-500 to-teal-900' },
  { id: 'electronic',        name: 'Electronic',     gradient: 'from-cyan-500 to-blue-900' },
]
