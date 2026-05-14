"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/analytics/events"

const THRESHOLDS = [25, 50, 75, 100] as const
type Threshold = (typeof THRESHOLDS)[number]

/**
 * Fires `scroll_depth` once per session per threshold (25%, 50%, 75%, 100%).
 * Computes via `scrollY / (documentHeight - viewportHeight)` on a throttled
 * scroll listener. Mount once in the root layout.
 */
export function ScrollDepthTracker() {
  useEffect(() => {
    const fired = new Set<Threshold>()
    let raf = 0

    function compute() {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      if (max <= 0) return
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100))
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t)
          analytics.scrollDepth(t)
        }
      }
    }

    function onScroll() {
      if (raf) return
      raf = window.requestAnimationFrame(compute)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    // Fire once on mount in case the user lands deep-scrolled (anchor link).
    compute()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
