"use client"

import { useEffect, useRef, useState } from "react"

interface StatCounterProps {
  /** The value to count up to. */
  target: number
  /** Optional suffix to render after the number (e.g., "%"). */
  suffix?: string
  /** Animation duration in seconds. Default 1.4. */
  duration?: number
  /** Optional class on the wrapper. */
  className?: string
}

const cubicEaseOut = (t: number): number => 1 - Math.pow(1 - t, 3)

/**
 * Counts up to `target` once when this element enters the viewport.
 * The DOM contains the final number from first render (SEO-friendly,
 * SSR-correct) — the visual count-up replaces it via React state once
 * client-side hydration completes and the element intersects.
 *
 * Respects prefers-reduced-motion by skipping animation and rendering
 * the final value immediately.
 */
export function StatCounter({
  target,
  suffix = "",
  duration = 1.4,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(target)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || hasAnimatedRef.current) return

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      hasAnimatedRef.current = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasAnimatedRef.current) continue
          hasAnimatedRef.current = true
          observer.disconnect()

          const startTime = performance.now()
          const startValue = 0
          const delta = target - startValue

          const tick = (now: number) => {
            const elapsed = (now - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            const eased = cubicEaseOut(progress)
            setDisplayValue(Math.round(startValue + delta * eased))
            if (progress < 1) requestAnimationFrame(tick)
          }

          setDisplayValue(0)
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={className} aria-label={`${target}${suffix}`}>
      {displayValue}
      {suffix}
    </span>
  )
}
