"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface FadeUpProps {
  children: ReactNode
  /** Optional delay before the animation starts, in seconds. Default 0. */
  delay?: number
  /** Optional duration override, in seconds. Default 0.7 (matches Sentinel keyframe). */
  duration?: number
  /** Optional class to apply to the wrapper. */
  className?: string
  /** If true, animate immediately on mount instead of waiting for intersection. Default false. */
  immediate?: boolean
}

/**
 * Fades its children up from 24px below their final position when they
 * enter the viewport. Uses the `fadeUp` keyframe defined in globals.css.
 * Runs once per mount — does not re-animate on subsequent intersections.
 *
 * Respects `prefers-reduced-motion: reduce` via the global media query
 * in `globals.css` which disables all animations.
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  className,
  immediate = false,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(immediate)

  useEffect(() => {
    if (immediate || hasAnimated) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasAnimated(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate, hasAnimated])

  return (
    <div
      ref={ref}
      className={className}
      style={
        hasAnimated
          ? {
              animation: `fadeUp ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
              opacity: 0,
            }
          : { opacity: 0, transform: "translateY(24px)" }
      }
    >
      {children}
    </div>
  )
}
