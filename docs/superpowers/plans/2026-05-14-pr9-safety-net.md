# PR 9 — Safety Net Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the broken-route UX gap by shipping a branded 404, anchor-scroll nav, and a footer slug fix — without building the real Phase 2 pages.

**Architecture:** Six small surgical edits across 7 files. The 404 lives at `src/app/not-found.tsx` (root, not the `(marketing)` group) and imports Header + Footer itself because the root layout doesn't render them. Anchor scrolling is implemented by adding `id` + `scroll-mt-24` to existing section components and changing Header/Footer link `href`s. Slug fix is one character.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 (`@theme` tokens in `globals.css`). No tests beyond `tsc --noEmit`, `lint`, `build`, and `scripts/qa-smoke.py`.

**Spec reference:** `docs/superpowers/specs/2026-05-14-pr9-safety-net-design.md`

---

## File Inventory

**Create:**
- `src/app/not-found.tsx` — branded 404 component (renders Header + Footer + centered minimal content)

**Modify:**
- `src/components/sections/ProgramsOverview.tsx` — add `id="programs"` + `scroll-mt-24` to top `<section>`
- `src/components/sections/IndustriesServed.tsx` — same with `id="industries"`
- `src/components/sections/ResultsByProgram.tsx` — same with `id="results"`
- `src/components/sections/FAQPreview.tsx` — same with `id="faq"`
- `src/components/layout/Header.tsx` — update `NAV_LINKS` hrefs to anchors, remove `/about`
- `src/components/layout/Footer.tsx` — update aggregate nav hrefs, remove `/about` from Company column
- `src/lib/sanity/fallbacks.ts` — change defense industry `slug: 'defense'` → `slug: 'government-defense'`
- `src/app/globals.css` — add reduced-motion-guarded `scroll-behavior: smooth`

**Verify (no changes):**
- `scripts/qa-smoke.py` — re-run after all edits to confirm zero broken-route console errors

---

## Task 1: Add `id` + `scroll-mt-24` to four section components

**Files:**
- Modify: `src/components/sections/ProgramsOverview.tsx:18-21`
- Modify: `src/components/sections/IndustriesServed.tsx:11-14` (verify line numbers)
- Modify: `src/components/sections/ResultsByProgram.tsx:26-29`
- Modify: `src/components/sections/FAQPreview.tsx:55-58`

The pattern is identical in each file: locate the top-level `<section>` element (the one with `aria-labelledby="X-headline"`), add `id="X"` as its first attribute, and append `scroll-mt-24` to the existing `className`.

- [ ] **Step 1: Edit ProgramsOverview.tsx**

Find this block (around line 18):

```tsx
<section
  aria-labelledby="programs-headline"
  className="py-20 md:py-28 bg-[var(--color-surface)]"
>
```

Change to:

```tsx
<section
  id="programs"
  aria-labelledby="programs-headline"
  className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface)]"
>
```

- [ ] **Step 2: Edit IndustriesServed.tsx**

Find (around line 11):

```tsx
<section
  aria-labelledby="industries-headline"
  className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

Change to:

```tsx
<section
  id="industries"
  aria-labelledby="industries-headline"
  className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

- [ ] **Step 3: Edit ResultsByProgram.tsx**

Find (around line 26):

```tsx
<section
  aria-labelledby="results-headline"
  className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

Change to:

```tsx
<section
  id="results"
  aria-labelledby="results-headline"
  className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

- [ ] **Step 4: Edit FAQPreview.tsx**

Find (around line 55):

```tsx
<section
  aria-labelledby="faq-headline"
  className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

Change to:

```tsx
<section
  id="faq"
  aria-labelledby="faq-headline"
  className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
>
```

- [ ] **Step 5: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit, no output.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/ProgramsOverview.tsx src/components/sections/IndustriesServed.tsx src/components/sections/ResultsByProgram.tsx src/components/sections/FAQPreview.tsx
git commit -m "feat(pr9): add anchor ids + scroll-mt-24 to 4 homepage sections"
```

---

## Task 2: Update Header nav hrefs + remove /about

**File:** Modify `src/components/layout/Header.tsx:4-10`

- [ ] **Step 1: Edit NAV_LINKS array**

Find (lines 4-10):

```tsx
const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/industries", label: "Industries" },
  { href: "/results", label: "Results" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const
```

Replace with:

```tsx
const NAV_LINKS = [
  { href: "/#programs", label: "Programs" },
  { href: "/#industries", label: "Industries" },
  { href: "/#results", label: "Results" },
  { href: "/#faq", label: "FAQ" },
] as const
```

