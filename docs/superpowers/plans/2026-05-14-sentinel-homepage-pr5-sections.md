# Sentinel Homepage — PR 5: Sections 3, 4, 6, 7, 8, 9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the six remaining content-driven homepage sections — Problem (§3, hardcoded), Programs Overview (§4, Sanity), Results By Program (§6, Sanity), Case Study Feature (§7, Sanity), Testimonials (§8, Sanity), Industries Served (§9, Sanity) — wire them into `(marketing)/page.tsx`, and extend `fallbacks.ts` so the page still renders end-to-end when Sanity returns empty.

**Architecture:** Each section is a server component in `src/components/sections/` accepting only the data it renders — no Sanity client calls inside components. `(marketing)/page.tsx` continues to be the single fetch + fallback boundary: it calls `fetchHomepageData()` once, resolves null/empty results to constants from `fallbacks.ts`, derives one piece of plain-text content from the programs' `whoNeedsIt` Portable Text via a new `portableTextToPlain()` helper, then passes typed props down. Two sections render avatar-style portraits (Testimonials + CaseStudyFeature); they share a `SanityAvatar` component that gracefully renders initials when no image URL is set so the fallback shape still looks intentional.

**Tech Stack:** Next.js 16.2.6 server components · TypeScript 5.9 strict · Tailwind v4 · IBM Plex via `@fontsource` · `FadeUp` motion wrapper (existing) · `next/image` with the new `cdn.sanity.io` `remotePatterns` entry.

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` §3 (Problem), §4 (Programs), §6 (Results By Program), §7 (Case Study), §8 (Testimonials), §9 (Industries), §11.1 PR 5.

**Conventions:** `docs/CONVENTIONS.md` — Sentinel `var()` tokens vs shadcn bridge semantic classes; one section = one file; section components are server components by default.

**Out of scope for PR 5 (deferred):**
- §5 Sentinel Certification System™ rendering (already shipped in PR 3).
- §10 Proposal CTA + §11 FAQ Preview (PR 7).
- §12 Footer + Header polish (covered by PR 1 / PR 8).
- `/programs/{slug}`, `/results/{slug}`, `/industries/{slug}` detail pages — only the link URLs on the homepage cards are wired; the destination pages are out of scope.
- `<PortableText>` rendering of `whoNeedsIt` / `curriculumOutline` / `trainingContext` / `challenge`/`solution`/`outcome` blockContent fields on the homepage. The homepage card renders the *first plain-text paragraph* of `whoNeedsIt` only; full Portable Text rendering belongs to the detail pages.
- Real seed content — fallbacks ship with realistic placeholder copy so the page renders before the editorial team seeds Sanity. The seed-data checklist (`docs/seed-data-pr4.md` from PR 4) remains the source of truth for production content.

---

## File Structure for This PR

```
next.config.ts                                    MODIFY: add images.remotePatterns for cdn.sanity.io

src/lib/sanity/
├── portable-text.ts                              CREATE: portableTextToPlain helper
├── types.ts                                      MODIFY: add ProgramCardData derived shape
└── fallbacks.ts                                  MODIFY: add FALLBACK_PROGRAMS, FALLBACK_TESTIMONIALS,
                                                          FALLBACK_CASE_STUDY, FALLBACK_INDUSTRIES

src/components/sections/
├── SanityAvatar.tsx                              CREATE: image-or-initials avatar (shared)
├── ProblemSection.tsx                            CREATE: §3 — hardcoded editorial column
├── ProgramsOverview.tsx                          CREATE: §4 — 3 cards (Sanity programs)
├── ResultsByProgram.tsx                          CREATE: §6 — 3 data rows (Sanity stats)
├── CaseStudyFeature.tsx                          CREATE: §7 — featured case study
├── Testimonials.tsx                              CREATE: §8 — 3 testimonials
└── IndustriesServed.tsx                          CREATE: §9 — 6 cards (Sanity industries)

src/app/(marketing)/page.tsx                      MODIFY: import 6 new sections, derive props,
                                                          resolve fallbacks, compose
```

---

## Task 1 — Allow `cdn.sanity.io` in `next.config.ts`

`next/image` blocks any remote URL not whitelisted. Sanity image URLs all come from `cdn.sanity.io`. Without this entry, the build succeeds but every `<Image src="cdn.sanity.io/...">` 500s at request time.

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace `next.config.ts` body**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(pr5): allow cdn.sanity.io in next/image remotePatterns"
```

---

## Task 2 — `portableTextToPlain` helper

Walks a Portable Text array and concatenates the `text` children of every block. Newline-joins blocks. The homepage program card uses this to render `whoNeedsIt`'s first plain-text paragraph (≤ 2 lines clamped via CSS).

**Files:**
- Create: `src/lib/sanity/portable-text.ts`

- [ ] **Step 1: Create `src/lib/sanity/portable-text.ts`**

