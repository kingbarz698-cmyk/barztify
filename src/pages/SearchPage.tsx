import { useState, useCallback, useRef } from 'react'
import { Search, X, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrackRow } from '@/components/cards/TrackRow'
import { AlbumCard } from '@/components/cards/AlbumCard'
import { TrackRowSkeleton, AlbumCardSkeleton } from '@/components/loading/Skeleton'
import { usePlayerStore } from '@/store/playerStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useSearchTracks, useSearchAlbums, flattenInfiniteQuery } from '@/hooks/useYTMusic'
import { MUSIC_GENRES } from '@/services/ytMusicService'
import type { Track } from '@/types'

export function SearchPage() {
  const [query, setQuery]         = useState('')
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks')
  const debouncedQuery            = useDebounce(query, 400)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const playTrack    = usePlayerStore((s) => s.playTrack)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying    = usePlayerStore((s) => s.isPlaying)

  const trackResults = useSearchTracks(debouncedQuery)
  const albumResults = useSearchAlbums(debouncedQuery)
  const tracks       = flattenInfiniteQuery(trackResults)

  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (trackResults.hasNextPage && !trackResults.isFetchingNextPage) {
        trackResults.fetchNextPage()
      }
    }, [trackResults])
  )

  const isSearching = debouncedQuery.trim().length > 1
  const isLoading   = trackResults.isLoading && isSearching

  function handlePlay(track: Track) {
    playTrack(track, tracks.length ? tracks : [track], `Results for "${debouncedQuery}"`)
  }

  return (
    <div className="nav-safe-padding">
      {/* Header */}
      <div className="glass-top sticky top-0 z-40 px-5 py-3.5">
        <h1 className="text-headline-sm font-bold text-on-surface mb-3">Search</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            ref={inputRef}
            type="search" value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-10 pr-10"
            placeholder="Lagu, artist, album Indonesia..."
            autoCapitalize="none"
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              aria-label="Clear">
              <X size={16} />
            </button>
          )}
        </div>

        {isSearching && (
          <div className="flex gap-2 mt-3">
            {(['tracks', 'albums'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={tab === activeTab ? 'chip-active' : 'chip-default capitalize'}>
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-2 mt-2">
        <AnimatePresence mode="wait">
          {/* Browse Genres */}
          {!isSearching && (
            <motion.section key="genres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 mt-2">
              <h2 className="section-title mb-4">Browse Genre</h2>
              <div className="grid grid-cols-2 gap-3">
                {MUSIC_GENRES.map((genre, i) => (
                  <motion.button key={genre.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setQuery(genre.id)}
                    className={`relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br ${genre.gradient} active:scale-95 transition-transform`}>
                    <span className="absolute bottom-3 left-3 text-body-sm font-bold text-white">{genre.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Search Results */}
          {isSearching && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Tracks tab */}
              {activeTab === 'tracks' && (
                <div>
                  {isLoading ? (
                    [...Array(8)].map((_, i) => <TrackRowSkeleton key={i} />)
                  ) : tracks.length > 0 ? (
                    <>
                      <p className="px-4 py-2 text-label-md text-on-surface-variant">
                        {trackResults.data?.pages[0]?.total ?? tracks.length} tracks
                      </p>
                      {tracks.map((track) => (
                        <TrackRow key={track.id} track={track}
                          isActive={currentTrack?.id === track.id}
                          isPlaying={isPlaying && currentTrack?.id === track.id}
                          onPlay={handlePlay} onMore={() => {}} />
                      ))}
                      <div ref={loadMoreRef} className="py-4 flex justify-center">
                        {trackResults.isFetchingNextPage && (
                          <Loader size={20} className="text-primary animate-spin" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                      <Search size={40} strokeWidth={1.5} className="opacity-40" />
                      <p className="text-body-sm">Tidak ada hasil untuk "{debouncedQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Albums tab */}
              {activeTab === 'albums' && (
                <div className="px-5 mt-2">
                  {albumResults.isLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => <AlbumCardSkeleton key={i} />)}
                    </div>
                  ) : (albumResults.data ?? []).length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {(albumResults.data ?? []).map((album) => (
                        <AlbumCard key={album.id} item={album} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                      <Search size={40} strokeWidth={1.5} className="opacity-40" />
                      <p className="text-body-sm">Tidak ada album untuk "{debouncedQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
