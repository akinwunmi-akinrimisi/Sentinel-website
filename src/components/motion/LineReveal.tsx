"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface LineRevealProps {
  children: ReactNode
  /** Delay before the sweep starts, in seconds. Default 0.2. */
  delay?: number
  /** Sweep duration, in seconds. Default 0.85. */
  duration?: number
  /** Class on the wrapper. */
  className?: string
}

/**
 * Renders its child text behind a covering bar that slides away to the right,
 * revealing the text in a single sweep. Used for hero display headlines.
 * Uses the `lineReveal` keyframe defined in globals.css.
 *
 * Triggers once when the element enters the viewport. Respects
 * prefers-reduced-motion via the global media query in globals.css.
 */
export function LineReveal({
  children,
  delay = 0.2,
  duration = 0.85,
  className,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || triggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTriggered(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [triggered])

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--color-surface)",
          transformOrigin: "left center",
          transform: triggered ? "scaleX(0)" : "scaleX(1)",
          transition: triggered
            ? `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
            : "none",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
