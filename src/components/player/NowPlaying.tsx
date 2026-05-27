import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
         Volume2, VolumeX, Heart, ChevronDown, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { TrackThumbnail } from '@/components/ui/TrackThumbnail'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatTime } from '@/utils/utils'

export function NowPlaying() {
  const currentTrack   = usePlayerStore((s) => s.currentTrack)
  const isNowPlayingOpen = usePlayerStore((s) => s.isNowPlayingOpen)
  const isPlaying      = usePlayerStore((s) => s.isPlaying)
  const progress       = usePlayerStore((s) => s.progress)
  const currentTime    = usePlayerStore((s) => s.currentTime)
  const duration       = usePlayerStore((s) => s.duration)
  const isShuffle      = usePlayerStore((s) => s.isShuffle)
  const repeatMode     = usePlayerStore((s) => s.repeatMode)
  const volume         = usePlayerStore((s) => s.volume)
  const isMuted        = usePlayerStore((s) => s.isMuted)
  const queueName      = usePlayerStore((s) => s.queueName)
  const isBuffering    = usePlayerStore((s) => s.isBuffering)
  const {
    togglePlay, nextTrack, prevTrack, seekTo,
    toggleShuffle, cycleRepeat, setVolume, toggleMute,
    toggleLike, closeNowPlaying,
  } = usePlayerStore()

  return (
    <AnimatePresence>
      {isNowPlayingOpen && currentTrack && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-surface"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.velocity.y > 500 || info.offset.y > 180) closeNowPlaying()
          }}>

          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-container-high/60 via-surface to-surface pointer-events-none" />

          {/* Drag handle */}
          <div className="relative flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <div className="relative flex flex-col h-full px-6 overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between py-3">
              <button onClick={closeNowPlaying} className="btn-ghost p-2" aria-label="Close">
                <ChevronDown size={24} strokeWidth={2} />
              </button>
              <div className="text-center">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
                  Now Playing
                </p>
                {queueName && (
                  <p className="text-label-sm text-on-surface-variant truncate mt-0.5 max-w-[180px]">
                    {queueName}
                  </p>
                )}
              </div>
              <button className="btn-ghost p-2" aria-label="Queue">
                <List size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* Album Art */}
            <div className="flex items-center justify-center py-6">
              <motion.div
                animate={isPlaying && !isBuffering ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full max-w-[290px] aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
                {currentTrack.coverUrl
                  ? <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                  : <TrackThumbnail src="" alt={currentTrack.title} size={64} className="w-full h-full rounded-none" />
                }
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-10 h-10 border-3 border-white/50 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Track Info + Like */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-headline-sm font-bold text-on-surface truncate">{currentTrack.title}</h2>
                <p className="text-body-md text-on-surface-variant truncate">{currentTrack.artist}</p>
              </div>
              <button onClick={() => toggleLike(currentTrack.id)}
                className={`btn-ghost p-2 flex-shrink-0 ${currentTrack.isLiked ? 'text-primary' : ''}`}
                aria-label={currentTrack.isLiked ? 'Unlike' : 'Like'}>
                <Heart size={22} fill={currentTrack.isLiked ? 'currentColor' : 'none'}
                  strokeWidth={currentTrack.isLiked ? 0 : 1.8} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <ProgressBar progress={progress} onSeek={seekTo} />
              <div className="flex justify-between mt-2">
                <span className="text-label-sm text-outline tabular-nums">{formatTime(currentTime)}</span>
                <span className="text-label-sm text-outline tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={toggleShuffle}
                className={`btn-ghost p-3 ${isShuffle ? 'text-primary' : ''}`} aria-label="Shuffle">
                <Shuffle size={20} strokeWidth={1.8} />
              </button>
              <button onClick={prevTrack} className="btn-ghost p-3" aria-label="Previous">
                <SkipBack size={28} strokeWidth={2} />
              </button>
              <button onClick={togglePlay} disabled={isBuffering}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center
                           shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-70"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isBuffering
                  ? <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  : isPlaying
                    ? <Pause size={28} fill="white" strokeWidth={0} />
                    : <Play  size={28} fill="white" className="ml-1" strokeWidth={0} />
                }
              </button>
              <button onClick={nextTrack} className="btn-ghost p-3" aria-label="Next">
                <SkipForward size={28} strokeWidth={2} />
              </button>
              <button onClick={cycleRepeat}
                className={`btn-ghost p-3 ${repeatMode !== 'off' ? 'text-primary' : ''}`} aria-label="Repeat">
                {repeatMode === 'one'
                  ? <Repeat1 size={20} strokeWidth={1.8} />
                  : <Repeat  size={20} strokeWidth={1.8} />}
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 pb-10">
              <button onClick={toggleMute} className="btn-ghost p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0
                  ? <VolumeX size={18} strokeWidth={1.8} />
                  : <Volume2 size={18} strokeWidth={1.8} />}
              </button>
              <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-primary" aria-label="Volume" />
              <Volume2 size={18} strokeWidth={1.8} className="text-on-surface-variant" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}