```ts
import type { PortableTextBlock } from 'next-sanity'

interface PortableTextChild {
  _type?: string
  text?: string
}

interface PortableTextWithChildren extends PortableTextBlock {
  children?: PortableTextChild[]
}

/**
 * Concatenates the plain-text contents of a Portable Text array. Used on the
 * homepage's program cards to show a 2-line summary of `whoNeedsIt` without
 * pulling in `<PortableText>` (which would force the card to a client boundary
 * for styling). Newlines join blocks; multiple spans inside a block are
 * concatenated without a separator.
 *
 * Intentionally simple — no mark handling, no list bullets, no link annotation.
 * The homepage card visually clamps to 2 lines via Tailwind, so anything past
 * the first few sentences is invisible anyway.
 */
export function portableTextToPlain(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks || blocks.length === 0) return ''
  return blocks
    .map((block) => {
      const b = block as PortableTextWithChildren
      if (!b.children) return ''
      return b.children
        .filter((child) => child._type === 'span' && typeof child.text === 'string')
        .map((child) => child.text)
        .join('')
    })
    .filter((line) => line.length > 0)
    .join('\n')
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/portable-text.ts
git commit -m "feat(pr5): add portableTextToPlain helper"
```

---

## Task 3 — Add `ProgramCardData` derived type

`ProgramsOverview` doesn't need the full `ProgramPage` shape — it only renders 7 fields plus the derived `whoNeedsItSummary` string. Capturing this as its own type keeps the component prop signature crisp.

**Files:**
- Modify: `src/lib/sanity/types.ts` — append after the existing `ProgramPage` interface

- [ ] **Step 1: Append to `src/lib/sanity/types.ts`** (add after the `export interface ProgramPage` block)

Read the current `types.ts`, then insert the following block AFTER the closing `}` of `ProgramPage` and BEFORE `export interface IndustryPage`:

```ts

/**
 * Shape passed into <ProgramsOverview>. Derived in (marketing)/page.tsx from
 * each ProgramPage by extracting plain text from `whoNeedsIt`. The card never
 * touches the full Portable Text — keeps the section a server component
 * without any Sanity-specific rendering.
 */
export interface ProgramCardData {
  slug: ProgramSlug
  certName: string
  eyebrow: string
  oneliner: string
  priceUSD: number
  durationWeeks: number
  sessionsPerWeek: number
  whoNeedsItSummary: string
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/types.ts
git commit -m "feat(pr5): add ProgramCardData derived type"
```

---

## Task 4 — `SanityAvatar` shared component

Renders a circular avatar from a `SanityImage`. When `image.url` is empty (fallback content with no real upload), renders a styled circle with the subject's initials so the layout doesn't break.

**Files:**
- Create: `src/components/sections/SanityAvatar.tsx`

- [ ] **Step 1: Create `src/components/sections/SanityAvatar.tsx`**

```tsx
import Image from "next/image"
import type { SanityImage } from "@/lib/sanity/types"

interface SanityAvatarProps {
  /** Source image. `image.url` may be empty when rendering fallback data. */
  image: SanityImage
  /** Full name used to derive initials when `image.url` is empty. */
  fullName: string
  /** Pixel diameter — both width and height. */
  size: number
}

function initialsOf(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Circular avatar. Renders <Image> when image.url is set, otherwise a styled
 * div with the subject's initials. Used by <Testimonials> and
 * <CaseStudyFeature> so fallback content (which ships with empty image URLs)
 * still produces a coherent layout.
 */
export function SanityAvatar({ image, fullName, size }: SanityAvatarProps) {
  const dimension = { width: size, height: size }

  if (image.url) {
    return (
      <Image
        src={image.url}
        alt={image.alt || fullName}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={dimension}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="rounded-full shrink-0 flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border)] font-mono uppercase tracking-[0.1em] text-[var(--color-text-secondary)]"
      style={{ ...dimension, fontSize: Math.round(size * 0.32) }}
    >
      {initialsOf(fullName) || "·"}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SanityAvatar.tsx
git commit -m "feat(pr5): add SanityAvatar shared component"
```

---

## Task 5 — §3 Problem Section (hardcoded copy)

Single column, max-w 40rem. Eyebrow + display headline + 3 numbered pull-quotes + closing accent-bordered line. All copy hardcoded per spec §3.

**Files:**
- Create: `src/components/sections/ProblemSection.tsx`

- [ ] **Step 1: Create `src/components/sections/ProblemSection.tsx`**

```tsx
import { FadeUp } from "@/components/motion/FadeUp"

const PROBLEMS: readonly string[] = [
  "Compliance pressure — HIPAA / PCI-DSS / CMMC require certified security staff by name.",
  "High exam-failure rates with previous providers — wasted budget, gap unchanged.",
  "Generic training that doesn't transfer — Pluralsight / LinkedIn Learning don't produce passing scores.",
] as const

export function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-headline"
      className="py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[40rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              What Buyers Tell Us
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="problem-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Three problems show up on every discovery call.
            </h2>
          </FadeUp>

          <ol className="mt-12 space-y-10">
            {PROBLEMS.map((problem, i) => (
              <FadeUp key={problem} delay={0.3 + i * 0.12}>
                <li className="flex gap-5">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium pt-1.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    className="font-display font-medium leading-[1.3] text-[var(--color-text-primary)]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                  >
                    {problem}
                  </p>
                </li>
              </FadeUp>
            ))}
          </ol>

          <FadeUp delay={0.75}>
            <blockquote
              className="mt-14 pl-6 border-l-2 border-[var(--color-accent-light)] font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              You don&apos;t need another platform. You need a documented pass rate.
            </blockquote>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProblemSection.tsx
git commit -m "feat(pr5): ProblemSection (§3 hardcoded editorial column)"
```

