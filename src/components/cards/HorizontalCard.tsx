import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Playlist } from '@/types'

interface Props {
  item: Playlist
  onPlay?: () => void
  onClick?: () => void
}

export function HorizontalCard({ item, onPlay, onClick }: Props) {
  return (
    <motion.div className="group flex-shrink-0 w-36 cursor-pointer" whileTap={{ scale: 0.95 }} onClick={onClick}>
      <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-surface-container-high mb-2 shadow-md">
        {item.coverUrl && <img src={item.coverUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
        {onPlay && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlay() }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center
                       opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200"
            aria-label="Play"
          >
            <Play size={13} fill="white" strokeWidth={0} className="ml-0.5" />
          </button>
        )}
      </div>
      <p className="text-body-sm font-semibold text-on-surface truncate">{item.name}</p>
      <p className="text-label-sm text-on-surface-variant truncate">{item.trackCount} tracks</p>
    </motion.div>
  )
}
