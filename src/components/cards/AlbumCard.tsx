import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrackThumbnail } from '@/components/ui/TrackThumbnail'
import type { Playlist, Album } from '@/types'

interface Props {
  item: Playlist | Album
  onPlay?: () => void
  onClick?: () => void
}

export function AlbumCard({ item, onPlay, onClick }: Props) {
  const coverUrl = 'coverUrl' in item ? item.coverUrl : undefined
  const displayName = 'title' in item ? (item as Album).title : (item as Playlist).name
  const subtitle = 'trackCount' in item
    ? `${(item as Playlist).trackCount} tracks`
    : `${'year' in item ? (item as Album).year : ''} • ${'artist' in item ? (item as Album).artist : ''}`

  return (
    <motion.div
      className="group cursor-pointer"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      <div className="relative aspect-square w-full mb-2.5 rounded-xl overflow-hidden bg-surface-container-high shadow-lg">
        {coverUrl && <img src={coverUrl} alt={displayName ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
        {!coverUrl && <TrackThumbnail src="" alt={displayName ?? ''} size={64} className="w-full h-full rounded-none" />}
        {onPlay && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlay() }}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center
                       shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-200"
            aria-label="Play"
          >
            <Play size={16} fill="white" strokeWidth={0} className="ml-0.5" />
          </button>
        )}
      </div>
      <p className="text-body-sm font-semibold text-on-surface truncate leading-tight">{displayName}</p>
      <p className="text-label-md text-on-surface-variant truncate mt-0.5">{subtitle}</p>
    </motion.div>
  )
}