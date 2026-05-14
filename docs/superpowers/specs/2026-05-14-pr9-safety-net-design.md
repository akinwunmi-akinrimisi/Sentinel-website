# PR 9 — Safety Net · Design

**Date:** 2026-05-14
**Project:** Sentinel Institute marketing site
**Status:** Approved — ready for plan

---

## Context

The 8-PR homepage build (tag `pr-8-launch`) shipped a Header, Footer, and homepage section CTAs that link to 18 routes which don't exist yet:

- 5 nav index pages: `/programs`, `/industries`, `/results`, `/faq`, `/about`
- 10 detail pages: 3× `/programs/{slug}`, 1× `/results/{slug}`, 6× `/industries/{slug}`
- 3 legal pages: `/legal/privacy`, `/legal/terms`, `/legal/ccpa`

A live Vercel deploy at `sentinel-website-sepia.vercel.app` confirmed visitors clicking these links hit Next.js's default 404 (white page, no branding, no recovery path). PR 9 closes the broken-UX gap *without* building the real pages — those land in PRs 10–14 by content type.

## Scope

### In scope

1. **Branded 404 page** (Variant A — Centered Minimal) at `src/app/not-found.tsx`. Handles every unmatched route uniformly.
2. **Anchor-scroll nav strategy** — Header + Footer reroute the 4 navigable index links to homepage section anchors (`/programs` → `/#programs`, etc.). `/about` is removed from nav until PR 13 builds it.
3. **Section ID additions** — 4 `<section>` elements gain a top-level `id` attribute matching the anchor URL.
4. **Footer slug fix** — `fallbacks.ts` industry slug `defense` → `government-defense` so it matches the footer link.
5. **Smooth scroll behavior** — `html { scroll-behavior: smooth }` guarded by `@media (prefers-reduced-motion: no-preference)` in `globals.css`.

### Out of scope

- 10 detail routes (built in PRs 10–12) — hit the branded 404 page in the meantime.
- 3 legal routes (built in PR 14) — same.
- `/about` page content (PR 13).
- Sanity Studio CORS configuration for `localhost:3000` — operational task in the Sanity dashboard.
- Any new Sanity schemas. PR 9 touches code only.

---

## Design

### 1. Branded 404 page

**File:** `src/app/not-found.tsx`

Server component, renders within the existing root layout (so Header + Footer wrap it automatically — no special handling needed).

**Layout:** centered minimal — single column, full-bleed dark navy background, fills viewport between Header and Footer.

**Content:**

- Massive `404` numerals in IBM Plex Serif Display, font-size ~6rem on desktop / 4rem on mobile.
- Title: "Page not found." (period, declarative)
- Body: "The page you're looking for either doesn't exist or has moved. Our enterprise certification programs are still where you left them."
- Two CTAs side-by-side, using the same pattern as Hero (`<Link className="btn-primary" data-cta="...">`):
  - Primary: "Request a Proposal" → `/contact`, `data-cta="not-found-primary"`
  - Secondary: "Return Home" → `/`, ghost variant (`btn-secondary` or equivalent — match what the rest of the site uses on dark navy bg), `data-cta="not-found-secondary"`
- CTAs stack to single column below `sm:` breakpoint.
- `data-cta` attributes ensure the global CTA tracker (PR 8) logs clicks to GA4.

**HTTP semantics:** Next.js's `not-found.tsx` automatically returns HTTP 404 — no custom handling needed.

**Accessibility:**

- `<h1>` for "Page not found." (only h1 on the page)
- CTAs are real `<Link>` components from `next/link` (already wraps `<a>`)
- Decorative `404` numeral marked `aria-hidden="true"`
- Color contrast ≥ AA on dark navy (existing palette already passes)
- No animation (page renders static)

**Metadata:** `export const metadata = { title: "Page not found — Sentinel Institute", robots: { index: false } }`. The `noindex` is important so Google doesn't accidentally index this page.

### 2. Anchor-scroll header nav

**File:** `src/components/layout/Header.tsx`

| Label | Current `href` | New `href` |
|---|---|---|
| Programs | `/programs` | `/#programs` |
| Industries | `/industries` | `/#industries` |
| Results | `/results` | `/#results` |
| FAQ | `/faq` | `/#faq` |
| About | `/about` | (removed) |

The "About" item is deleted from the `NAV_LINKS` array entirely (will be re-added when PR 13 ships the real page).

### 3. Section ID additions

Top-level `<section>` elements gain an `id` attribute. Existing nested `id` attributes (e.g., `id="programs-headline"` on the inner `<h2>`) stay unchanged.

| File | Section ID to add |
|---|---|
| `src/components/sections/ProgramsOverview.tsx` | `id="programs"` |
| `src/components/sections/IndustriesServed.tsx` | `id="industries"` |
| `src/components/sections/ResultsByProgram.tsx` | `id="results"` |
| `src/components/sections/FAQPreview.tsx` | `id="faq"` |

The Header is sticky (`sticky top-0` per `src/components/layout/Header.tsx`), so every anchored `<section>` must have `scroll-mt-24` (Tailwind class) to offset the sticky header height after a jump. Apply alongside the new `id`.

### 4. Footer cleanup

**File:** `src/components/layout/Footer.tsx`

- Remove "About" link from the company column.
- Update aggregate column links to match the new anchor pattern:
  - "All Programs" → `/#programs` (was `/programs`)
  - "All Industries" → `/#industries` (was `/industries`)
  - "Case Studies" → `/#results` (was `/results`)
  - "FAQ" → `/#faq` (was `/faq`)
- Detail links (`/programs/security-plus` etc., `/industries/financial-services` etc.) stay as-is — they 404 to the branded page until PR 10–11 ship.
- Legal links (`/legal/privacy`, `/legal/terms`, `/legal/ccpa`) stay as-is — they 404 to the branded page until PR 14 ships.

### 5. Fallback slug fix

**File:** `src/lib/sanity/fallbacks.ts`

```diff
-    slug: 'defense',
+    slug: 'government-defense',
```

This is line 273. The industry's `_id` and display name (`'Government & Defense'`) stay unchanged. PR 11's industry detail page template uses `government-defense` as the canonical slug.

### 6. Smooth scroll behavior

**File:** `src/app/globals.css` (the Tailwind v4 `@theme` + base file).

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

The media query ensures users with `prefers-reduced-motion: reduce` get an instant jump instead of an animated scroll.

---

## Quality bars

Before merge:

- `pnpm tsc --noEmit` clean
- `pnpm lint` clean (existing 2 acceptable warnings only)
- `pnpm build` clean — same 9 routes (the `_not-found` route already appears in the build output; PR 9 just replaces its default content with the branded component)
- `pnpm audit` zero high/critical
- `scripts/qa-smoke.py http://localhost:3000` reports zero broken-route console errors on `/` across all 4 breakpoints
- Manual sanity: click each Header/Footer nav link, confirm smooth scroll to correct section (or instant jump under `prefers-reduced-motion: reduce` set in Chrome DevTools)
- Visit `/programs/typo-slug` → see branded 404 with "Page not found." + 2 CTAs

---

## Open questions / risks

None. Anchor scrolling is a well-understood pattern, `not-found.tsx` is Next.js convention, the slug fix is a one-character change.

## Out-of-band reminders

- Sanity Studio CORS for `localhost:3000` needs adding in the Sanity dashboard if local Studio access matters (already noted in `docs/pre-launch-qa.md §2`).
- The fallback slug change (`defense` → `government-defense`) means any existing Sanity content with the old slug also needs updating in the dashboard. (No Sanity content is seeded yet — first seed will use the new slug per `docs/seed-data-pr4.md`.)
