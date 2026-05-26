import { useState, useCallback } from 'react'
import { Plus, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlbumCard } from '@/components/cards/AlbumCard'
import { TrackRow } from '@/components/cards/TrackRow'
import { AlbumCardSkeleton, TrackRowSkeleton } from '@/components/loading/Skeleton'
import { usePlayerStore } from '@/store/playerStore'
import { useInfiniteGenreTracks, flattenInfiniteQuery } from '@/hooks/useYTMusic'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PLAYLISTS } from '@/utils/data'
import type { Track } from '@/types'

const TABS = ['Playlists', 'Tracks', 'New Releases'] as const
type Tab = typeof TABS[number]

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Playlists')
  const navigate     = useNavigate()
  const playTrack    = usePlayerStore((s) => s.playTrack)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying    = usePlayerStore((s) => s.isPlaying)

  // Only fetch when tab is active — enabled guard prevents wasted requests
  const infiniteTracks = useInfiniteGenreTracks('lagu indonesia populer', activeTab === 'Tracks')
  const infiniteNew    = useInfiniteGenreTracks('lagu indonesia terbaru 2024', activeTab === 'New Releases')

  const allTracks = flattenInfiniteQuery(infiniteTracks)
  const allNew    = flattenInfiniteQuery(infiniteNew)

  const activeQuery  = activeTab === 'Tracks' ? infiniteTracks : infiniteNew
  const activeTracks = activeTab === 'Tracks' ? allTracks : allNew

  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
        activeQuery.fetchNextPage()
      }
    }, [activeQuery])
  )

  function handlePlay(track: Track, tracks: Track[]) {
    playTrack(track, tracks, activeTab)
  }

  return (
    <div className="nav-safe-padding">
      <header className="glass-top sticky top-0 z-40 px-5 py-3.5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-headline-sm font-bold text-on-surface">Your Library</h1>
          <button className="btn-ghost p-2" aria-label="Create playlist">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'chip-active' : 'chip-default'}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-4">
        {/* Playlists tab */}
        {activeTab === 'Playlists' && (
          <div className="px-5 grid grid-cols-2 gap-3">
            {PLAYLISTS.map((pl, i) => (
              <motion.div key={pl.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <AlbumCard item={pl}
                  onPlay={() => allTracks.length && handlePlay(allTracks[0], allTracks)}
                  onClick={() => navigate(`/playlist/${pl.id}`)} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Tracks & New Releases — YouTube Music real data */}
        {(activeTab === 'Tracks' || activeTab === 'New Releases') && (
          <div className="px-2">
            {activeQuery.isLoading
              ? [...Array(10)].map((_, i) => <TrackRowSkeleton key={i} />)
              : activeTracks.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                    <p className="text-body-sm text-outline">
                      {activeQuery.isError ? 'Gagal memuat. Coba lagi nanti.' : 'Tidak ada lagu ditemukan.'}
                    </p>
                  </div>
                )
                : activeTracks.map((track) => (
                    <TrackRow key={track.id} track={track}
                      isActive={currentTrack?.id === track.id}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlay={(t) => handlePlay(t, activeTracks)}
                      onMore={() => {}} />
                  ))
            }

            {/* Load-more sentinel */}
            {(activeTab === 'Tracks' || activeTab === 'New Releases') && (
              <div ref={loadMoreRef} className="py-6 flex justify-center">
                {activeQuery.isFetchingNextPage && (
                  <Loader size={20} className="text-primary animate-spin" />
                )}
                {!activeQuery.hasNextPage && activeTracks.length > 0 && (
                  <p className="text-label-sm text-outline">Semua track sudah dimuat</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
