import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Track, RepeatMode } from '@/types'
import { shuffleArray, clamp } from '@/utils/utils'

interface PlayerStore {
  currentTrack: Track | null
  queue: Track[]
  originalQueue: Track[]
  currentIndex: number
  isPlaying: boolean
  progress: number
  /** Seek target (0-100). Set by seekTo, consumed by usePlayer, cleared after seek. */
  seekTarget: number | null
  volume: number
  isMuted: boolean
  isShuffle: boolean
  repeatMode: RepeatMode
  currentTime: number
  duration: number
  isNowPlayingOpen: boolean
  queueName: string | null
  isBuffering: boolean
  playTrack: (track: Track, queue?: Track[], queueName?: string) => void
  togglePlay: () => void
  pause: () => void
  play: () => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (progress: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  toggleLike: (trackId: string) => void
  setProgress: (progress: number) => void
  setCurrentTime: (time: number) => void
  openNowPlaying: () => void
  closeNowPlaying: () => void
  setQueue: (tracks: Track[], name?: string) => void
  setState: (partial: Partial<PlayerStore>) => void
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    currentTrack:    null,
    queue:           [],
    originalQueue:   [],
    currentIndex:    0,
    isPlaying:       false,
    progress:        0,
    seekTarget:      null,
    volume:          80,
    isMuted:         false,
    isShuffle:       false,
    repeatMode:      'off',
    currentTime:     0,
    duration:        0,
    isNowPlayingOpen: false,
    queueName:       null,
    isBuffering:     false,

    setState: (partial) => set(partial),

    playTrack: (track, queue, queueName) => {
      const q   = queue ?? get().queue
      const idx = q.findIndex((t) => t.id === track.id)
      set({
        currentTrack: { ...track, audioUrl: undefined }, // clear stale audioUrl
        queue:        q,
        originalQueue: q,
        currentIndex: idx >= 0 ? idx : 0,
        isPlaying:    true,
        progress:     0,
        seekTarget:   null,
        currentTime:  0,
        duration:     track.duration || 0,
        queueName:    queueName ?? null,
        isBuffering:  true,
      })
    },

    togglePlay: () => {
      const { currentTrack, isPlaying } = get()
      if (currentTrack) set({ isPlaying: !isPlaying })
    },
    pause: () => set({ isPlaying: false }),
    play:  () => set({ isPlaying: true }),

    nextTrack: () => {
      const { queue, currentIndex, isShuffle, repeatMode } = get()
      if (!queue.length) return
      let nextIdx: number
      if (isShuffle) {
        const pool = queue.map((_, i) => i).filter((i) => i !== currentIndex)
        nextIdx = pool.length ? pool[Math.floor(Math.random() * pool.length)] : 0
      } else if (repeatMode === 'one') {
        nextIdx = currentIndex
      } else {
        nextIdx = (currentIndex + 1) % queue.length
      }
      const next = queue[nextIdx]
      if (!next) return
      set({
        currentTrack: { ...next, audioUrl: undefined },
        currentIndex: nextIdx,
        progress:     0,
        seekTarget:   null,
        currentTime:  0,
        duration:     next.duration || 0,
        isPlaying:    true,
        isBuffering:  true,
      })
    },

    prevTrack: () => {
      const { queue, currentIndex, currentTime } = get()
      if (!queue.length) return
      // If >3s into track → restart instead of going back
      if (currentTime > 3) {
        set({ seekTarget: 0, progress: 0, currentTime: 0 })
        return
      }
      const prevIdx = (currentIndex - 1 + queue.length) % queue.length
      const prev    = queue[prevIdx]
      if (!prev) return
      set({
        currentTrack: { ...prev, audioUrl: undefined },
        currentIndex: prevIdx,
        progress:     0,
        seekTarget:   null,
        currentTime:  0,
        duration:     prev.duration || 0,
        isPlaying:    true,
        isBuffering:  true,
      })
    },

    /**
     * seekTo: sets seekTarget (consumed by usePlayer audio engine)
     * and updates UI progress immediately for responsiveness.
     * Does NOT set progress directly to avoid triggering the old seek subscriber.
     */
    seekTo: (progress) => {
      const { duration } = get()
      const clamped = clamp(progress, 0, 100)
      set({
        seekTarget:  clamped,
        progress:    clamped,
        currentTime: (clamped / 100) * (duration || 0),
      })
    },

    setVolume: (volume) => set({ volume: clamp(volume, 0, 100), isMuted: volume === 0 }),
    toggleMute: () => {
      const { isMuted, volume } = get()
      set({ isMuted: !isMuted, volume: !isMuted ? volume : (volume === 0 ? 80 : volume) })
    },

    toggleShuffle: () => {
      const { isShuffle, originalQueue, currentTrack } = get()
      if (!isShuffle) {
        const shuffled = shuffleArray(originalQueue)
        const idx = shuffled.findIndex((t) => t.id === currentTrack?.id)
        set({ isShuffle: true, queue: shuffled, currentIndex: idx >= 0 ? idx : 0 })
      } else {
        const idx = originalQueue.findIndex((t) => t.id === currentTrack?.id)
        set({ isShuffle: false, queue: originalQueue, currentIndex: idx >= 0 ? idx : 0 })
      }
    },

    cycleRepeat: () => {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const { repeatMode } = get()
      set({ repeatMode: modes[(modes.indexOf(repeatMode) + 1) % modes.length] })
    },

    toggleLike: (trackId) => {
      const { currentTrack, queue } = get()
      set({
        queue: queue.map((t) => t.id === trackId ? { ...t, isLiked: !t.isLiked } : t),
        currentTrack: currentTrack?.id === trackId
          ? { ...currentTrack, isLiked: !currentTrack.isLiked }
          : currentTrack,
      })
    },

    setProgress:    (progress) => set({ progress: clamp(progress, 0, 100) }),
    setCurrentTime: (time) => {
      const { duration } = get()
      set({
        currentTime: time,
        progress:    duration > 0 ? clamp((time / duration) * 100, 0, 100) : 0,
        isBuffering: false,
      })
    },
    openNowPlaying:  () => set({ isNowPlayingOpen: true }),
    closeNowPlaying: () => set({ isNowPlayingOpen: false }),
    setQueue:        (tracks, name) => set({ queue: tracks, originalQueue: tracks, queueName: name ?? null }),
  }))
)
