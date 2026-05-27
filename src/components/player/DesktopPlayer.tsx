import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Heart } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { TrackThumbnail } from '@/components/ui/TrackThumbnail'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatTime } from '@/utils/utils'

export function DesktopPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying    = usePlayerStore((s) => s.isPlaying)
  const progress     = usePlayerStore((s) => s.progress)
  const currentTime  = usePlayerStore((s) => s.currentTime)
  const duration     = usePlayerStore((s) => s.duration)
  const isShuffle    = usePlayerStore((s) => s.isShuffle)
  const repeatMode   = usePlayerStore((s) => s.repeatMode)
  const volume       = usePlayerStore((s) => s.volume)
  const isMuted      = usePlayerStore((s) => s.isMuted)
  const isBuffering  = usePlayerStore((s) => s.isBuffering)
  const { togglePlay, nextTrack, prevTrack, seekTo, toggleShuffle, cycleRepeat, setVolume, toggleMute, toggleLike } = usePlayerStore()

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-60 right-0 z-40 glass-panel border-t border-white/5 px-4 py-3">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">

        {/* Track info */}
        <div className="flex items-center gap-3 w-64 flex-shrink-0">
          <div className="relative">
            <TrackThumbnail src={currentTrack.coverUrl} alt={currentTrack.title} size={40} />
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-on-surface truncate">{currentTrack.title}</p>
            <p className="text-label-md text-on-surface-variant truncate">{currentTrack.artist}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack.id)}
            className={`btn-ghost p-1.5 ${currentTrack.isLiked ? 'text-primary' : ''}`}
            aria-label="Like">
            <Heart size={16} fill={currentTrack.isLiked ? 'currentColor' : 'none'}
              strokeWidth={currentTrack.isLiked ? 0 : 1.8} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <button onClick={toggleShuffle}
              className={`btn-ghost p-2 ${isShuffle ? 'text-primary' : ''}`} aria-label="Shuffle">
              <Shuffle size={16} strokeWidth={1.8} />
            </button>
            <button onClick={prevTrack} className="btn-ghost p-2" aria-label="Previous">
              <SkipBack size={20} strokeWidth={2} />
            </button>
            <button onClick={togglePlay} disabled={isBuffering}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white
                         hover:scale-105 active:scale-95 transition-transform disabled:opacity-70"
              aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isBuffering
                ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                : isPlaying
                  ? <Pause size={18} fill="currentColor" strokeWidth={0} />
                  : <Play  size={18} fill="currentColor" className="ml-0.5" strokeWidth={0} />
              }
            </button>
            <button onClick={nextTrack} className="btn-ghost p-2" aria-label="Next">
              <SkipForward size={20} strokeWidth={2} />
            </button>
            <button onClick={cycleRepeat}
              className={`btn-ghost p-2 ${repeatMode !== 'off' ? 'text-primary' : ''}`} aria-label="Repeat">
              {repeatMode === 'one'
                ? <Repeat1 size={16} strokeWidth={1.8} />
                : <Repeat  size={16} strokeWidth={1.8} />}
            </button>
          </div>

          {/* Progress */}
          <div className="w-full flex items-center gap-2">
            <span className="text-label-sm text-outline w-8 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <ProgressBar progress={progress} onSeek={seekTo} className="flex-1" />
            <span className="text-label-sm text-outline w-8 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-40 flex-shrink-0 justify-end">
          <button onClick={toggleMute} className="btn-ghost p-2" aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0
              ? <VolumeX size={16} strokeWidth={1.8} />
              : <Volume2 size={16} strokeWidth={1.8} />}
          </button>
          <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-primary h-1" aria-label="Volume" />
        </div>
      </div>
    </div>
  )
}