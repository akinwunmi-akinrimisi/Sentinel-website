# Sentinel Homepage — PR 8: GA4 + CCPA + Final Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the final launch-ready PR. Wire GA4 via `@next/third-parties/google` with CCPA Consent Mode v2 defaults, add a dismissable consent banner, auto-instrument every `data-cta` click + scroll-depth via global trackers, ship JSON-LD Organization structured data, address the `@sanity/image-url` deprecation flagged by PRs 4 and 7, add a Lighthouse CI config + a manual-QA checklist, and walk the full `SECURITY.md` checklist.

**Architecture:** GA4 mounts in `app/layout.tsx` via `<GoogleAnalytics>` from `@next/third-parties/google`, immediately AFTER a `<Script id="consent-default" strategy="beforeInteractive">` that sets `gtag('consent', 'default', { analytics_storage: 'denied' })` — this is the CCPA Consent Mode v2 pattern. A small `consent.ts` module owns `localStorage` state + a `useConsent` React hook. The `CCPABanner` shows when no choice is stored; "Accept" flips localStorage AND pushes `gtag('consent', 'update', { analytics_storage: 'granted' })`; "Decline" persists denial. `events.ts`'s `trackEvent` already short-circuits on missing `window.gtag` — GA4 will simply discard events when `analytics_storage: 'denied'`, so existing call-sites need no change. Two global tracker components mount in the root layout: `CtaClickTracker` (document-level listener on `[data-cta]`) and `ScrollDepthTracker` (IntersectionObserver-based 25/50/75/100% pings). JSON-LD Organization schema lives in a `<script>` injected by `app/(marketing)/page.tsx` (homepage only).

**Tech Stack:** Next.js 16 `<Script>` strategies · `@next/third-parties/google` (already in `package.json`) · `next/script` for the consent default · localStorage + `useSyncExternalStore` for the consent hook · no new deps.

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` §11.1 PR 8 + §10 Security (CSP already covers `googletagmanager.com`). `WEBSITE_CONTEXT.md` §7 (GA4 event list) + §9 (structured data — Organization on home, Course on program pages → Course schema deferred to a future PR alongside the program detail pages).

**Out of scope (carry forward post-launch):**
- Course schema on `/programs/{slug}` — the detail pages don't exist on the homepage build.
- BreadcrumbList schema on inner pages — no inner pages yet besides `/contact`, `/thanks`, `/studio`.
- `discovery_call_booked` event from Cal.com's `postMessage` — the Cal.com iframe emits booking-success events but wiring the listener is post-launch.
- Lighthouse CI actually running in CI — the config file ships, but enabling the GitHub Action requires a remote runner the user enables manually.

---

## Prerequisites — User action

Before this PR fully exercises in production:
1. `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-SX7492KRTM` must be set in `.env` / Vercel (already present per `.env.example`).
2. Vercel preview URL deployed, then run https://securityheaders.com against it (final SECURITY.md check — manual).
3. After launch, verify GA4 events in DebugView with a real browser.

---

## File Structure for This PR

```
src/lib/sanity/client.ts                          MODIFY: switch to createImageUrlBuilder named import

src/lib/analytics/
├── consent.ts                                    CREATE: localStorage state + useConsent hook + grant/deny helpers
└── events.ts                                     MODIFY: no change to API; document the consent contract in comments

src/components/analytics/
├── CCPABanner.tsx                                CREATE: fixed-bottom banner, Accept/Decline buttons
├── ConsentDefault.tsx                            CREATE: <Script beforeInteractive> setting GA4 consent default
├── CtaClickTracker.tsx                           CREATE: document-level click listener on [data-cta]
├── ScrollDepthTracker.tsx                        CREATE: 25/50/75/100% scroll thresholds
└── OrganizationSchema.tsx                        CREATE: JSON-LD Organization schema (server component)

src/app/layout.tsx                                MODIFY: mount ConsentDefault + GA4 + CCPABanner + trackers
src/app/(marketing)/page.tsx                      MODIFY: render OrganizationSchema once on homepage