---

## Task 6 — §4 Programs Overview

Three `.card-dark` cards from the existing globals.css class. Server component; accepts `programs: ProgramCardData[]`. Hardcoded section eyebrow + headline.

**Files:**
- Create: `src/components/sections/ProgramsOverview.tsx`

- [ ] **Step 1: Create `src/components/sections/ProgramsOverview.tsx`**

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramsOverviewProps {
  programs: ProgramCardData[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramsOverview({ programs }: ProgramsOverviewProps) {
  return (
    <section
      aria-labelledby="programs-headline"
      className="py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-14">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Programs
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              id="programs-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Three certifications. One methodology.
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <FadeUp key={program.slug} delay={0.3 + i * 0.1} className="flex">
              <article className="card-dark flex flex-col gap-6 flex-1">
                <header className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                    {program.certName}
                  </p>
                  <p className="font-mono text-[0.875rem] text-[var(--color-text-primary)]">
                    {priceFormatter.format(program.priceUSD)}
                  </p>
                </header>

                <h3
                  className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.375rem, 2vw, 1.625rem)" }}
                >
                  {program.eyebrow}
                </h3>

                <p
                  className="text-[var(--color-text-secondary)] leading-relaxed"
                  style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {program.oneliner}
                </p>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
                    Who needs this
                  </p>
                  <p
                    className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {program.whoNeedsItSummary}
                  </p>
                </div>

                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mt-auto">
                  Duration · {program.durationWeeks} weeks  ·  Sessions · {program.sessionsPerWeek}× per week
                </p>

                <Link
                  href={`/programs/${program.slug}`}
                  className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                  data-cta="program-card"
                  data-program={program.slug}
                >
                  Explore the program
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProgramsOverview.tsx
git commit -m "feat(pr5): ProgramsOverview (§4, three Sanity-driven program cards)"
```

---

## Task 7 — §6 Results By Program

Single column, max-w 56rem. 3 data rows hairline-separated. Footer caption pulls remaining numbers from `companyStats`.

**Files:**
- Create: `src/components/sections/ResultsByProgram.tsx`

- [ ] **Step 1: Create `src/components/sections/ResultsByProgram.tsx`**

```tsx
import { FadeUp } from "@/components/motion/FadeUp"
import type { CompanyStats } from "@/lib/sanity/types"

interface ResultsByProgramProps {
  stats: CompanyStats
}

interface ProgramRow {
  cert: string
  passRate: number
  avgWeeks: number
}

function buildRows(stats: CompanyStats): ProgramRow[] {
  return [
    { cert: "Security+", passRate: stats.passRateSecurityPlus, avgWeeks: stats.avgWeeksSecurityPlus },
    { cert: "CySA+",     passRate: stats.passRateCySAPlus,     avgWeeks: stats.avgWeeksCySAPlus },
    { cert: "CASP+",     passRate: stats.passRateCASPPlus,     avgWeeks: stats.avgWeeksCASPPlus },
  ]
}

export function ResultsByProgram({ stats }: ResultsByProgramProps) {
  const rows = buildRows(stats)

  return (
    <section
      aria-labelledby="results-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[56rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Results · By Program
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="results-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Pass rate, by certification.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-5 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
              Hero stats are top-line totals. Below is the breakdown CISOs quote in board decks.
            </p>
          </FadeUp>

          <ul className="mt-12">
            {rows.map((row, i) => (
              <FadeUp key={row.cert} delay={0.45 + i * 0.1}>
                <li className="grid grid-cols-[1fr_auto_auto] items-baseline gap-6 md:gap-12 py-6 border-b border-[var(--color-border)]">
                  <span
                    className="font-display font-medium text-[var(--color-text-primary)]"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {row.cert}
                  </span>
                  <span
                    className="font-display font-medium text-[var(--color-accent-light)] tabular-nums"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {row.passRate}%
                  </span>
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] tabular-nums">
                    {row.avgWeeks} wks avg
                  </span>
                </li>
              </FadeUp>
            ))}
          </ul>

          <FadeUp delay={0.85}>
            <p className="mt-8 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] leading-relaxed">
              Across {stats.professionalsCertified} professionals at {stats.enterpriseClients} clients  ·  {stats.auditsPassed} compliance audits passed  ·  0 failures
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ResultsByProgram.tsx
git commit -m "feat(pr5): ResultsByProgram (§6, per-cert stats from companyStats)"
```

---

## Task 8 — §7 Case Study Feature

Full-bleed dark navy with `.grain-overlay`. Renders a featured case study's pull-quote, buyer attribution, metadata row, and CTA link.

**Files:**
- Create: `src/components/sections/CaseStudyFeature.tsx`

- [ ] **Step 1: Create `src/components/sections/CaseStudyFeature.tsx`**

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface CaseStudyFeatureProps {
  caseStudy: CaseStudy
}

export function CaseStudyFeature({ caseStudy }: CaseStudyFeatureProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const certList = caseStudy.certificationsPassed.join(", ")

  return (
    <section
      aria-labelledby="case-study-headline"
      className="relative py-20 md:py-32 bg-[var(--color-surface)] grain-overlay overflow-hidden"
    >
      <div className="container-sentinel relative">
        <FadeUp>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Featured Case Study
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <blockquote
            id="case-study-headline"
            className="mt-8 max-w-[40rem] font-display font-medium tracking-[-0.01em] leading-[1.15] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            {caseStudy.buyerQuote}
          </blockquote>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="mt-10 flex items-center gap-4">
            <SanityAvatar
              image={caseStudy.buyerHeadshot}
              fullName={caseStudy.buyerName}
              size={56}
            />
            <div>
              <p className="font-body font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mt-1">
                {industry}
              </p>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.55}>
          <p className="mt-10 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] leading-relaxed">
            {caseStudy.complianceDriver}  ·  Team of {caseStudy.teamSize}  ·  {caseStudy.weeksToCertification} weeks  ·  {certList} passed
          </p>
        </FadeUp>

        <FadeUp delay={0.7}>
          <Link
            href={`/results/${caseStudy.slug}`}
            className="mt-10 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
            data-cta="case-study-feature"
          >
            Read the full case
            <span aria-hidden="true">→</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/CaseStudyFeature.tsx
git commit -m "feat(pr5): CaseStudyFeature (§7, featured case study from Sanity)"
```

---

## Task 9 — §8 Testimonials

Single column, generous vertical spacing, no card chrome. Renders 3 testimonials with portrait + attribution.

**Files:**
- Create: `src/components/sections/Testimonials.tsx`

- [ ] **Step 1: Create `src/components/sections/Testimonials.tsx`**

```tsx
import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { Testimonial } from "@/lib/sanity/types"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

function attributionLine(t: Testimonial): string {
  const company = t.industryAnonymized ?? t.company
  return `${t.title}, ${company}`
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null

  return (
    <section
      aria-labelledby="testimonials-headline"
      className="py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              What CISOs Say
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="testimonials-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Their words.
            </h2>
          </FadeUp>
        </div>

        <ul className="mt-16 space-y-20 max-w-[48rem]">
          {testimonials.map((t, i) => (
            <FadeUp key={t._id} delay={0.3 + i * 0.12}>
              <li>
                <p
                  className="font-display font-medium leading-[1.3] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.625rem)" }}
                >
                  {t.quote}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <SanityAvatar image={t.portrait} fullName={t.fullName} size={56} />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">
                      {t.fullName}
                    </p>
                    <p className="font-body text-[var(--color-text-secondary)] text-[0.9375rem]">
                      {attributionLine(t)}
                    </p>
                  </div>
                </div>
              </li>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Testimonials.tsx
git commit -m "feat(pr5): Testimonials (§8, 3 featured testimonials from Sanity)"
```

---

## Task 10 — §9 Industries Served

Six `.card-dark` in a responsive grid. Server component; accepts `industries: IndustryPage[]`.

**Files:**
- Create: `src/components/sections/IndustriesServed.tsx`

- [ ] **Step 1: Create `src/components/sections/IndustriesServed.tsx`**

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustriesServedProps {
  industries: IndustryPage[]
}

export function IndustriesServed({ industries }: IndustriesServedProps) {
  return (
    <section
      aria-labelledby="industries-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-14">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Industries Served
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              id="industries-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Six industries. One certification track per compliance mandate.
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, i) => (
            <FadeUp key={industry._id} delay={0.3 + i * 0.08} className="flex">
              <article className="card-dark flex flex-col gap-5 flex-1">
                <h3
                  className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                >
                  {industry.industryName}
                </h3>

                <p
                  className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {industry.complianceMandateFull}
                </p>

                <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] mt-auto pt-4 border-t border-[var(--color-border)]">
                  {industry.complianceMandate}
                </p>

                <Link
                  href={`/industries/${industry.slug}`}
                  className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                  data-cta="industry-card"
                  data-industry={industry.slug}
                >
                  Industry detail
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/IndustriesServed.tsx
git commit -m "feat(pr5): IndustriesServed (§9, six Sanity-driven industry cards)"
```

---

## Task 11 — Extend `fallbacks.ts`

Append four new fallback constants so the homepage renders coherently when Sanity returns empty. These ship with realistic but generic placeholder copy; the editorial team replaces them via Studio.

**Files:**
- Modify: `src/lib/sanity/fallbacks.ts` — append after the existing `FALLBACK_CLIENT_LOGOS` constant

- [ ] **Step 1: Append to `src/lib/sanity/fallbacks.ts`**

First, also extend the type imports at the top of the file. Read the file, then update the import block to include the additional types:

```ts
import type {
  CaseStudy,
  ClientLogo,
  CompanyStats,
  Faq,
  IndustryPage,
  PressMention,
  ProgramPage,
  Testimonial,
} from './types'
```

(`Faq` is added even though PR 5 doesn't render FAQs — it's a tiny addition that makes PR 7 cleaner; leave it imported but unused for now if your linter doesn't strip unused type imports. If it does, omit `Faq` and add it later.)

Then append the following four `export const` blocks to the end of the file:

```ts

export const FALLBACK_PROGRAMS: ProgramPage[] = [
  {
    _id: 'fallback-program-security-plus',
    slug: 'security-plus',
    certName: 'CompTIA Security+',
    eyebrow: 'Foundational security operations.',
    oneliner:
      'For security analysts and SOC engineers establishing baseline competency across threats, identity, cryptography, and risk management.',
    priceUSD: 3500,
    durationWeeks: 8,
    sessionsPerWeek: 3,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'sp-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'sp-1-s1',
            text: 'New security hires and IT staff transitioning into security operations.',
            marks: [],
          },
        ],
      },
    ],
    curriculumOutline: [],
    examObjectives: ['Threats & Vulnerabilities', 'Architecture & Design', 'Implementation', 'Operations & Incident Response'],
    homepageOrder: 0,
    seoTitle: 'CompTIA Security+ Certification Training | Sentinel Institute',
    seoDescription: 'Sentinel Institute’s Security+ training program — 8-week instructor-led path with documented first-attempt pass rate.',
  },
  {
    _id: 'fallback-program-cysa-plus',
    slug: 'cysa-plus',
    certName: 'CompTIA CySA+',
    eyebrow: 'Threat detection & incident response.',
    oneliner:
      'For senior analysts moving into detection engineering, threat hunting, and incident response leadership.',
    priceUSD: 4500,
    durationWeeks: 10,
    sessionsPerWeek: 3,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'cs-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'cs-1-s1',
            text: 'Analysts with Security+ ready to take on detection and response responsibilities.',
            marks: [],
          },
        ],
      },
    ],
    curriculumOutline: [],
    examObjectives: ['Threat Management', 'Vulnerability Management', 'Cyber Incident Response', 'Security Architecture'],
    homepageOrder: 1,
    seoTitle: 'CompTIA CySA+ Certification Training | Sentinel Institute',
    seoDescription: 'CySA+ training program — 10-week instructor-led path for senior security analysts.',
  },
  {
    _id: 'fallback-program-casp-plus',
    slug: 'casp-plus',
    certName: 'CompTIA CASP+',
    eyebrow: 'Enterprise security architecture.',
    oneliner:
      'For security architects and engineering leads owning enterprise-grade controls, risk strategy, and compliance posture.',
    priceUSD: 5500,
    durationWeeks: 12,
    sessionsPerWeek: 2,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'cp-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'cp-1-s1',
            text: 'Security architects, engineering managers, and lead engineers owning architecture-level decisions.',
            marks: [],
          },
        ],
      },
    ],
    curriculumOutline: [],
    examObjectives: ['Security Architecture', 'Security Operations', 'Security Engineering & Cryptography', 'Governance, Risk & Compliance'],
    homepageOrder: 2,
    seoTitle: 'CompTIA CASP+ Certification Training | Sentinel Institute',
    seoDescription: 'CASP+ training program — 12-week instructor-led path for senior security architects and engineering leads.',
  },
]

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    _id: 'fallback-testimonial-1',
    fullName: 'L. Marquez',
    title: 'VP of Information Security',
    company: 'Regional Bank, Midwest',
    industry: 'Financial Services',
    quote:
      'Our SOC team needed Security+ certified by audit. Sentinel ran the cohort, documented the pass rate, and gave us the artifact PCI examiners asked for.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 0,
  },
  {
    _id: 'fallback-testimonial-2',
    fullName: 'P. Okonkwo',
    title: 'Chief Information Security Officer',
    company: 'Health System, Northeast',
    industry: 'Healthcare',
    quote:
      'HIPAA Security Rule requires named, qualified staff. Sentinel certified 18 of our analysts in a single quarter — first attempt — with no remediation cohort needed.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 1,
  },
  {
    _id: 'fallback-testimonial-3',
    fullName: 'J. Chen',
    title: 'Director of Security Engineering',
    company: 'Defense Contractor, Mid-Atlantic',
    industry: 'Defense',
    quote:
      'CMMC Level 2 readiness was the goal; Sentinel delivered the training plan, the cohort, and the documented outcomes. The audit was uneventful — which is what we wanted.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 2,
  },
]

