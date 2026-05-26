import { Play, Pause, SkipBack, SkipForward, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { TrackThumbnail } from '@/components/ui/TrackThumbnail'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function MiniPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying    = usePlayerStore((s) => s.isPlaying)
  const progress     = usePlayerStore((s) => s.progress)
  const isBuffering  = usePlayerStore((s) => s.isBuffering)
  const { togglePlay, nextTrack, prevTrack, seekTo, openNowPlaying } = usePlayerStore()

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          className="md:hidden fixed player-safe-bottom left-1/2 z-40
                     w-[calc(100%-32px)] max-w-[420px] glass-panel rounded-2xl
                     shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
          style={{ x: '-50%' }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>

          {/* Progress bar */}
          <div className="px-3 pt-2.5">
            <ProgressBar progress={progress} onSeek={seekTo} />
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            onClick={openNowPlaying}>
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <TrackThumbnail src={currentTrack.coverUrl} size="md" rounded="md" />
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface truncate">{currentTrack.title}</p>
              <p className="text-label-md text-on-surface-variant truncate">{currentTrack.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={prevTrack} className="btn-ghost p-2 touch-target" aria-label="Previous">
                <SkipBack size={18} strokeWidth={2} />
              </button>
              <button
                onClick={togglePlay}
                disabled={isBuffering}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white
                           active:scale-90 transition-transform disabled:opacity-70"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isBuffering
                  ? <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  : isPlaying
                    ? <Pause size={16} fill="currentColor" strokeWidth={0} />
                    : <Play  size={16} fill="currentColor" className="ml-0.5" strokeWidth={0} />
                }
              </button>
              <button onClick={nextTrack} className="btn-ghost p-2 touch-target" aria-label="Next">
                <SkipForward size={18} strokeWidth={2} />
              </button>
            </div>

            <button onClick={(e) => { e.stopPropagation(); openNowPlaying() }}
              className="btn-ghost p-1.5" aria-label="Expand">
              <ChevronUp size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
