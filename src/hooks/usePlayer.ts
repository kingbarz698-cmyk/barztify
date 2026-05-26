/**
 * usePlayer — Real HTML5 Audio Engine + yt-dlp stream resolver
 *
 * Alur:
 *   playTrack(track) dipanggil dengan track.audioUrl = undefined
 *   → hook detect currentTrack berubah (videoId tersedia)
 *   → fetch /stream/:videoId dari FastAPI backend (yt-dlp)
 *   → set audioUrl ke store
 *   → audio.src = url → play()
 *
 * Singleton audio element — satu instance, tidak pernah remount.
 *
 * FIXES:
 *   - Removed crossOrigin='anonymous' (breaks YT signed URLs via CORS)
 *   - Fixed _resolvedIds logic (inverted !== false bug)
 *   - Fixed race condition: isPlaying subscribe won't play before src is ready
 *   - Fixed seek loop: isSeeking guard prevents progress → audio → timeupdate → progress loop
 *   - Proper cleanup & re-init on remount
 */

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { resolveStreamUrl, invalidateStreamUrl } from '@/services/ytMusicService'

// ─── Singleton audio ──────────────────────────────────────────────────────────
let _audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!_audio) {
    _audio = new Audio()
    _audio.preload = 'metadata'
    // NOTE: crossOrigin MUST be omitted — YouTube signed CDN URLs reject CORS preflight
  }
  return _audio
}

let _mounted = false

// Track which videoIds have been successfully resolved (avoid duplicate fetches)
const _resolvedUrls = new Map<string, string>() // videoId -> url

// Guard to prevent seek loop: progress subscriber → audio.currentTime → timeupdate → progress
let _isSeeking = false

export function usePlayer() {
  const store = usePlayerStore
  const prevVideoId = useRef<string | null>(null)

  useEffect(() => {
    if (_mounted) return
    _mounted = true

    const audio = getAudio()

    // ── Audio event handlers ──────────────────────────────────────────────────

    function onTimeUpdate() {
      if (_isSeeking) return
      if (!audio.duration || isNaN(audio.duration)) return
      const t = audio.currentTime
      const progress = Math.min((t / audio.duration) * 100, 100)
      store.setState({ currentTime: t, progress })
    }

    function onDurationChange() {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        store.setState({ duration: audio.duration })
      }
    }

    function onEnded() {
      const { repeatMode, nextTrack, setProgress } = store.getState()
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        setProgress(0)
        nextTrack()
      }
    }

    function onPlay()    { store.setState({ isPlaying: true, isBuffering: false }) }
    function onPause()   { store.setState({ isPlaying: false }) }
    function onWaiting() { store.setState({ isBuffering: true }) }

    function onCanPlay() {
      store.setState({ isBuffering: false })
      // Only auto-play if the store wants to be playing
      if (store.getState().isPlaying) {
        audio.play().catch(() => store.setState({ isPlaying: false }))
      }
    }

    function onError() {
      const err = audio.error
      console.error('[Player] Audio error:', err?.code, err?.message)
      // Invalidate cached stream URL so next play attempt re-fetches
      const currentId = store.getState().currentTrack?.id
      if (currentId) {
        invalidateStreamUrl(currentId)
        prevVideoId.current = null // allow re-resolve on retry
      }
      store.setState({ isPlaying: false, isBuffering: false })
    }

    audio.addEventListener('timeupdate',     onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended',          onEnded)
    audio.addEventListener('play',           onPlay)
    audio.addEventListener('pause',          onPause)
    audio.addEventListener('waiting',        onWaiting)
    audio.addEventListener('canplay',        onCanPlay)
    audio.addEventListener('error',          onError)

    // ── Subscribe: currentTrack change → resolve stream URL ──────────────────

    const unsubTrack = store.subscribe(
      (s) => s.currentTrack,
      async (track) => {
        if (!track) return
        const videoId = track.id

        // Same track already loaded — just toggle play/pause
        if (videoId === prevVideoId.current && audio.src) return
        prevVideoId.current = videoId

        // Check if we've already resolved this videoId in this session
        const cachedUrl = _resolvedUrls.get(videoId)
        if (cachedUrl) {
          _loadAndPlay(audio, cachedUrl, store)
          return
        }

        // If audioUrl already embedded (e.g. from playlist pre-fetch) use it
        if (track.audioUrl) {
          _resolvedUrls.set(videoId, track.audioUrl)
          _loadAndPlay(audio, track.audioUrl, store)
          return
        }

        // Fetch from backend (yt-dlp)
        store.setState({ isBuffering: true })
        try {
          const url = await resolveStreamUrl(videoId)
          _resolvedUrls.set(videoId, url)

          // Ensure track is still current before applying
          const current = store.getState().currentTrack
          if (current?.id === videoId) {
            store.setState({
              currentTrack: { ...current, audioUrl: url },
            })
            const queue = store.getState().queue.map((t) =>
              t.id === videoId ? { ...t, audioUrl: url } : t
            )
            store.setState({ queue })
            _loadAndPlay(audio, url, store)
          }
        } catch (err) {
          console.error('[Player] Stream resolve failed:', err)
          store.setState({ isPlaying: false, isBuffering: false })
          prevVideoId.current = null // allow retry
        }
      }
    )

    // ── Subscribe: isPlaying toggle (manual play/pause only) ─────────────────

    const unsubPlaying = store.subscribe(
      (s) => s.isPlaying,
      (isPlaying) => {
        // Only act if audio has a valid source loaded
        if (!audio.src || audio.src === window.location.href) return
        if (isPlaying) {
          if (audio.paused) {
            audio.play().catch(() => store.setState({ isPlaying: false }))
          }
        } else {
          if (!audio.paused) audio.pause()
        }
      }
    )

    // ── Subscribe: seek (progress set externally by seekTo) ──────────────────

    const unsubSeek = store.subscribe(
      (s) => s.seekTarget,
      (seekTarget) => {
        if (seekTarget == null) return
        if (!audio.duration || isNaN(audio.duration)) return
        const targetTime = (seekTarget / 100) * audio.duration
        _isSeeking = true
        audio.currentTime = targetTime
        // Clear seekTarget and isSeeking after a tick
        setTimeout(() => {
          _isSeeking = false
          store.setState({ seekTarget: null })
        }, 50)
      }
    )

    // ── Subscribe: volume ─────────────────────────────────────────────────────

    const unsubVolume = store.subscribe(
      (s) => ({ volume: s.volume, isMuted: s.isMuted }),
      ({ volume, isMuted }) => {
        audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100))
        audio.muted  = isMuted
      },
      { equalityFn: (a, b) => a.volume === b.volume && a.isMuted === b.isMuted }
    )

    return () => {
      _mounted = false
      audio.removeEventListener('timeupdate',     onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended',          onEnded)
      audio.removeEventListener('play',           onPlay)
      audio.removeEventListener('pause',          onPause)
      audio.removeEventListener('waiting',        onWaiting)
      audio.removeEventListener('canplay',        onCanPlay)
      audio.removeEventListener('error',          onError)
      unsubTrack()
      unsubPlaying()
      unsubSeek()
      unsubVolume()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Load a URL into audio element and begin playback */
function _loadAndPlay(
  audio: HTMLAudioElement,
  url: string,
  store: typeof usePlayerStore
) {
  audio.pause()
  audio.src = url
  audio.currentTime = 0
  store.setState({ progress: 0, currentTime: 0, isBuffering: true })
  audio.load()
  // onCanPlay will call audio.play() if isPlaying===true
}