export const FALLBACK_CASE_STUDY: CaseStudy = {
  _id: 'fallback-case-study-1',
  slug: 'healthcare-hipaa-security-plus',
  clientIndustry: 'Healthcare',
  clientIndustryAnonymized: 'Health System, Northeast',
  complianceDriver: 'HIPAA',
  teamSize: 18,
  weeksToCertification: 9,
  certificationsPassed: ['Security+', 'CySA+'],
  buyerName: 'P. Okonkwo',
  buyerTitle: 'Chief Information Security Officer',
  buyerHeadshot: { url: '', alt: '' },
  buyerQuote:
    'Sentinel gave us a documented pass rate the auditors accepted on the first review. That was the entire point.',
  challenge: [],
  solution: [],
  outcome: [],
  outcomeMetrics: [
    { label: 'First-attempt pass rate', value: '94%' },
    { label: 'Audit findings related to staff cert', value: '0' },
    { label: 'Weeks from kickoff to passed exam', value: '9' },
  ],
  publishedDate: '2026-04-01T00:00:00.000Z',
  featured: true,
}

export const FALLBACK_INDUSTRIES: IndustryPage[] = [
  {
    _id: 'fallback-industry-healthcare',
    slug: 'healthcare',
    industryName: 'Healthcare',
    complianceMandate: 'HIPAA Security Rule § 164.308',
    complianceMandateFull:
      'HIPAA Security Rule § 164.308 requires covered entities to designate, train, and maintain workforce members in security awareness and incident response procedures appropriate to their role.',
    trainingContext: [],
    homepageOrder: 0,
    seoTitle: 'HIPAA Security Training for Healthcare Teams | Sentinel Institute',
    seoDescription: 'CompTIA Security+, CySA+, and CASP+ training tailored to HIPAA Security Rule § 164.308 workforce requirements.',
  },
  {
    _id: 'fallback-industry-financial-services',
    slug: 'financial-services',
    industryName: 'Financial Services',
    complianceMandate: 'PCI-DSS v4.0 §§ 12.6 and 12.10',
    complianceMandateFull:
      'PCI-DSS v4.0 §§ 12.6 and 12.10 require formal security awareness, named incident response personnel, and documented training for all staff with cardholder-data access.',
    trainingContext: [],
    homepageOrder: 1,
    seoTitle: 'PCI-DSS Security Training for Banks & Payments | Sentinel Institute',
    seoDescription: 'Certification training that satisfies PCI-DSS v4.0 § 12.6 and 12.10 awareness and incident-response mandates.',
  },
  {
    _id: 'fallback-industry-defense',
    slug: 'defense',
    industryName: 'Defense Contractors',
    complianceMandate: 'CMMC Level 2 / NIST SP 800-171',
    complianceMandateFull:
      'CMMC Level 2 and NIST SP 800-171 require contractors handling Controlled Unclassified Information to certify named, qualified security personnel across detection, response, and risk-management functions.',
    trainingContext: [],
    homepageOrder: 2,
    seoTitle: 'CMMC Level 2 Training for Defense Contractors | Sentinel Institute',
    seoDescription: 'Certification cohorts mapped to CMMC Level 2 / NIST SP 800-171 personnel requirements.',
  },
  {
    _id: 'fallback-industry-utilities',
    slug: 'utilities',
    industryName: 'Utilities',
    complianceMandate: 'NERC CIP-004 Personnel Training',
    complianceMandateFull:
      'NERC CIP-004 mandates that bulk electric system operators implement role-based cyber-security training, with documented evidence per employee, for all personnel with electronic access to critical assets.',
    trainingContext: [],
    homepageOrder: 3,
    seoTitle: 'NERC CIP-004 Cybersecurity Training | Sentinel Institute',
    seoDescription: 'Role-based certification training that satisfies NERC CIP-004 personnel-training requirements for utilities.',
  },
  {
    _id: 'fallback-industry-insurance',
    slug: 'insurance',
    industryName: 'Insurance',
    complianceMandate: 'NAIC Data Security Model Law §§ 4 and 6',
    complianceMandateFull:
      'The NAIC Insurance Data Security Model Law §§ 4 and 6 require licensees to maintain a written information security program with designated, qualified security personnel and ongoing training programs.',
    trainingContext: [],
    homepageOrder: 4,
    seoTitle: 'NAIC Data Security Training for Insurers | Sentinel Institute',
    seoDescription: 'Certification programs that satisfy NAIC Insurance Data Security Model Law training and personnel mandates.',
  },
  {
    _id: 'fallback-industry-legal',
    slug: 'legal',
    industryName: 'Legal',
    complianceMandate: 'ABA Model Rule 1.6(c)',
    complianceMandateFull:
      'ABA Model Rule 1.6(c) requires lawyers to make reasonable efforts to prevent unauthorized disclosure of client information, including by training non-lawyer staff who handle client data.',
    trainingContext: [],
    homepageOrder: 5,
    seoTitle: 'Security Training for Law Firms | Sentinel Institute',
    seoDescription: 'Cybersecurity certification training calibrated to ABA Model Rule 1.6(c) confidentiality obligations.',
  },
]
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors. If `Faq` is reported as unused, remove it from the import block (the lint config currently doesn't strip unused type imports, so this is unlikely).

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/fallbacks.ts
git commit -m "feat(pr5): extend fallbacks with programs, testimonials, case study, industries"
```

---

## Task 12 — Wire `(marketing)/page.tsx` to compose all 6 new sections

Imports the new sections, derives the 4 props bundles (programs with `whoNeedsItSummary`, testimonials, featured case study, industries), and renders them in the canonical homepage order: Hero → TrustBar → ProblemSection → ProgramsOverview → SentinelSystem → ResultsByProgram → CaseStudyFeature → Testimonials → IndustriesServed.

The spec §11.1 lists PR 5 sections as 3, 4, 6, 7, 8, 9 — sandwiched around the existing §5 (SentinelSystem) from PR 3. The composition order matters for the visual flow.

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (replace entire body)

- [ ] **Step 1: Replace `src/app/(marketing)/page.tsx`**

```tsx
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { ProblemSection } from "@/components/sections/ProblemSection"
import { ProgramsOverview } from "@/components/sections/ProgramsOverview"
import { SentinelSystem } from "@/components/sections/SentinelSystem"
import { ResultsByProgram } from "@/components/sections/ResultsByProgram"
import { CaseStudyFeature } from "@/components/sections/CaseStudyFeature"
import { Testimonials } from "@/components/sections/Testimonials"
import { IndustriesServed } from "@/components/sections/IndustriesServed"
import { fetchHomepageData } from "@/lib/sanity/queries"
import { portableTextToPlain } from "@/lib/sanity/portable-text"
import {
  FALLBACK_CASE_STUDY,
  FALLBACK_CLIENT_LOGOS,
  FALLBACK_COMPANY_STATS,
  FALLBACK_HERO_PRESS,
  FALLBACK_INDUSTRIES,
  FALLBACK_PROGRAMS,
  FALLBACK_TESTIMONIALS,
} from "@/lib/sanity/fallbacks"

export const metadata: Metadata = {
  title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.",
}

/** ISR — page rebuilds in background every hour, or immediately when /api/revalidate fires. */
export const revalidate = 3600

export default async function HomePage() {
  const data = await fetchHomepageData()

  const stats = data.companyStats ?? FALLBACK_COMPANY_STATS

  const heroPress = data.heroPress.length > 0 ? data.heroPress : FALLBACK_HERO_PRESS
  const pressOutlets = heroPress.map((p) => p.outletName)

  const clientLogos = data.clientLogos.length > 0 ? data.clientLogos : FALLBACK_CLIENT_LOGOS
  const clientLabels = clientLogos.map((c) => c.anonymizedAs ?? c.companyName)

  const rawPrograms = data.allPrograms.length > 0 ? data.allPrograms : FALLBACK_PROGRAMS
  const programs = rawPrograms.map((p) => ({
    slug: p.slug,
    certName: p.certName,
    eyebrow: p.eyebrow,
    oneliner: p.oneliner,
    priceUSD: p.priceUSD,
    durationWeeks: p.durationWeeks,
    sessionsPerWeek: p.sessionsPerWeek,
    whoNeedsItSummary: portableTextToPlain(p.whoNeedsIt),
  }))

  const testimonials = data.homepageTestimonials.length > 0
    ? data.homepageTestimonials
    : FALLBACK_TESTIMONIALS

  const caseStudy = data.featuredCaseStudy ?? FALLBACK_CASE_STUDY

  const industries = data.homepageIndustries.length > 0
    ? data.homepageIndustries
    : FALLBACK_INDUSTRIES

  return (
    <>
      <Hero stats={stats} pressOutlets={pressOutlets} />
      <TrustBar
        enterpriseClients={stats.enterpriseClients}
        clientLabels={clientLabels}
      />
      <ProblemSection />
      <ProgramsOverview programs={programs} />
      <SentinelSystem />
      <ResultsByProgram stats={stats} />
      <CaseStudyFeature caseStudy={caseStudy} />
      <Testimonials testimonials={testimonials} />
      <IndustriesServed industries={industries} />
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Verify build**

Run: `pnpm build`

Expected: clean exit. The build runs in NODE_ENV=production, so the dev-time Sanity guard is silent. With env empty, Sanity fetches fail, `safeFetch` catches, and the page renders entirely from fallbacks — including the six new sections. The route table should still list `/`, `/studio/[[...tool]]`, `/api/revalidate`.

If the build fails, capture the full error output. The most likely failure mode is a `<Image>` requesting `cdn.sanity.io` without Task 1's `remotePatterns` config landing — verify Task 1 is committed.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(marketing\)/page.tsx
git commit -m "feat(pr5): compose 9-section homepage with Sanity + fallbacks"
```

---

## Task 13 — Final verification + tag

Confirms PR 5 is green end-to-end and ready to tag.

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`

Expected: zero errors. Warnings acceptable if minor.

- [ ] **Step 3: Build**

Run: `pnpm build`

Expected: clean exit (status 0). Routes `/`, `/studio/[[...tool]]`, `/api/revalidate` present. No fatal errors.

- [ ] **Step 4: (Optional, requires populated env) Dev smoke**

Skip this step if `.env.local` doesn't have a real `NEXT_PUBLIC_SANITY_PROJECT_ID`. Otherwise:

Run: `pnpm dev`

Then open http://localhost:3000 and confirm visually:
- Hero (PR 2) renders.
- TrustBar (PR 2) renders with client labels.
- **NEW:** ProblemSection — eyebrow `What Buyers Tell Us`, headline `Three problems show up on every discovery call.`, three numbered statements, closing quote.
- **NEW:** ProgramsOverview — eyebrow `Programs`, three `.card-dark` columns. With no seeded Sanity, fallback programs render (CompTIA Security+ / CySA+ / CASP+ with placeholder copy).
- SentinelSystem (PR 3) renders.
- **NEW:** ResultsByProgram — three data rows with pass rates + avg weeks; footer caption.
- **NEW:** CaseStudyFeature — full-bleed dark panel with quote, attribution, metadata, CTA.
- **NEW:** Testimonials — three quotes with initials avatars (fallback portraits have empty URLs).
- **NEW:** IndustriesServed — 3×2 grid of six industry cards on desktop.

Kill the dev server.

- [ ] **Step 5: Tag PR 5 locally**

```bash
git tag pr-5-sections
```

Do not push.

- [ ] **Step 6: Brief**

State to the user, in one or two sentences:
- PR 5 complete: six new sections wired (Problem hardcoded; Programs, Results, Case Study, Testimonials, Industries from Sanity). Local tag `pr-5-sections` set.
- Next actions: same env / studio prereqs as PR 4 if not done yet; otherwise PR 6 (proposal flow) is next.

---

## Self-Review (Spec Coverage)

| Spec §11.1 PR 5 bullet | Covered by | Status |
|---|---|---|
| `ProblemSection.tsx` (hardcoded copy) | Task 5 | ✅ |
| `ProgramsOverview.tsx` (Sanity) | Tasks 2 + 3 + 6 + 12 | ✅ |
| `ResultsByProgram.tsx` (Sanity `companyStats`) | Task 7 | ✅ |
| `CaseStudyFeature.tsx` (Sanity featured) | Task 8 (+ Task 4 for avatar) | ✅ |
| `Testimonials.tsx` (Sanity) | Task 9 (+ Task 4 for avatar) | ✅ |
| `IndustriesServed.tsx` (Sanity) | Task 10 | ✅ |

| Spec §3–§9 content requirement | Task | Status |
|---|---|---|
| §3 eyebrow + headline + 3 problems + closing line | Task 5 | ✅ |
| §4 3-col grid · .card-dark · eyebrow `Programs` · headline `Three certifications. One methodology.` · price · cert name · oneliner · who needs · meta · `/programs/{slug}` link | Tasks 6 + 12 | ✅ |
| §6 single col · eyebrow `Results · By Program` · headline `Pass rate, by certification.` · 3 hairline rows · footer caption with totals | Task 7 | ✅ |
| §7 full-bleed dark · grain-overlay · eyebrow `Featured Case Study` · buyerQuote pull-quote · headshot + attribution · meta row · `/results/{slug}` link | Tasks 4 + 8 | ✅ |
| §8 single col · eyebrow `What CISOs Say` · headline `Their words.` · 3 testimonials · 56px portrait · name + title/company | Tasks 4 + 9 | ✅ |
| §9 3×2 grid · 6 `.card-dark` · eyebrow `Industries Served` · headline · industryName + 2-line desc + complianceMandate + `/industries/{slug}` link | Task 10 | ✅ |
| §11.1 PR 5: composition into `(marketing)/page.tsx` | Task 12 | ✅ |

| Resilience (spec §7) | Covered by | Status |
|---|---|---|
| Sanity returns null/empty → fall back to constants | Task 11 fallbacks + Task 12 null-coalesce + length-guards | ✅ |
| Image asset fallback (empty url) → no broken `<img>` | Task 4 SanityAvatar (initials when url empty) | ✅ |

| Performance (spec §9) | Notes |
|---|---|
| `next/image` for portraits + buyerHeadshot | ✅ via SanityAvatar (Task 4) when url present |
| `cdn.sanity.io` whitelisted | ✅ Task 1 |
| Server components everywhere (no `"use client"`) | ✅ all 6 sections are server |
| Lazy motion via existing `<FadeUp>` (already SSR-safe) | ✅ |

**Placeholder scan:** Grepped this plan for `TBD`, `TODO`, `fill in`, `implement later`, `add appropriate`, `similar to Task`, `etc.` — no hits in instruction text. Every code block contains the actual final code; every command shows the exact invocation; every commit message is the verbatim string.

**Type consistency:**
- `ProgramCardData` (Task 3) — uses `ProgramSlug` (defined in PR 4 types.ts) and matches the prop signature in `ProgramsOverview.tsx` (Task 6).
- `SanityAvatar` (Task 4) accepts `SanityImage` — matches the existing type from PR 4 types.ts.
- `(marketing)/page.tsx` (Task 12) — the `programs` mapping returns objects with all 8 ProgramCardData fields; passing to `<ProgramsOverview programs={programs} />` typechecks.
- `featuredCaseStudy ?? FALLBACK_CASE_STUDY` (Task 12) — both sides of `??` are typed `CaseStudy`, no nullable leakage.
- Fallback testimonials use `portrait: { url: '', alt: '' }` matching the `SanityImage` shape required by `Testimonial.portrait`.
- Fallback case study uses `buyerHeadshot: { url: '', alt: '' }` matching `CaseStudy.buyerHeadshot`.
- All section-component imports use `import type { … } from "@/lib/sanity/types"` for type-only imports — no runtime cost.
