"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface SystemTimelineProps {
  children: ReactNode
  /** Class applied to the wrapping div. */
  className?: string
}

/**
 * Wraps the Sentinel Certification System™ timeline content. Children are
 * rendered server-side in their final state, so crawlers / no-JS / Lighthouse
 * audits all see real content. On the client, after first viewport intersection,
 * a single GSAP timeline plays the reveal sequence.
 *
 * Children are expected to include elements with these data attributes:
 *   data-system-line             — the vertical connector line (one)
 *   data-system-dot              — phase dot markers (one per phase step)
 *   data-system-step-content     — phase step content blocks (one per phase)
 *   data-system-result-dot       — the result block's dot (one)
 *   data-system-result-content   — the result block's content (one)
 *
 * Respects prefers-reduced-motion: reduce — no animation, content stays as
 * SSR rendered it.
 */
export function SystemTimeline({ children, className }: SystemTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    // Lazy-load GSAP only when this effect runs, so the bundle stays out of
    // initial JS when the user never reaches this section.
    import("gsap").then((mod) => {
      if (cancelled) return
      const gsap = mod.default

      const line = container.querySelector<HTMLElement>("[data-system-line]")
      const dots = Array.from(
        container.querySelectorAll<HTMLElement>("[data-system-dot]")
      )
      const stepContents = Array.from(
        container.querySelectorAll<HTMLElement>("[data-system-step-content]")
      )
      const resultDot = container.querySelector<HTMLElement>(
        "[data-system-result-dot]"
      )
      const resultContent = container.querySelector<HTMLElement>(
        "[data-system-result-content]"
      )

      // Snap to initial animation state (overrides SSR final-state styles).
      if (line) gsap.set(line, { scaleY: 0, transformOrigin: "top center" })
      dots.forEach((d) => gsap.set(d, { scale: 0, opacity: 0 }))
      stepContents.forEach((c) => gsap.set(c, { opacity: 0, y: 24 }))
      if (resultDot) gsap.set(resultDot, { scale: 0, opacity: 0 })
      if (resultContent) gsap.set(resultContent, { opacity: 0, y: 24 })

      const playTimeline = () => {
        const tl = gsap.timeline()

        if (line) {
          tl.to(line, { scaleY: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        }

        dots.forEach((dot, i) => {
          const at = 0.2 + i * 0.35
          tl.to(
            dot,
            { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" },
            at
          )
          const content = stepContents[i]
          if (content) {
            tl.to(
              content,
              { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
              at + 0.05
            )
          }
        })

        if (resultDot) {
          tl.to(
            resultDot,
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" },
            "+=0.1"
          )
        }
        if (resultContent) {
          tl.to(
            resultContent,
            { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
            "<+=0.05"
          )
        }
      }

      // Viewport check on mount — fire immediately if visible, else observe.
      const rect = container.getBoundingClientRect()
      const inViewport =
        rect.top < window.innerHeight && rect.bottom > 0
      if (inViewport) {
        playTimeline()
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              playTimeline()
              observer.disconnect()
            }
          }
        },
        { threshold: 0.15 }
      )

      observer.observe(container)
      cleanup = () => observer.disconnect()
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
