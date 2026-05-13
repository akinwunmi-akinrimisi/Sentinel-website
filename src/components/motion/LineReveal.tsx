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
 * Renders its child text. After hydration, if the element is below the
 * viewport, attaches a covering mask that sweeps away when the element
 * scrolls into view, producing a single-sweep reveal. If the element is
 * already on-screen at hydration, the mask is attached and immediately
 * swept (visible flicker is negligible because it happens within one
 * frame of mount).
 *
 * Crucially, during SSR / no-JS / pre-hydration, the text is rendered
 * fully visible with no covering mask, so crawlers and Lighthouse see
 * the headline normally.
 *
 * Respects prefers-reduced-motion via the global media query in
 * `globals.css`.
 */
export function LineReveal({
  children,
  delay = 0.2,
  duration = 0.85,
  className,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Tri-state:
  //   "ssr"       — initial; no mask in the DOM at all, text visible
  //   "masked"    — mask attached and covering; waiting to be swept
  //   "revealing" — mask is animating away
  const [phase, setPhase] = useState<"ssr" | "masked" | "revealing">("ssr")

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (inViewport) {
      // Already on-screen — attach the mask and sweep it in the same render cycle
      setPhase("masked")
      // Trigger the reveal on the next frame so the masked state has rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("revealing"))
      })
      return
    }

    // Off-screen — attach the mask and observe
    setPhase("masked")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase("revealing")
            observer.disconnect()
          }
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      {phase !== "ssr" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--color-surface)",
            transformOrigin: "left center",
            transform: phase === "revealing" ? "scaleX(0)" : "scaleX(1)",
            transition:
              phase === "revealing"
                ? `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
                : "none",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  )
}
