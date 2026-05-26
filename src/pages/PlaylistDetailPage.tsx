import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, MoreHorizontal, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrackRow } from '@/components/cards/TrackRow'
import { TrackRowSkeleton } from '@/components/loading/Skeleton'
import { usePlayerStore } from '@/store/playerStore'
import { useInfiniteGenreTracks, flattenInfiniteQuery } from '@/hooks/useYTMusic'
import { PLAYLISTS } from '@/utils/data'

// Map playlist id → genre keyword (Indonesian music)
const PLAYLIST_GENRE_MAP: Record<string, string> = {
  '1': 'pop indonesia',
  '2': 'indie indonesia',
  '3': 'rock indonesia',
  '4': 'pop indonesia hits',
  '5': 'dangdut',
  '6': 'jazz indonesia',
  '7': 'hip hop indonesia',
  '8': 'rnb indonesia',
}

export function PlaylistDetailPage() {
  const { id }        = useParams<{ id: string }>()
  const navigate      = useNavigate()
  const playTrack     = usePlayerStore((s) => s.playTrack)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const currentTrack  = usePlayerStore((s) => s.currentTrack)
  const isPlaying     = usePlayerStore((s) => s.isPlaying)

  const playlist = PLAYLISTS.find((p) => p.id === id)
  const genre    = (id ? PLAYLIST_GENRE_MAP[id] : null) ?? 'pop indonesia'

  // Hook must be called unconditionally — navigate happens in render, not early return
  const result = useInfiniteGenreTracks(genre)
  const tracks = flattenInfiniteQuery(result)

  // Navigate after hooks (avoid conditional hook call)
  if (!playlist) {
    navigate('/404', { replace: true })
    return null
  }

  function handlePlayAll() {
    if (!tracks.length) return
    playTrack(tracks[0], tracks, playlist!.name)
  }

  function handleShuffle() {
    if (!tracks.length) return
    playTrack(tracks[0], tracks, playlist!.name)
    toggleShuffle()
  }

  return (
    <div className="nav-safe-padding">
      {/* Hero */}
      <div className="relative pt-14 pb-6 px-5">
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 btn-ghost p-2 z-10" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl mb-5">
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
          <h1 className="text-headline-sm font-bold text-on-surface">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-body-sm text-on-surface-variant mt-1">{playlist.description}</p>
          )}
          <p className="text-label-md text-outline mt-1 capitalize">
            {genre} · {result.isLoading ? '...' : tracks.length} tracks
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-5 mb-4">
        <button
          disabled={!tracks.length || result.isLoading}
          onClick={handlePlayAll}
          className="flex-1 btn-primary disabled:opacity-50">
          <Play size={16} fill="currentColor" strokeWidth={0} />
          Play All
        </button>
        <button
          disabled={!tracks.length || result.isLoading}
          onClick={handleShuffle}
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10
                     text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all disabled:opacity-50"
          aria-label="Shuffle">
          <Shuffle size={18} strokeWidth={1.8} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10
                           text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
          aria-label="More options">
          <MoreHorizontal size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Tracks */}
      <div className="px-2">
        {result.isLoading
          ? [...Array(8)].map((_, i) => <TrackRowSkeleton key={i} />)
          : tracks.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                <p className="text-body-sm">Tidak ada lagu ditemukan untuk genre ini.</p>
              </div>
            )
            : tracks.map((track, i) => (
                <motion.div key={track.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 14) * 0.035 }}>
                  <TrackRow track={track} index={i + 1} showIndex
                    isActive={currentTrack?.id === track.id}
                    isPlaying={isPlaying && currentTrack?.id === track.id}
                    onPlay={(t) => playTrack(t, tracks, playlist!.name)}
                    onMore={() => {}} />
                </motion.div>
              ))
        }
        {result.isFetchingNextPage && (
          <div className="py-4 flex justify-center">
            <Loader size={18} className="text-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
