import { useEffect, useRef, type RefObject } from 'react'

export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): RefObject<HTMLDivElement> {
  const ref         = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(callback)
  const optionsRef  = useRef(options)

  // Keep callback ref current without re-running effect
  useEffect(() => { callbackRef.current = callback }, [callback])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callbackRef.current() },
      optionsRef.current
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, []) // only mount/unmount — ref and options are stable

  return ref as RefObject<HTMLDivElement>
}