lighthouserc.json                                 CREATE: Lighthouse CI config (urls + assertions)
.github/workflows/lighthouse.yml                  CREATE: GitHub Actions workflow (optional — runs on PRs)
docs/pre-launch-qa.md                             CREATE: manual QA + responsive + SECURITY.md final checklist
```

---

## Task 1 — Fix `@sanity/image-url` deprecation

The PR 4/5/7 builds emit a warning about the default export. Switch to the named export `createImageUrlBuilder`.

**Files:**
- Modify: `src/lib/sanity/client.ts`

- [ ] **Step 1: Edit `src/lib/sanity/client.ts`** — change the import on line 2 from default to named:

Old (line 2):
```ts
import imageUrlBuilder from '@sanity/image-url'
```

New:
```ts
import createImageUrlBuilder from '@sanity/image-url'
```

(If the package's named export shape differs — i.e., `createImageUrlBuilder` isn't a default export either — the alternative is `import { default as createImageUrlBuilder } from '@sanity/image-url'` OR check `node_modules/@sanity/image-url/index.d.ts` for the actual export shape. The simplest fix is often just renaming the local binding: the import remains `import imageUrlBuilder from '@sanity/image-url'` but the runtime deprecation message is suppressed by upgrading the package. Run `pnpm up @sanity/image-url@latest` and check if the warning persists. If still present, use the explicit named-import form documented in `node_modules/@sanity/image-url/README.md` and report.)

Then update the usage on the next line (around line 52):
```ts
const builder = createImageUrlBuilder(sanityClient)
```

- [ ] **Step 2: Verify**

Run: `pnpm build` (NOT just tsc — the deprecation only emits at build time). Expect: no deprecation warning about `@sanity/image-url`. Zero TS errors.

If the warning persists, the package itself emits it — report and skip the rename; this is non-blocking polish.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/client.ts
git commit -m "chore(pr8): suppress @sanity/image-url default-export deprecation"
```

---

## Task 2 — Consent system: hook + banner + default script

Three small files that together implement CCPA Consent Mode v2.

**Files:**
- Create: `src/lib/analytics/consent.ts`
- Create: `src/components/analytics/ConsentDefault.tsx`
- Create: `src/components/analytics/CCPABanner.tsx`

- [ ] **Step 1: Create `src/lib/analytics/consent.ts`**:

```ts
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
```

- [ ] **Step 2: Create `src/components/analytics/ConsentDefault.tsx`**:

```tsx
import Script from "next/script"

/**
 * Sets GA4 Consent Mode v2 default to denied BEFORE the GA4 script loads.
 * Required for CCPA compliance — analytics, ads, and personalization are
 * denied until the user explicitly accepts via the CCPABanner.
 *
 * Must mount in the root layout, ABOVE <GoogleAnalytics>.
 */
export function ConsentDefault() {
  return (
    <Script
      id="ga-consent-default"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          // If a returning visitor already granted, replay to update immediately.
          try {
            var c = localStorage.getItem('sentinel-consent-v1');
            if (c === 'granted') {
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
            }
          } catch (e) { /* localStorage unavailable */ }
        `,
      }}
    />
  )
}
```

- [ ] **Step 3: Create `src/components/analytics/CCPABanner.tsx`**:

```tsx
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
```

- [ ] **Step 4: Verify**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/consent.ts src/components/analytics/ConsentDefault.tsx src/components/analytics/CCPABanner.tsx
git commit -m "feat(pr8): CCPA Consent Mode v2 — default deny + banner + useConsent hook"
```

---

## Task 3 — Global trackers: cta_click + scroll_depth

Two small client components that auto-instrument analytics without touching every existing CTA.

**Files:**
- Create: `src/components/analytics/CtaClickTracker.tsx`
- Create: `src/components/analytics/ScrollDepthTracker.tsx`

- [ ] **Step 1: Create `src/components/analytics/CtaClickTracker.tsx`**:

```tsx
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
```

- [ ] **Step 2: Create `src/components/analytics/ScrollDepthTracker.tsx`**:

```tsx
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
```

- [ ] **Step 3: Verify**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/analytics/CtaClickTracker.tsx src/components/analytics/ScrollDepthTracker.tsx
git commit -m "feat(pr8): global CTA click + scroll-depth analytics trackers"
```

---

## Task 4 — JSON-LD Organization schema

Server component rendering a `<script type="application/ld+json">` with the Organization schema. Mounted once on the homepage.

**Files:**
- Create: `src/components/analytics/OrganizationSchema.tsx`

- [ ] **Step 1: Create `src/components/analytics/OrganizationSchema.tsx`**:

```tsx
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelinstitute.com"

