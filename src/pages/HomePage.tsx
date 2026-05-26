import { useState, useCallback } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlbumCard } from '@/components/cards/AlbumCard'
import { HorizontalCard } from '@/components/cards/HorizontalCard'
import { TrackRow } from '@/components/cards/TrackRow'
import { NotificationBell } from '@/components/notification/NotificationBell'
import { HorizontalCardSkeleton, TrackRowSkeleton, AlbumCardSkeleton } from '@/components/loading/Skeleton'
import { usePlayerStore } from '@/store/playerStore'
import { useAuthStore } from '@/store/authStore'
import { useFeaturedTracks, useNewReleases } from '@/hooks/useYTMusic'
import { PLAYLISTS, HOME_CHIPS } from '@/utils/data'
import { ROUTES } from '@/constants/routes'
import type { Track } from '@/types'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function HomePage() {
  const [activeChip, setActiveChip] = useState('All')
  const playTrack    = usePlayerStore((s) => s.playTrack)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying    = usePlayerStore((s) => s.isPlaying)
  const user         = useAuthStore((s) => s.user)
  const navigate     = useNavigate()
  const firstName    = user?.name?.split(' ')[0] ?? 'There'

  // Real data from YouTube Music via FastAPI backend
  const { data: featured = [], isLoading: featuredLoading, refetch: refetchFeatured } = useFeaturedTracks(10)
  const { data: newReleases = [], isLoading: newLoading } = useNewReleases(8)

  const handlePlay = useCallback((track: Track, queue: Track[], name: string) => {
    playTrack(track, queue, name)
  }, [playTrack])

  return (
    <div className="nav-safe-padding pb-6">
      {/* Top Bar */}
      <header className="glass-top sticky top-0 z-40 flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-white select-none">
            {firstName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">{getGreeting()},</p>
            <p className="text-body-md font-bold text-on-surface leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(ROUTES.SEARCH)} className="btn-ghost" aria-label="Search">
            <Search size={20} />
          </button>
          <NotificationBell />
        </div>
      </header>

      {/* Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3.5">
        {HOME_CHIPS.map((chip) => (
          <button key={chip} onClick={() => setActiveChip(chip)}
            className={activeChip === chip ? 'chip-active' : 'chip-default'}>
            {chip}
          </button>
        ))}
      </div>

      {/* Featured Playlists */}
      <section className="px-5 mt-1">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="section-title">Featured Playlists</h2>
          <button onClick={() => navigate(ROUTES.LIBRARY)} className="text-label-md text-primary font-semibold">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PLAYLISTS.slice(0, 4).map((pl, i) => (
            <motion.div key={pl.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <AlbumCard item={pl}
                onPlay={() => featured.length && handlePlay(featured[0], featured, pl.name)}
                onClick={() => navigate(`/playlist/${pl.id}`)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Tracks — YouTube Music trending Indonesia */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3.5 px-5">
          <h2 className="section-title">Top Tracks Indonesia</h2>
          <button
            onClick={() => refetchFeatured()}
            className="flex items-center gap-1.5 text-label-md text-primary font-semibold"
            aria-label="Refresh">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
        <div className="px-2">
          {featuredLoading
            ? [...Array(6)].map((_, i) => <TrackRowSkeleton key={i} />)
            : featured.map((track) => (
                <TrackRow key={track.id} track={track}
                  isActive={currentTrack?.id === track.id}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  onPlay={(t) => handlePlay(t, featured, 'Top Tracks Indonesia')}
                  onMore={() => {}} />
              ))
          }
        </div>
      </section>

      {/* New Releases */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3.5 px-5">
          <h2 className="section-title">New Releases</h2>
          <button onClick={() => navigate(ROUTES.SEARCH)} className="text-label-md text-primary font-semibold">See All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
          {newLoading
            ? [...Array(5)].map((_, i) => <HorizontalCardSkeleton key={i} />)
            : newReleases.map((track) => (
                <HorizontalCard
                  key={track.id}
                  item={{ id: track.id, name: track.title, coverUrl: track.coverUrl, trackCount: 1, owner: track.artist }}
                  onPlay={() => handlePlay(track, newReleases, 'New Releases')}
                  onClick={() => handlePlay(track, newReleases, 'New Releases')} />
              ))
          }
        </div>
      </section>
    </div>
  )
}
