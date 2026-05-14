"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "sentinel-consent-v1"

type ConsentState = "granted" | "denied" | "pending"

const subscribers = new Set<() => void>()

function readStorage(): ConsentState {
  if (typeof window === "undefined") return "pending"
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === "granted" || value === "denied") return value
    return "pending"
  } catch {
    return "pending"
  }
}

function writeStorage(state: Exclude<ConsentState, "pending">) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, state)
  } catch {
    /* localStorage disabled — silent */
  }
}

function notify() {
  for (const s of subscribers) s()
}

function gtagConsentUpdate(state: "granted" | "denied") {
  if (typeof window === "undefined") return
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag !== "function") return
  w.gtag("consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  })
}

/** Persist the user's choice and update GA4 consent state. */
export function grantConsent() {
  writeStorage("granted")
  gtagConsentUpdate("granted")
  notify()
}

export function denyConsent() {
  writeStorage("denied")
  gtagConsentUpdate("denied")
  notify()
}

/**
 * Returns the current consent state — `"pending"` until the user makes a
 * choice, then `"granted"` or `"denied"`. Subscribes via storage event so
 * cross-tab updates propagate.
 */
export function useConsent(): ConsentState {
  return useSyncExternalStore(
    (callback) => {
      subscribers.add(callback)
      const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) callback()
      }
      window.addEventListener("storage", onStorage)
      return () => {
        subscribers.delete(callback)
        window.removeEventListener("storage", onStorage)
      }
    },
    () => readStorage(),
    () => "pending"
  )
}

/** Check consent without subscribing (for analytics gate). */
export function getConsent(): ConsentState {
  return readStorage()
}