/**
 * Organization schema (JSON-LD) for the homepage. Required for Google's
 * Knowledge Graph + rich result eligibility. The schema is static — no Sanity
 * lookup — because organization metadata is a brand-level constant.
 */
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sentinel Institute",
    legalName: "Sentinel Institute LLC",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    description:
      "Enterprise cybersecurity certification training — CompTIA Security+, CySA+, CASP+ — with a documented 96% first-attempt pass rate and a no-pass, re-train guarantee.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "200 W. Monroe Street, Suite 1900",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60606",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Sales",
      email: "training@sentinelinstitute.com",
      telephone: "+1-312-555-0194",
      areaServed: "US",
      availableLanguage: ["en"],
    },
    sameAs: [
      "https://www.linkedin.com/company/sentinel-institute",
    ],
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify on a static literal object — no user input, no XSS surface.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/analytics/OrganizationSchema.tsx
git commit -m "feat(pr8): JSON-LD Organization schema for homepage"
```

---

## Task 5 — Wire everything into root layout + homepage

Mount: ConsentDefault → GoogleAnalytics → CtaClickTracker → ScrollDepthTracker → CCPABanner in the root layout. Mount OrganizationSchema in the homepage.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx`** — add imports and mount the components inside `<body>`.

Read the existing file to confirm structure, then edit:

Add imports (alphabetically after the existing ones, before `metadata`):
```tsx
import { GoogleAnalytics } from "@next/third-parties/google"
import { CCPABanner } from "@/components/analytics/CCPABanner"
import { ConsentDefault } from "@/components/analytics/ConsentDefault"
import { CtaClickTracker } from "@/components/analytics/CtaClickTracker"
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker"
```

Add a constant for the GA4 measurement ID (after the imports, before `export const metadata`):
```tsx
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
```

Replace the `<body>` block in `RootLayout` with:
```tsx
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ConsentDefault />
        {GA4_ID ? <GoogleAnalytics gaId={GA4_ID} /> : null}
        {children}
        <CtaClickTracker />
        <ScrollDepthTracker />
        <CCPABanner />
      </body>
```

- [ ] **Step 2: Update `src/app/(marketing)/page.tsx`** — add import + render OrganizationSchema once.

Add import (near the other component imports):
```tsx
import { OrganizationSchema } from "@/components/analytics/OrganizationSchema"
```

Inside the JSX `return (...)` block, add `<OrganizationSchema />` as the FIRST child of the fragment (before `<Hero ...>`):
```tsx
  return (
    <>
      <OrganizationSchema />
      <Hero stats={stats} pressOutlets={pressOutlets} />
      ...
    </>
  )
```

- [ ] **Step 3: Verify**

Run: `pnpm tsc --noEmit && pnpm build`. Expected: zero errors. The build output should include the GA4 measurement ID injection if env is set.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx "src/app/(marketing)/page.tsx"
git commit -m "feat(pr8): mount GA4 + Consent + trackers in root layout; Organization schema on /"
```

---

## Task 6 — Lighthouse CI config + manual QA checklist

Lighthouse CI config file ships so the user can wire it into a GitHub Action whenever they're ready. Manual QA checklist documents everything that can't be automated.

**Files:**
- Create: `lighthouserc.json`
- Create: `.github/workflows/lighthouse.yml`
- Create: `docs/pre-launch-qa.md`

- [ ] **Step 1: Create `lighthouserc.json`**:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/contact",
        "http://localhost:3000/thanks"
      ],
      "startServerCommand": "pnpm start",
      "startServerReadyPattern": "Ready in",
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "accessibility", "best-practices", "seo"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:best-practices": ["warn", { "minScore": 0.95 }],
        "categories:seo": ["warn", { "minScore": 0.95 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interaction-to-next-paint": ["warn", { "maxNumericValue": 200 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

- [ ] **Step 2: Create `.github/workflows/lighthouse.yml`**:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  workflow_dispatch: {}

jobs:
  lhci:
    name: Lighthouse audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
          NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
          NEXT_PUBLIC_SANITY_DATASET: production
          NEXT_PUBLIC_GA4_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_GA4_MEASUREMENT_ID }}

      - name: Lighthouse CI
        run: pnpm dlx @lhci/cli@latest autorun
```

- [ ] **Step 3: Create `docs/pre-launch-qa.md`**:

```markdown
# Sentinel Institute — Pre-Launch QA Checklist

This is the manual checklist Marcus + engineering walk before the production cutover. Everything that can't be automated lives here.

## 1. Environment audit (Vercel project → Settings → Environment Variables)

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://sentinelinstitute.com`
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_SANITY_DATASET` = `production`
- [ ] `SANITY_API_TOKEN` set (Editor scope)
- [ ] `SANITY_REVALIDATE_SECRET` set (32-char random)
- [ ] `RESEND_API_KEY` set
- [ ] `RESEND_FROM_EMAIL` = `training@sentinelinstitute.com`
- [ ] `RESEND_TO_EMAIL` = `training@sentinelinstitute.com`
- [ ] `SLACK_WEBHOOK_URL` set
- [ ] `HUBSPOT_PORTAL_ID` set
- [ ] `HUBSPOT_FORM_ID` set
- [ ] `KV_REST_API_URL` set (Vercel KV)
- [ ] `KV_REST_API_TOKEN` set
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` = `G-SX7492KRTM`
- [ ] `NEXT_PUBLIC_CAL_LINK` = `https://cal.com/sentinelinstitute/discovery`

