/**
 * TrackThumbnail — gambar album/track dengan fallback bertingkat
 *
 * YouTube maxresdefault tidak selalu ada → fallback ke hqdefault → mqdefault → placeholder
 */
import { useState, useCallback } from 'react'
import { Music } from 'lucide-react'

interface Props {
  src: string
  alt: string
  className?: string
  size?: number
}

function getFallbacks(src: string): string[] {
  const urls: string[] = [src]

  // Jika maxresdefault, tambah fallback bertingkat
  if (src.includes('maxresdefault')) {
    urls.push(src.replace('maxresdefault', 'hqdefault'))
    urls.push(src.replace('maxresdefault', 'mqdefault'))
    urls.push(src.replace('maxresdefault', 'default'))
  }

  // Jika webp, tambah jpg fallback
  if (src.includes('.webp')) {
    urls.push(src.replace('.webp', '.jpg'))
  }

  return [...new Set(urls)] // deduplicate
}

export function TrackThumbnail({ src, alt, className = '', size }: Props) {
  const fallbacks = getFallbacks(src)
  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  const handleError = useCallback(() => {
    if (idx < fallbacks.length - 1) {
      setIdx((i) => i + 1)
    } else {
      setFailed(true)
    }
  }, [idx, fallbacks.length])

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-high ${className}`}
        style={size ? { width: size, height: size } : undefined}>
        <Music size={size ? size * 0.4 : 20} className="text-outline" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={fallbacks[idx]}
      alt={alt}
      className={className}
      style={size ? { width: size, height: size } : undefined}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  )
}
