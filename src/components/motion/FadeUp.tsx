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
  /** If true, fire the animation immediately on mount regardless of viewport. Default false. */
  immediate?: boolean
}

/**
 * Fades its children up from 24px below their final position. Renders
 * content visible-at-final-position during SSR / no-JS / pre-hydration
 * so the content is never invisible to crawlers or Lighthouse audits.
 *
 * After hydration, if the element is already in the viewport on mount,
 * the animation fires immediately. If it starts below the viewport, the
 * wrapper hides the content and an IntersectionObserver reveals it when
 * the user scrolls to it.
 *
 * Respects `prefers-reduced-motion: reduce` via the global media query
 * in `globals.css`.
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  className,
  immediate = false,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Tri-state:
  //   "ssr"      — initial; rendered visible at final position with no animation
  //   "hidden"   — JS confirmed element is below viewport; hide and wait for observer
  //   "animated" — animation playing (or completed, since it's forwards)
  const [phase, setPhase] = useState<"ssr" | "hidden" | "animated">("ssr")

  // The setPhase calls inside this effect intentionally drive the SSR→hydrated
  // transition; the cascading-renders concern the lint rule guards against does
  // not apply because the effect runs once with stable deps and reaches a
  // terminal state. See the "Tri-state" comment above for the lifecycle.
  useEffect(() => {
    if (immediate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("animated")
      return
    }

    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (inViewport) {
      // Already on-screen at mount — fire the animation directly, no hide step
      setPhase("animated")
      return
    }

    // Off-screen at mount — hide and observe
    setPhase("hidden")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase("animated")
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate])

  let style: React.CSSProperties = {}
  if (phase === "hidden") {
    style = { opacity: 0, transform: "translateY(24px)" }
  } else if (phase === "animated") {
    style = {
      animation: `fadeUp ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
      opacity: 0,
    }
  }
  // phase === "ssr" → empty style → content visible at final position

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