## 2. Sanity Studio audit

- [ ] All 8 schemas seeded per `docs/seed-data-pr4.md`.
- [ ] Sanity webhook configured (Manage → API → Webhooks):
  - URL: `https://sentinelinstitute.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
  - Triggers: Create, Update, Delete
  - Filter: `_type in [...]`
  - Method: POST
  - Payload: Document

## 3. Visual responsive QA (Chrome DevTools or real devices)

Verify each section renders correctly at every breakpoint:

- [ ] 375 × 667 — iPhone SE / portrait
- [ ] 768 × 1024 — iPad / portrait
- [ ] 1280 × 800 — laptop
- [ ] 1920 × 1080 — desktop

Sections to walk through:

- [ ] Hero — stat pillar collapses below copy on mobile; press band wraps.
- [ ] TrustBar — client labels wrap; CompTIA badge stays inline.
- [ ] ProblemSection — single column max-w 40rem; numbered statements stack on narrow.
- [ ] ProgramsOverview — 3-col on desktop, 1-col on mobile.
- [ ] SentinelSystem — GSAP timeline plays on first scroll; reduced-motion skips animation.
- [ ] ResultsByProgram — grid columns reflow on mobile.
- [ ] CaseStudyFeature — quote stays max-w 40rem; metadata wraps.
- [ ] Testimonials — quotes max-w 48rem; avatar + attribution stays inline.
- [ ] IndustriesServed — 3×2 / 2×3 / 1-col grid.
- [ ] ProposalCTA — centered, slot count visible.
- [ ] FAQPreview — accordion fully clickable, content readable.

## 4. Functional QA

- [ ] Hero "Request a Training Proposal" → `/contact` form loads.
- [ ] Hero "Book a 20-Minute Discovery Call" → Cal.com modal opens, iframe loads.
- [ ] BookingDialog "Open in new tab" fallback works.
- [ ] /contact form rejects `gmail.com` business emails (inline error).
- [ ] /contact form rejects invalid US phone format.
- [ ] /contact form happy path: submit → redirect to `/thanks` within 5s.
  - [ ] Resend prospect email arrives in inbox within 60s.
  - [ ] Resend internal email arrives at `training@sentinelinstitute.com`.
  - [ ] Slack `#new-leads` notification fires (with no failedSteps).
  - [ ] HubSpot contact record appears in CRM with all 13 fields populated.
- [ ] /contact rate limit: submit 6× from same IP → 6th returns 429 with "Try again in N seconds".
- [ ] /contact honeypot: programmatically set `hp_field=spam` and POST → silent 200, no email sent.
- [ ] /thanks renders correctly. Print preview shows white bg, black text, CTAs hidden.
- [ ] /studio loads, schema list visible. (Editor login required.)
- [ ] /api/revalidate: wrong secret → 401. Right secret → 200 and homepage updates.

## 5. Accessibility QA

- [ ] All forms keyboard-navigable Tab → Enter.
- [ ] All form errors announced by screen reader (VoiceOver / NVDA).
- [ ] All images have alt text (next/image rendered).
- [ ] Color contrast ≥ AA on all text (Lighthouse).
- [ ] `prefers-reduced-motion: reduce` disables Hero parallax + SentinelSystem timeline.

## 6. GA4 verification (DebugView)

Open GA4 → Configure → DebugView. Open the site in a Chrome with the GA Debug extension enabled (or set `?gtm_debug=true`). Walk:

- [ ] `page_view` fires on `/`, `/contact`, `/thanks`, `/studio`.
- [ ] `cta_click` fires on every CTA button + link click (label matches `data-cta`).
- [ ] `proposal_form_start` fires on first focus of the form.
- [ ] `proposal_form_submit` fires on successful submission.
- [ ] `scroll_depth` fires at 25 / 50 / 75 / 100% as the user scrolls the homepage.
- [ ] CCPA banner appears on first visit. Clicking Decline does NOT send subsequent events. Clicking Accept does.

## 7. Security final pass

Run https://securityheaders.com against the Vercel preview URL — score should be at least A.

- [ ] Content-Security-Policy present
- [ ] Strict-Transport-Security present
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy present
- [ ] No `X-Powered-By: Next.js`

Run `pnpm audit` — zero high/critical.

## 8. Performance final pass

Run Lighthouse against the Vercel preview URL (Performance preset, mobile + desktop):

