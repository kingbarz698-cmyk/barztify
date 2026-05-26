import { useRef, type PointerEvent } from 'react'

interface Props {
  progress: number
  onSeek: (progress: number) => void
  className?: string
}

export function ProgressBar({ progress, onSeek, className = '' }: Props) {
  const dragging = useRef(false)

  function calcPercent(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onSeek(calcPercent(e))
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    onSeek(calcPercent(e))
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
    onSeek(calcPercent(e))
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-1 bg-surface-container-high rounded-full cursor-pointer group touch-none ${className}`}
    >
      <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none" style={{ width: `${progress}%` }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}