Note: `/about` row is deleted entirely.

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(pr9): Header nav routes to homepage anchors; remove /about until PR 13"
```

---

## Task 3: Update Footer aggregate hrefs + remove /about

**File:** Modify `src/components/layout/Footer.tsx:11-30`

- [ ] **Step 1: Edit the Programs column**

Find (lines 7-12):

```tsx
{
  heading: "Programs",
  links: [
    { href: "/programs/security-plus", label: "CompTIA Security+" },
    { href: "/programs/cysa-plus", label: "CompTIA CySA+" },
    { href: "/programs/casp-plus", label: "CompTIA CASP+" },
    { href: "/programs", label: "All Programs" },
  ],
},
```

Change only the "All Programs" href:

```tsx
{
  heading: "Programs",
  links: [
    { href: "/programs/security-plus", label: "CompTIA Security+" },
    { href: "/programs/cysa-plus", label: "CompTIA CySA+" },
    { href: "/programs/casp-plus", label: "CompTIA CASP+" },
    { href: "/#programs", label: "All Programs" },
  ],
},
```

The 3 detail links (`/programs/{slug}`) stay as-is — they'll hit the branded 404 until PR 10 builds them.

- [ ] **Step 2: Edit the Industries column**

Find (lines 14-22):

```tsx
{
  heading: "Industries",
  links: [
    { href: "/industries/financial-services", label: "Financial Services" },
    { href: "/industries/healthcare", label: "Healthcare" },
    { href: "/industries/government-defense", label: "Government & Defense" },
    { href: "/industries", label: "All Industries" },
  ],
},
```

Change only the "All Industries" href:

```tsx
{
  heading: "Industries",
  links: [
    { href: "/industries/financial-services", label: "Financial Services" },
    { href: "/industries/healthcare", label: "Healthcare" },
    { href: "/industries/government-defense", label: "Government & Defense" },
    { href: "/#industries", label: "All Industries" },
  ],
},
```

- [ ] **Step 3: Edit the Company column (remove About, anchor Case Studies + FAQ)**

Find (lines 23-31):

```tsx
{
  heading: "Company",
  links: [
    { href: "/about", label: "About" },
    { href: "/results", label: "Case Studies" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
},
```

Replace with:

```tsx
{
  heading: "Company",
  links: [
    { href: "/#results", label: "Case Studies" },
    { href: "/#faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
},
```

Note: `/about` row is deleted entirely. `/contact` stays — that route works.

- [ ] **Step 4: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat(pr9): Footer aggregate links route to anchors; remove /about until PR 13"
```

---

## Task 4: Fix `defense` slug in fallbacks.ts

**File:** Modify `src/lib/sanity/fallbacks.ts:273`

- [ ] **Step 1: Edit the slug field**

Find (around line 273):

```ts
{
  _id: 'fallback-industry-defense',
  slug: 'defense',
  industryName: 'Defense Contractors',
```

Change `slug: 'defense'` to `slug: 'government-defense'`:

```ts
{
  _id: 'fallback-industry-defense',
  slug: 'government-defense',
  industryName: 'Defense Contractors',
```

Leave `_id` unchanged (it's an internal Sanity-fallback identifier, not user-facing).

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/fallbacks.ts
git commit -m "fix(pr9): align defense industry fallback slug with footer link"
```

---

## Task 5: Add reduced-motion-guarded smooth scroll

**File:** Modify `src/app/globals.css` (append after the `@theme` block)

- [ ] **Step 1: Add the media query**

Find a stable insertion point — anywhere after the closing `}` of the `@theme` block (around line 100-200, before any `@layer` block).

Add:

```css
/* Anchor-link smooth scroll, respecting reduced-motion (PR 9). */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

If the file already has a comment-delimited section structure, place this in a logical spot (e.g., near other root-level html/body styles). If there's no obvious spot, append immediately after the `@theme { ... }` block closes.

- [ ] **Step 2: Build to confirm CSS compiles**

Run: `pnpm build`
Expected: clean build, 9 routes, no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(pr9): reduced-motion-guarded smooth scroll for anchor nav"
```

---

## Task 6: Create branded 404 at `src/app/not-found.tsx`

**File:** Create `src/app/not-found.tsx`

The root `not-found.tsx` catches every unmatched route. It is wrapped by `src/app/layout.tsx`, which does NOT include Header or Footer (those live in the `(marketing)` route group layout). So the component must import and render Header + Footer itself.

- [ ] **Step 1: Create the file with full component**

Write `src/app/not-found.tsx` with exactly this content:

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center bg-[var(--color-surface)] px-6 py-24 md:py-32"
      >
        <div className="max-w-[36rem] text-center">
          <div
            aria-hidden="true"
            className="font-display font-medium tracking-[-0.04em] leading-none text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
          >
            404
          </div>
          <h1 className="mt-2 font-display text-2xl md:text-3xl font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            Page not found.
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
            The page you&rsquo;re looking for either doesn&rsquo;t exist or has moved. Our enterprise certification programs are still where you left them.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="btn-primary"
              data-cta="not-found-primary"
            >
              Request a Proposal
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/"
              className="btn-secondary"
              data-cta="not-found-secondary"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

Notes the implementer needs to know:
- `btn-primary` and `btn-secondary` are global Tailwind component utilities defined in `globals.css` (verified to exist at lines 390 and 422). No new CSS needed.
- The root layout (`src/app/layout.tsx`) renders `<body className="min-h-full flex flex-col">` — the `<main>` element here uses `flex-1` to fill remaining vertical space between Header and Footer, matching the `(marketing)/layout.tsx` pattern.
- `data-cta="not-found-primary"` and `data-cta="not-found-secondary"` ensure the global `CtaClickTracker` (already mounted in root layout) fires GA4 events.
- `robots: { index: false, follow: false }` prevents Google from indexing the 404 page itself.
- The title template `%s · Sentinel Institute` from root layout will render the final title as "Page not found · Sentinel Institute".
- The decorative `404` numeral is `aria-hidden="true"` so screen readers announce only the `<h1>` heading "Page not found."

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit. If any error, verify imports resolve (`@/components/layout/Header`, `@/components/layout/Footer`).

- [ ] **Step 3: Lint check**

Run: `pnpm lint`
Expected: clean (or the same 2 acceptable warnings already present pre-PR-9: `beforeInteractive` in `ConsentDefault.tsx` and `react-hook-form` watch in `ProposalForm.tsx`). Zero new warnings.

- [ ] **Step 4: Build check**

Run: `pnpm build`
Expected: clean build. Route table shows `/_not-found` (already present, now resolves to the branded component).

- [ ] **Step 5: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat(pr9): branded 404 page with Header/Footer + dual CTAs"
```

---

## Task 7: Verification — smoke test + manual sanity

This task makes no commits. It exists so the implementer confirms the work end-to-end before opening the PR.

- [ ] **Step 1: Run smoke test against local dev server**

Confirm dev server is running on `http://localhost:3000` (start with `pnpm dev` if not), then:

```bash
python scripts/qa-smoke.py http://localhost:3000
```

Expected output:
- All 9 tests `PASS` (or `PARTIAL` on `contact-gmail-rejection` only)
- HTTP 4xx/5xx resource failures section: **empty** (zero broken-route prefetches)
- Console errors section: only `/studio` CORS errors (operational, unrelated to PR 9)

If there are still 404s for `/programs`, `/industries`, `/results`, `/faq`, the Header `NAV_LINKS` change didn't land or `pnpm dev` cached the old version — restart `pnpm dev` and re-run.

- [ ] **Step 2: Manual sanity — anchor scroll**

Open `http://localhost:3000` in a browser. Click each Header nav link in turn:
- Click "Programs" → page should scroll smoothly down to the ProgramsOverview section, with the section heading not obscured by the sticky header
- Click "Industries" → smooth scroll to IndustriesServed
- Click "Results" → smooth scroll to ResultsByProgram
- Click "FAQ" → smooth scroll to FAQPreview

Click "Sentinel Institute" logo → returns to top.

- [ ] **Step 3: Manual sanity — branded 404**

Visit `http://localhost:3000/programs/typo-not-real` directly.

Expected:
- HTTP status 404 (check DevTools → Network)
- Header visible at top with all 4 nav links
- Large serif "404" numeral
- Headline "Page not found."
- Body paragraph
- Two CTAs: "Request a Proposal" (primary) and "Return Home" (secondary)
- Footer at bottom

Also visit `http://localhost:3000/legal/privacy` and `http://localhost:3000/about` — both should render the same branded 404.

- [ ] **Step 4: Manual sanity — prefers-reduced-motion**

Open Chrome DevTools → ⋮ → More Tools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → Reduce.

Click a header nav link. The scroll should be **instant** (not animated). Switch back to "No preference" and confirm smooth scroll returns.

- [ ] **Step 5: Run smoke against the deployed Vercel preview**

After Vercel auto-deploys the PR 9 commits (~2 min after push), run:

```bash
python scripts/qa-smoke.py https://sentinel-website-sepia.vercel.app
```

Expected: same clean result as Step 1. This confirms the fix actually shipped, not just builds locally.

---

## Out-of-band reminders (not in this PR)

- `/programs/security-plus`, `/programs/cysa-plus`, `/programs/casp-plus` still hit the new branded 404. PR 10 builds them.
- `/results/healthcare-hipaa-security-plus` still hits 404. PR 12 builds it.
- 6 industry detail pages (including the renamed `/industries/government-defense`) still hit 404. PR 11 builds them.
- `/legal/privacy`, `/legal/terms`, `/legal/ccpa` still hit 404. PR 14 builds them.
- The `/about` route is no longer linked from the site but still hits 404 if direct-typed. PR 13 will add `/about` to nav and ship the page.
- Sanity Studio CORS for `localhost:3000` still needs adding in the Sanity dashboard (separate operational task documented in `docs/pre-launch-qa.md §2`).