- [ ] Performance ≥ 90
- [ ] Accessibility = 100
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Initial JS bundle ≤ 120 KB gzipped

## 9. Production cutover

- [ ] Custom domain (sentinelinstitute.com) attached in Vercel.
- [ ] DNS propagated (`dig sentinelinstitute.com A` returns Vercel IPs).
- [ ] SSL cert active (Vercel auto-issues).
- [ ] Sitemap + robots.txt accessible at https://sentinelinstitute.com/sitemap.xml and /robots.txt.
- [ ] OG image renders correctly in the LinkedIn Post Inspector.
- [ ] Marcus signs off on copy + visual.
- [ ] Final `git push origin pr-8-launch` and merge to `main`.
- [ ] Vercel promotes the preview to production.
```

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.json .github/workflows/lighthouse.yml docs/pre-launch-qa.md
git commit -m "chore(pr8): Lighthouse CI config + pre-launch QA checklist"
```

---

## Task 7 — Final verification + SECURITY.md walkthrough + tag

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`. Expected: zero errors. Existing react-hooks/incompatible-library warning on ProposalForm `watch()` is acceptable (RHF limitation).

- [ ] **Step 3: Build**

Run: `pnpm build`. Expected: clean exit. Same route table as PR 7.

- [ ] **Step 4: SECURITY.md final walkthrough**

Read `SECURITY.md` from top to bottom. For each checkbox, mark ✓ (covered) or ✗ (not covered) and list which PR addressed it. Focus on the items PR 8 introduces:

- Environment & Secrets:
  - All secrets server-only ✓ (PR 4–6)
  - `.env.local` gitignored ✓
- HTTP Security Headers ✓ (PR 6 Task 2)
- Input Validation ✓ (PR 6 Tasks 3 + 7)
- Rate Limiting ✓ (PR 6 Task 4)
- Auth — N/A (no auth in scope)
- Stripe — N/A (Stripe webhook deferred)
- Sanity — server-only token ✓ (PR 4 Task 11)
- Content Security — CSP allows GA + Stripe + Sanity + Cal.com ✓ (PR 6 Task 2)
- Logging — server-side `console.error` only ✓
- GDPR/CCPA — consent banner ✓ (PR 8 Task 2)
- Pre-deployment Lighthouse + securityheaders.com — manual, documented in `pre-launch-qa.md` ✓ (PR 8 Task 6)

Report any unchecked item that's a launch blocker.

- [ ] **Step 5: Tag PR 8 locally**

```bash
git tag pr-8-launch
```

Do not push.

- [ ] **Step 6: Brief**

Summarize PR 8 deliverables + the launch picture.

---

## Self-Review (Spec Coverage)

| Spec §11.1 PR 8 bullet | Covered by | Status |
|---|---|---|
| `src/lib/analytics/events.ts` wired (already has the typed wrappers) | Existing from PR 1 + Task 3 (auto-instrumentation of CTAs) | ✅ |
| `src/lib/analytics/consent.ts` CCPA consent state + banner UI | Task 2 (consent.ts + CCPABanner + ConsentDefault) | ✅ |
| GA4 events wired across all sections (cta_click, scroll_depth, form events) | Task 3 (global trackers) + PR 6 form events | ✅ |
| Structured data (JSON-LD) — Organization schema on home | Task 4 (OrganizationSchema) + Task 5 mount | ✅ |
| Structured data — Course schema on program pages | Deferred (no program detail pages yet) | ⚠️ Deferred |
| Lighthouse CI integration | Task 6 (config file ships; remote runner is operator action) | ✅ Config |
| Manual responsive QA across 375 / 768 / 1280 / 1920 | Task 6 (`docs/pre-launch-qa.md` §3) | ✅ Documented |
| SECURITY.md final checklist | Task 7 step 4 | ✅ |
| Final preview → production cutover via Vercel | Task 6 `pre-launch-qa.md` §9 | ✅ Documented |

**Placeholder scan:** Grepped this plan for `TBD`, `TODO`, `fill in` — no hits.

**Type consistency:** `useConsent` (Task 2) is consumed by `CCPABanner` (Task 2) — both client components. `grantConsent` / `denyConsent` are pure event handlers — no leak of internal state. The `gtag` global is accessed via type assertion (`window as unknown as { gtag?: ... }`) in `consent.ts` to avoid polluting global types. `analytics.ctaClick` / `analytics.scrollDepth` (already exported from PR 1's `events.ts`) match the call sites in Tasks 3 trackers. The GA4 measurement ID env var name `NEXT_PUBLIC_GA4_MEASUREMENT_ID` matches `.env.example` (line `G-SX7492KRTM`).
