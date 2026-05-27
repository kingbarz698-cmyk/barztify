import { Play, Pause, MoreHorizontal, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrackThumbnail } from '@/components/ui/TrackThumbnail'
import { formatTime } from '@/utils/utils'
import type { Track } from '@/types'

interface Props {
  track: Track
  index?: number
  isActive?: boolean
  isPlaying?: boolean
  onPlay: (track: Track) => void
  onMore?: (track: Track) => void
  onLike?: (track: Track) => void
  showIndex?: boolean
}

export function TrackRow({ track, index, isActive, isPlaying, onPlay, onMore, onLike, showIndex }: Props) {
  return (
    <motion.div
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-colors duration-150
        ${isActive ? 'bg-primary/10' : 'hover:bg-white/5 active:bg-white/5'}`}
      onClick={() => onPlay(track)}
      whileTap={{ scale: 0.985 }}
    >
      {/* Index / Play state */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {isActive && isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            {[1,2,3].map((b) => (
              <div key={b} className="equalizer-bar" style={{ height: `${[60,100,75][b-1]}%`, animationDelay: `${(b-1)*0.15}s` }} />
            ))}
          </div>
        ) : showIndex ? (
          <span className={`text-label-md ${isActive ? 'text-primary' : 'text-outline'}`}>{index}</span>
        ) : (
          <div className="relative">
            <TrackThumbnail src={track.coverUrl} alt={track.title} size={32} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded transition-opacity">
              {isPlaying ? <Pause size={12} fill="white" strokeWidth={0} /> : <Play size={12} fill="white" className="ml-0.5" strokeWidth={0} />}
            </div>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`text-body-sm font-semibold truncate leading-tight ${isActive ? 'text-primary' : 'text-on-surface'}`}>
          {track.title}
          {track.isExplicit && <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-outline/30 text-outline font-bold align-middle">E</span>}
        </p>
        <p className="text-label-md text-on-surface-variant truncate">{track.artist}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {onLike && (
          <button
            onClick={() => onLike(track)}
            className={`btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${track.isLiked ? 'text-primary opacity-100' : ''}`}
            aria-label={track.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={15} fill={track.isLiked ? 'currentColor' : 'none'} strokeWidth={track.isLiked ? 0 : 1.8} />
          </button>
        )}
        <span className="text-label-sm text-outline w-8 text-right">{formatTime(track.duration)}</span>
        {onMore && (
          <button
            onClick={() => onMore(track)}
            className="btn-ghost p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}