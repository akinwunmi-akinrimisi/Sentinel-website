"use client"

import { useConsent, grantConsent, denyConsent } from "@/lib/analytics/consent"

/**
 * Fixed-bottom CCPA consent banner. Renders only while consent state is
 * "pending"; vanishes once the user clicks Accept or Decline (state stored in
 * localStorage). On `useSyncExternalStore`'s server snapshot the state is
 * "pending", so the banner is included in the SSR payload and visible
 * pre-hydration for legitimate users — they see + interact with it without
 * waiting for JS.
 */
export function CCPABanner() {
  const consent = useConsent()
  if (consent !== "pending") return null

  return (
    <div
      role="region"
      aria-label="Privacy consent"
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:max-w-[28rem] rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lifted)] p-5"
    >
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
        Privacy
      </p>
      <p className="mt-2 text-[0.875rem] text-[var(--color-text-secondary)] leading-relaxed">
        We use Google Analytics to understand traffic and improve this site. No
        ads, no personal data sold. You can decline without losing functionality.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={grantConsent}
          className="btn-primary"
          data-cta="consent-accept"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={denyConsent}
          className="btn-secondary"
          data-cta="consent-decline"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
