"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/analytics/events"

/**
 * Document-level click delegation: any element with [data-cta="..."] fires
 * `cta_click` with the data-cta value as the label. Handles bubbling so a
 * click on a child of a CTA still attributes correctly via closest().
 * Mount once in the root layout — no per-page wiring needed.
 */
export function CtaClickTracker() {
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Element | null
      if (!target || typeof target.closest !== "function") return
      const cta = target.closest<HTMLElement>("[data-cta]")
      if (!cta) return
      const label = cta.dataset.cta
      if (!label) return
      analytics.ctaClick(label)
    }
    document.addEventListener("click", handler, { capture: true })
    return () => document.removeEventListener("click", handler, { capture: true })
  }, [])

  return null
}
