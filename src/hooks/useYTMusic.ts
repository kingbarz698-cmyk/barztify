/**
 * TanStack Query hooks untuk Barztify Music API (ytmusicapi backend)
 *
 * Cache strategy:
 *   - Trending / home  : 5 menit
 *   - Search results   : 30 detik (query-dependent)
 *   - Genre tracks     : 5 menit
 *   - Recommendations  : 2 menit
 */

import {
  useQuery,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
  type InfiniteData,
} from '@tanstack/react-query'
import {
  searchTracks,
  searchAlbums,
  searchArtists,
  getTrendingTracks,
  getNewReleases,
  getTracksByGenre,
  getRecommendations,
  type PaginatedTracks,
} from '@/services/ytMusicService'
import type { Track, Album, Artist } from '@/types'

const PER_PAGE = 20

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const musicKeys = {
  all:           ['ytmusic'] as const,
  trending:      (country: string) => ['ytmusic', 'trending', country] as const,
  newReleases:   ()                => ['ytmusic', 'new-releases'] as const,
  search:        (q: string)       => ['ytmusic', 'search', q] as const,
  searchAlbums:  (q: string)       => ['ytmusic', 'search-albums', q] as const,
  searchArtists: (q: string)       => ['ytmusic', 'search-artists', q] as const,
  genre:         (g: string)       => ['ytmusic', 'genre', g] as const,
  reco:          (id: string)      => ['ytmusic', 'reco', id] as const,
}

// ─── Trending / Home ──────────────────────────────────────────────────────────

export function useFeaturedTracks(limit = 10): UseQueryResult<Track[]> {
  return useQuery({
    queryKey: musicKeys.trending('ID'),
    queryFn: async () => {
      const res = await getTrendingTracks('ID', limit)
      return res.tracks
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useNewReleases(limit = 8): UseQueryResult<Track[]> {
  return useQuery({
    queryKey: musicKeys.newReleases(),
    queryFn: async () => {
      const res = await getNewReleases(limit)
      return res.tracks
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearchTracks(query: string, enabled = true) {
  return useInfiniteQuery<PaginatedTracks, Error>({
    queryKey: musicKeys.search(query),
    queryFn: ({ pageParam = 0 }) =>
      searchTracks(query, PER_PAGE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * PER_PAGE : undefined,
    enabled: enabled && query.trim().length > 1,
    staleTime: 30 * 1000,
    retry: 1,
  })
}

export function useSearchAlbums(query: string): UseQueryResult<Album[]> {
  return useQuery({
    queryKey: musicKeys.searchAlbums(query),
    queryFn: () => searchAlbums(query, 8),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
    retry: 1,
  })
}

export function useSearchArtists(query: string): UseQueryResult<Artist[]> {
  return useQuery({
    queryKey: musicKeys.searchArtists(query),
    queryFn: () => searchArtists(query, 6),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
    retry: 1,
  })
}

// ─── Genre ────────────────────────────────────────────────────────────────────

/**
 * @param enabled - Pass false to defer fetching (e.g. when tab not active)
 */
export function useInfiniteGenreTracks(genre: string, enabled = true) {
  return useInfiniteQuery<PaginatedTracks, Error>({
    queryKey: musicKeys.genre(genre),
    queryFn: ({ pageParam = 0 }) =>
      getTracksByGenre(genre, PER_PAGE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * PER_PAGE : undefined,
    enabled: enabled && !!genre,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useRecommendations(videoId: string): UseQueryResult<Track[]> {
  return useQuery({
    queryKey: musicKeys.reco(videoId),
    queryFn: () => getRecommendations(videoId, 20),
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function flattenInfiniteQuery(
  result: UseInfiniteQueryResult<InfiniteData<PaginatedTracks, unknown>, Error>
): Track[] {
  return result.data?.pages.flatMap((p: PaginatedTracks) => p.tracks) ?? []
}