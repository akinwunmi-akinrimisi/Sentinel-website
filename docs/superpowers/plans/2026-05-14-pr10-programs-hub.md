# PR 10 — Programs Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/programs` index + 3 detail pages (`/programs/security-plus`, `/programs/cysa-plus`, `/programs/casp-plus`) on top of the existing `programPage` Sanity schema (extended with 3 new fields).

**Architecture:** Pull the existing program-card grid out of `ProgramsOverview` into a reusable `ProgramGrid` (DRY for /programs index). Build 4 new program-specific components in `src/components/programs/`. The detail page composes 9 sections from Sanity data (or fallbacks) with PortableText + JSON-LD `Course` schema. The index page reuses ProgramGrid.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 · Sanity v5 + next-sanity v12 · @portabletext/react via `next-sanity` re-export.

**Spec reference:** `docs/superpowers/specs/2026-05-14-pr10-programs-hub-design.md`
**Editorial content reference:** `docs/superpowers/seed/pr10-fallbacks-content.md` (all `outcomes`, `sampleLesson`, `comparisonSelfStudy`, and `curriculumOutline` content for the 3 programs)

---

## File Inventory

**Create:**
- `src/components/sections/ProgramGrid.tsx` — extracted card grid (server component)
- `src/components/programs/ProgramProse.tsx` — shared PortableText components config
- `src/components/programs/ProgramHero.tsx` — Variant A hero
- `src/components/programs/SentinelVsSelfStudy.tsx` — comparison table
- `src/components/programs/RelatedPrograms.tsx` — bottom band
- `src/app/(marketing)/programs/page.tsx` — index
- `src/app/(marketing)/programs/[slug]/page.tsx` — dynamic detail with generateStaticParams + JSON-LD

**Modify:**
- `sanity/schemas/programPage.ts` — append 3 fields + inline comparisonRow object type
- `src/lib/sanity/types.ts` — add ComparisonRow + extend ProgramPage
- `src/lib/sanity/fallbacks.ts` — extend 3 programs with new content + fill curriculumOutline
- `src/lib/sanity/queries.ts` — add PROGRAM_DETAIL_FIELDS + 2 fetcher helpers
- `src/components/sections/ProgramsOverview.tsx` — delegate inner grid to ProgramGrid
- `src/app/sitemap.ts` — add 4 URLs

---

## Task 1: Add 3 new fields to `programPage` Sanity schema

**Files:**
- Modify: `sanity/schemas/programPage.ts` — append new defineField blocks after `seoDescription`

- [ ] **Step 1: Edit programPage.ts**

Open `sanity/schemas/programPage.ts`. After the existing `seoDescription` defineField block (around line 92-98) and before the closing `]` of the `fields` array, insert these 3 new field blocks:

```ts
    defineField({
      name: 'outcomes',
      type: 'array',
      title: 'Outcomes after completion',
      description: '3–10 capability statements rendered under "After completion, your team can…"',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(3).max(10).unique(),
    }),
    defineField({
      name: 'sampleLesson',
      type: 'blockContent',
      title: 'Sample lesson preview',
      description: 'Editorial excerpt from a real lesson. Show prospects what live instruction feels like.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'comparisonSelfStudy',
      type: 'array',
      title: 'Sentinel vs Self-study comparison',
      description: '3–8 rows comparing Sentinel methodology to CompTIA self-study / Pearson VUE prep.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'comparisonRow',
          fields: [
            defineField({
              name: 'category',
              type: 'string',
              validation: (Rule) => Rule.required().max(50),
            }),
            defineField({
              name: 'sentinel',
              type: 'string',
              validation: (Rule) => Rule.required().max(200),
            }),
            defineField({
              name: 'selfStudy',
              type: 'string',
              validation: (Rule) => Rule.required().max(200),
            }),
          ],
          preview: {
            select: { title: 'category', subtitle: 'sentinel' },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(3).max(8),
    }),
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit. Sanity v5 types should accept the new field definitions without complaint.

- [ ] **Step 3: Commit**

```bash
git add sanity/schemas/programPage.ts
git commit -m "feat(pr10): add outcomes + sampleLesson + comparisonSelfStudy to programPage schema"
```

---

## Task 2: Extend TypeScript types

**Files:**
- Modify: `src/lib/sanity/types.ts` — add `ComparisonRow` interface, extend `ProgramPage`

- [ ] **Step 1: Add ComparisonRow type**

Open `src/lib/sanity/types.ts`. After the `ProgramSlug` type definition (around line 80) and before the `ProgramPage` interface (line 82), insert:

```ts
export interface ComparisonRow {
  category: string
  sentinel: string
  selfStudy: string
}
```

- [ ] **Step 2: Extend ProgramPage interface**

Still in `src/lib/sanity/types.ts`, find the `ProgramPage` interface (currently ends at the closing `}` around line 97):

```ts
export interface ProgramPage {
  _id: string
  slug: ProgramSlug
  certName: string
  eyebrow: string
  oneliner: string
  priceUSD: number
  durationWeeks: number
  sessionsPerWeek: number
  whoNeedsIt: PortableTextBlock[]
  curriculumOutline: PortableTextBlock[]
  examObjectives: string[]
  homepageOrder: number
  seoTitle: string
  seoDescription: string
}
```

Add 3 new fields before the closing `}` of `ProgramPage`:

```ts
  outcomes: string[]
  sampleLesson: PortableTextBlock[]
  comparisonSelfStudy: ComparisonRow[]
```

The full ProgramPage interface after this change:

```ts
export interface ProgramPage {
  _id: string
  slug: ProgramSlug
  certName: string
  eyebrow: string
  oneliner: string
  priceUSD: number
  durationWeeks: number
  sessionsPerWeek: number
  whoNeedsIt: PortableTextBlock[]
  curriculumOutline: PortableTextBlock[]
  examObjectives: string[]
  outcomes: string[]
  sampleLesson: PortableTextBlock[]
  comparisonSelfStudy: ComparisonRow[]
  homepageOrder: number
  seoTitle: string
  seoDescription: string
}
```

- [ ] **Step 3: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: this WILL fail. The existing `FALLBACK_PROGRAMS` in `src/lib/sanity/fallbacks.ts` is typed as `ProgramPage[]` and doesn't yet have the 3 new required fields. TypeScript will report 3 errors per program (9 total). Task 3 fills these.

This intentional failure is the signal that Task 3 is needed. Do NOT commit yet. Proceed straight to Task 3.

---

## Task 3: Extend fallback content for all 3 programs

**Files:**
- Modify: `src/lib/sanity/fallbacks.ts` — extend each of 3 program entries with `outcomes`, `sampleLesson`, `comparisonSelfStudy`, and fill the previously empty `curriculumOutline`
- Reference: `docs/superpowers/seed/pr10-fallbacks-content.md` (contains the exact code blocks to paste)

- [ ] **Step 1: Add shared SENTINEL_VS_SELF_STUDY constant**

The `comparisonSelfStudy` array is identical across all 3 programs (Sentinel methodology is uniform). Define it once. Open `src/lib/sanity/fallbacks.ts`, find the imports at the top, then near the existing imports add the import for the new type:

```ts
import type { ComparisonRow, IndustryPage, ProgramPage, ... } from './types'
```

(Add `ComparisonRow` to whatever import line already pulls from `./types`.)

Then immediately before the `FALLBACK_PROGRAMS` const declaration (around line 82), insert the shared constant. **Copy the exact code block from `docs/superpowers/seed/pr10-fallbacks-content.md` under the heading "Common values · `comparisonSelfStudy` rows"**, but rename `const SENTINEL_VS_SELF_STUDY` so it's not exported (project pattern keeps internal constants module-local):

```ts
const SENTINEL_VS_SELF_STUDY: ComparisonRow[] = [
  { category: 'Schedule', sentinel: 'Live instructor-led cohort, 2–3 sessions per week, fixed start dates', selfStudy: 'Self-paced — completion timing on the learner, no fixed milestones' },
  { category: 'Live instruction', sentinel: 'Working sessions on real declassified breach scenarios with senior instructors', selfStudy: 'Video recordings and PDF study guides only — no live interaction' },
  { category: 'Practice incidents', sentinel: '12 end-to-end incident scenarios worked in pairs across the cohort', selfStudy: 'Multiple-choice exam prep questions only — no scenario work' },
  { category: 'Pass guarantee', sentinel: 'No-pass, re-train at no cost — built into every enterprise contract', selfStudy: 'None — re-take fees are the learner’s responsibility' },
  { category: 'Compliance documentation', sentinel: 'Audit-ready training records + certificate package signed by Sentinel', selfStudy: 'Pearson VUE certificate copy only — no training audit trail' },
  { category: 'Cohort cap', sentinel: '12 learners maximum per cohort — instructor knows every team', selfStudy: 'N/A — individual study, no cohort' },
]
```

- [ ] **Step 2: Extend the Security+ program object**

Find the Security+ object in `FALLBACK_PROGRAMS` (slug `'security-plus'`, currently lines 82–114). Replace its current `curriculumOutline: [],` empty array with the full PortableText curriculum from `docs/superpowers/seed/pr10-fallbacks-content.md § Security+ § curriculumOutline`. Then immediately before `homepageOrder: 0,` insert the three new fields. Final shape of the Security+ object:

```ts
{
  _id: 'fallback-program-security-plus',
  slug: 'security-plus',
  certName: 'CompTIA Security+',
  eyebrow: 'Foundational security operations.',
  oneliner: 'For security analysts and SOC engineers establishing baseline competency across threats, identity, cryptography, and risk management.',
  priceUSD: 3500,
  durationWeeks: 8,
  sessionsPerWeek: 3,
  whoNeedsIt: [
    /* existing 1-block array — leave unchanged */
  ],
  curriculumOutline: [
    /* PASTE: docs/superpowers/seed/pr10-fallbacks-content.md § Security+ § curriculumOutline (6 blocks) */
  ],
  examObjectives: ['Threats & Vulnerabilities', 'Architecture & Design', 'Implementation', 'Operations & Incident Response'],
  outcomes: [
    /* PASTE: docs/superpowers/seed/pr10-fallbacks-content.md § Security+ § outcomes (5 strings) */
  ],
  sampleLesson: [
    /* PASTE: docs/superpowers/seed/pr10-fallbacks-content.md § Security+ § sampleLesson (3 blocks) */
  ],
  comparisonSelfStudy: SENTINEL_VS_SELF_STUDY,
  homepageOrder: 0,
  seoTitle: 'CompTIA Security+ Certification Training | Sentinel Institute',
  seoDescription: 'Sentinel Institute’s Security+ training program — 8-week instructor-led path with documented first-attempt pass rate.',
},
```

- [ ] **Step 3: Extend the CySA+ program object**

Same pattern. Slug `'cysa-plus'`. Use the content blocks from `docs/superpowers/seed/pr10-fallbacks-content.md § CySA+`. Curriculum blocks have `_key` prefix `cs-c-*`. Sample lesson blocks `cs-l-*`. Comparison uses `SENTINEL_VS_SELF_STUDY`.

- [ ] **Step 4: Extend the CASP+ program object**

Same pattern. Slug `'casp-plus'`. Content from `docs/superpowers/seed/pr10-fallbacks-content.md § CASP+`. Key prefix `cp-*`.

- [ ] **Step 5: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: now CLEAN. All 3 ProgramPage objects in FALLBACK_PROGRAMS satisfy the extended interface.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sanity/types.ts src/lib/sanity/fallbacks.ts
git commit -m "feat(pr10): extend ProgramPage type + seed editorial fallback content for 3 programs"
```

Note: this commit bundles Task 2's type changes with Task 3's fallback fills because they're a single TypeScript-consistent unit — committing Task 2 alone would have left tsc failing.

---

## Task 4: Add Sanity query helpers

**Files:**
- Modify: `src/lib/sanity/queries.ts` — add `PROGRAM_DETAIL_FIELDS` constant + `fetchAllPrograms` + `fetchProgramBySlug` helpers

- [ ] **Step 1: Add the detail-fields projection constant**

Open `src/lib/sanity/queries.ts`. After the existing `allProgramsQuery` declaration (around line 58) and before `homepageIndustriesQuery`, insert:

```ts
const PROGRAM_DETAIL_FIELDS = `
  _id, "slug": slug.current, certName, eyebrow, oneliner,
  priceUSD, durationWeeks, sessionsPerWeek,
  whoNeedsIt, curriculumOutline, examObjectives,
  outcomes, sampleLesson, comparisonSelfStudy,
  homepageOrder, seoTitle, seoDescription
`

export const allProgramDetailsQuery = groq`
  *[_type == "programPage"] | order(homepageOrder asc){ ${PROGRAM_DETAIL_FIELDS} }
`

export const programBySlugQuery = groq`
  *[_type == "programPage" && slug.current == $slug][0]{ ${PROGRAM_DETAIL_FIELDS} }
`
```

Note: `PROGRAM_DETAIL_FIELDS` is not exported because it's a template fragment, not a query.

- [ ] **Step 2: Add the fetcher helpers**

Still in `src/lib/sanity/queries.ts`. At the bottom of the file, after the `fetchHomepageData` function, add:

```ts
import { FALLBACK_PROGRAMS } from './fallbacks'

/**
 * Returns all 3 programs with full detail fields. Used by the /programs index
 * page and by RelatedPrograms on detail pages. Falls back to seed constants if
 * Sanity is unreachable or empty.
 */
export async function fetchAllPrograms(): Promise<ProgramPage[]> {
  return safeFetch<ProgramPage[]>(allProgramDetailsQuery, FALLBACK_PROGRAMS)
}

/**
 * Returns a single program by slug, or null if the slug is unknown.
 * Tries Sanity first, then falls back to the matching seed constant.
 */
export async function fetchProgramBySlug(slug: string): Promise<ProgramPage | null> {
  try {
    const data = await sanityClient.fetch<ProgramPage | null>(
      programBySlugQuery,
      { slug },
      { next: { tags: ['programPage', `programPage:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchProgramBySlug failed:', slug, error)
    }
  }
  return FALLBACK_PROGRAMS.find((p) => p.slug === slug) ?? null
}
```

- [ ] **Step 3: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit. The `FALLBACK_PROGRAMS` import at the bottom of the file should resolve since `fallbacks.ts` doesn't import from `queries.ts` (no circular dep).

- [ ] **Step 4: Commit**

```bash
git add src/lib/sanity/queries.ts
git commit -m "feat(pr10): add fetchAllPrograms + fetchProgramBySlug with fallback resilience"
```

---

## Task 5: Extract ProgramGrid component, refactor ProgramsOverview

**Files:**
- Create: `src/components/sections/ProgramGrid.tsx`
- Modify: `src/components/sections/ProgramsOverview.tsx` — delegate inner grid to ProgramGrid

- [ ] **Step 1: Create ProgramGrid.tsx**

Create `src/components/sections/ProgramGrid.tsx` with the inner card grid currently inside ProgramsOverview. Server component, no hooks. Full content:

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramGridProps {
  programs: ProgramCardData[]
  /** Delay (seconds) added to each card's FadeUp animation. Default 0.3 to match the original ProgramsOverview offset. */
  baseDelay?: number
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramGrid({ programs, baseDelay = 0.3 }: ProgramGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((program, i) => (
        <FadeUp key={program.slug} delay={baseDelay + i * 0.1} className="flex">
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
  )
}
```

- [ ] **Step 2: Refactor ProgramsOverview.tsx to use ProgramGrid**

Open `src/components/sections/ProgramsOverview.tsx`. Replace the entire inner card-grid `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>` block with `<ProgramGrid programs={programs} />`. Add the import at the top. Remove the now-unused `priceFormatter` constant and `Link` import (they moved to ProgramGrid).

Final content of `src/components/sections/ProgramsOverview.tsx`:

```tsx
import { FadeUp } from "@/components/motion/FadeUp"
import { ProgramGrid } from "@/components/sections/ProgramGrid"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramsOverviewProps {
  programs: ProgramCardData[]
}

export function ProgramsOverview({ programs }: ProgramsOverviewProps) {
  return (
    <section
      id="programs"
      aria-labelledby="programs-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface)]"
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

        <ProgramGrid programs={programs} />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: TypeScript check + build**

Run: `pnpm tsc --noEmit`
Expected: clean.

Run: `pnpm build`
Expected: clean — same 9 routes, homepage still builds.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ProgramGrid.tsx src/components/sections/ProgramsOverview.tsx
git commit -m "refactor(pr10): extract ProgramGrid for reuse on /programs index"
```

---

## Task 6: Create ProgramProse PortableText config

**Files:**
- Create: `src/components/programs/ProgramProse.tsx`

- [ ] **Step 1: Create the file**

This file exports a `portableTextComponents` config used by the detail page for rendering `whoNeedsIt`, `curriculumOutline`, and `sampleLesson` block content. Patterns the FAQPreview map but with looser spacing for body content.

Create `src/components/programs/ProgramProse.tsx`:

```tsx
import type { PortableTextComponents } from "next-sanity"
import Link from "next/link"

export const programProseComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[var(--color-text-secondary)] leading-relaxed mt-4 first:mt-0">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 first:mt-0 font-display text-[1.375rem] font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 first:mt-0 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-[var(--color-accent-light)] pl-5 italic text-[var(--color-text-secondary)]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 space-y-2 text-[var(--color-text-secondary)] leading-relaxed list-disc pl-6 marker:text-[var(--color-accent-light)]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 space-y-2 text-[var(--color-text-secondary)] leading-relaxed list-decimal pl-6 marker:text-[var(--color-accent-light)] marker:font-mono">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-[var(--color-text-primary)]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href ?? "#"
      const external = /^https?:\/\//.test(href)
      return external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-light)] hover-underline">
          {children}
        </a>
      ) : (
        <Link href={href} className="text-[var(--color-accent-light)] hover-underline">
          {children}
        </Link>
      )
    },
  },
}
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean. The `next-sanity` package re-exports `PortableTextComponents` from `@portabletext/react`.

- [ ] **Step 3: Commit**

```bash
git add src/components/programs/ProgramProse.tsx
git commit -m "feat(pr10): ProgramProse PortableText components for detail-page body rendering"
```

---

## Task 7: Create ProgramHero component

**Files:**
- Create: `src/components/programs/ProgramHero.tsx`

- [ ] **Step 1: Create the file**

This is Variant A (editorial single column) hero per the spec mockup. Takes `program: ProgramPage` and a derived `sequenceLabel` (`"Program 01 / 03"`).

Create `src/components/programs/ProgramHero.tsx`:

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { ProgramPage } from "@/lib/sanity/types"

interface ProgramHeroProps {
  program: ProgramPage
  /** "Program 01 / 03" — derived from homepageOrder + total count by caller. */
  sequenceLabel: string
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramHero({ program, sequenceLabel }: ProgramHeroProps) {
  return (
    <section
      aria-labelledby="program-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {program.certName} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="program-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {program.eyebrow}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {program.oneliner}
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Investment
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {priceFormatter.format(program.priceUSD)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Duration
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {program.durationWeeks} weeks
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Cadence
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {program.sessionsPerWeek}× per week
                </dd>
              </div>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="btn-primary"
                data-cta="program-detail-primary"
                data-program={program.slug}
              >
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="program-detail-secondary" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean. Verify `BookingButton` accepts a `ctaId` prop (existing pattern from ProposalCTA).

- [ ] **Step 3: Commit**

```bash
git add src/components/programs/ProgramHero.tsx
git commit -m "feat(pr10): ProgramHero — Variant A editorial single-column hero"
```

---

## Task 8: Create SentinelVsSelfStudy comparison table

**Files:**
- Create: `src/components/programs/SentinelVsSelfStudy.tsx`

- [ ] **Step 1: Create the file**

Renders a 3-column table on desktop, stacked cards on mobile. Server component.

Create `src/components/programs/SentinelVsSelfStudy.tsx`:

```tsx
import type { ComparisonRow } from "@/lib/sanity/types"

interface SentinelVsSelfStudyProps {
  rows: ComparisonRow[]
}

export function SentinelVsSelfStudy({ rows }: SentinelVsSelfStudyProps) {
  return (
    <section
      aria-labelledby="comparison-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Sentinel vs Self-study
          </p>
          <h2
            id="comparison-headline"
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.1] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)" }}
          >
            What changes when you bring in a cohort.
          </h2>
        </div>

        {/* Desktop: 3-column table */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-4 pr-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-medium w-[24%]">
                Category
              </th>
              <th className="py-4 px-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] font-medium w-[38%]">
                Sentinel Institute
              </th>
              <th className="py-4 px-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-medium w-[38%]">
                Self-study / Pearson VUE prep
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.category}
                className={`border-b border-[var(--color-border)] ${
                  i % 2 === 1 ? "bg-[var(--color-surface)]/40" : ""
                }`}
              >
                <td className="py-5 pr-6 font-display text-[0.9375rem] font-medium text-[var(--color-text-primary)] align-top">
                  {row.category}
                </td>
                <td className="py-5 px-6 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed align-top">
                  {row.sentinel}
                </td>
                <td className="py-5 px-6 text-[0.9375rem] text-[var(--color-text-muted)] leading-relaxed align-top">
                  {row.selfStudy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: stacked cards */}
        <ul className="md:hidden space-y-6">
          {rows.map((row) => (
            <li
              key={row.category}
              className="border border-[var(--color-border)] rounded-md p-5 bg-[var(--color-surface)]/40"
            >
              <p className="font-display text-[1rem] font-medium text-[var(--color-text-primary)]">
                {row.category}
              </p>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)]">
                    Sentinel Institute
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                    {row.sentinel}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Self-study
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-[var(--color-text-muted)] leading-relaxed">
                    {row.selfStudy}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/programs/SentinelVsSelfStudy.tsx
git commit -m "feat(pr10): SentinelVsSelfStudy comparison table with mobile-stack fallback"
```

---

## Task 9: Create RelatedPrograms component

**Files:**
- Create: `src/components/programs/RelatedPrograms.tsx`

- [ ] **Step 1: Create the file**

Renders the OTHER 2 programs as horizontal mini-cards at the bottom of a detail page, before the final CTA. Server component.

Create `src/components/programs/RelatedPrograms.tsx`:

```tsx
import Link from "next/link"
import type { ProgramPage } from "@/lib/sanity/types"

interface RelatedProgramsProps {
  /** The currently-viewed program — excluded from the list. */
  current: ProgramPage
  /** All programs, used to derive the other 2. */
  all: ProgramPage[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RelatedPrograms({ current, all }: RelatedProgramsProps) {
  const others = all
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => a.homepageOrder - b.homepageOrder)

  if (others.length === 0) return null

  return (
    <section
      aria-labelledby="related-programs-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Compare other certifications
          </p>
          <h2
            id="related-programs-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Shortlist the right path for your team.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {others.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="card-dark flex flex-col gap-4 hover:border-[var(--color-accent-light)] transition-colors"
              data-cta="related-program"
              data-program={program.slug}
            >
              <header className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                  {program.certName}
                </p>
                <p className="font-mono text-[0.8125rem] text-[var(--color-text-primary)]">
                  {priceFormatter.format(program.priceUSD)}
                </p>
              </header>
              <h3
                className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                style={{ fontSize: "1.25rem" }}
              >
                {program.eyebrow}
              </h3>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mt-auto pt-2">
                {program.durationWeeks} weeks · {program.sessionsPerWeek}× per week
                <span className="ml-2 text-[var(--color-accent-light)]">Explore →</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/programs/RelatedPrograms.tsx
git commit -m "feat(pr10): RelatedPrograms bottom band linking to other 2 detail pages"
```

---

## Task 10: Create /programs index page

**Files:**
- Create: `src/app/(marketing)/programs/page.tsx`

- [ ] **Step 1: Create the file**

Server component. Fetches all programs + companyStats (for the ProposalCTA's availableSlots), composes 3 sections.

Create `src/app/(marketing)/programs/page.tsx`:

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { ProgramGrid } from "@/components/sections/ProgramGrid"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllPrograms } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { companyStatsQuery } from "@/lib/sanity/queries"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { ProgramCardData, CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Enterprise Cybersecurity Certification Programs",
  description:
    "Sentinel Institute trains corporate security teams on CompTIA Security+, CySA+, and CASP+ with a 96% first-attempt pass rate and a no-pass, re-train guarantee.",
}

async function fetchCompanyStats(): Promise<CompanyStats> {
  try {
    const data = await sanityClient.fetch<CompanyStats | null>(
      companyStatsQuery,
      {},
      { next: { tags: ["companyStats"] } },
    )
    return data ?? FALLBACK_COMPANY_STATS
  } catch {
    return FALLBACK_COMPANY_STATS
  }
}

export default async function ProgramsIndexPage() {
  const [allPrograms, companyStats] = await Promise.all([
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  // ProgramGrid takes the lighter ProgramCardData type. Project full details down.
  const cardData: ProgramCardData[] = allPrograms.map((p) => ({
    slug: p.slug,
    certName: p.certName,
    eyebrow: p.eyebrow,
    oneliner: p.oneliner,
    priceUSD: p.priceUSD,
    durationWeeks: p.durationWeeks,
    sessionsPerWeek: p.sessionsPerWeek,
    whoNeedsItSummary:
      p.whoNeedsIt?.[0]?.children?.[0]?.text ?? "",
  }))

  return (
    <>
      {/* Section 1 — Hero band */}
      <section
        aria-labelledby="programs-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Programs · 03
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="programs-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Three certifications. One methodology.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every Sentinel program runs the same 8–12 week methodology — live instruction, working sessions on declassified incidents, and the same first-attempt pass guarantee. Choose the certification that matches where your team is today.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="programs-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="programs-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 2 — Program grid */}
      <section
        aria-labelledby="programs-grid-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Choose your path
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="programs-grid-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                Three paths, one outcome.
              </h2>
            </FadeUp>
          </div>
          <ProgramGrid programs={cardData} baseDelay={0.2} />
        </div>
      </section>

      {/* Section 3 — CTA band (reuse ProposalCTA from homepage) */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

`FALLBACK_COMPANY_STATS` is exported from `src/lib/sanity/fallbacks.ts` (line 22) — already verified during plan writing.

- [ ] **Step 2: TypeScript check + build**

Run: `pnpm tsc --noEmit`
Expected: clean.

Run: `pnpm build`
Expected: route table now shows `/programs` (static) — 10 routes total.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/programs/page.tsx"
git commit -m "feat(pr10): /programs index page — hero + ProgramGrid + ProposalCTA"
```

---

## Task 11: Create /programs/[slug] dynamic detail page

**Files:**
- Create: `src/app/(marketing)/programs/[slug]/page.tsx`

- [ ] **Step 1: Create the file**

This is the biggest single component in PR 10 — composes 9 sections + JSON-LD + metadata + generateStaticParams. Server component throughout.

Create `src/app/(marketing)/programs/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { ProgramHero } from "@/components/programs/ProgramHero"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { SentinelVsSelfStudy } from "@/components/programs/SentinelVsSelfStudy"
import { RelatedPrograms } from "@/components/programs/RelatedPrograms"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllPrograms, fetchProgramBySlug, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats, ProgramPage, ProgramSlug } from "@/lib/sanity/types"

export const revalidate = 3600

const ALLOWED_SLUGS: ProgramSlug[] = ["security-plus", "cysa-plus", "casp-plus"]

export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await fetchProgramBySlug(slug)
  if (!program) return { title: "Program not found" }
  return {
    title: program.seoTitle.replace(" | Sentinel Institute", ""), // root layout template adds suffix
    description: program.seoDescription,
  }
}

async function fetchCompanyStats(): Promise<CompanyStats> {
  try {
    const data = await sanityClient.fetch<CompanyStats | null>(
      companyStatsQuery,
      {},
      { next: { tags: ["companyStats"] } },
    )
    return data ?? FALLBACK_COMPANY_STATS
  } catch {
    return FALLBACK_COMPANY_STATS
  }
}

function buildCourseJsonLd(program: ProgramPage): Record<string, unknown> {
  const totalHours = program.sessionsPerWeek * program.durationWeeks * 2 // 2h per session estimate
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.certName,
    description: program.oneliner,
    provider: {
      "@type": "Organization",
      name: "Sentinel Institute",
      sameAs: "https://sentinelinstitute.com",
    },
    offers: {
      "@type": "Offer",
      price: program.priceUSD,
      priceCurrency: "USD",
      category: "Enterprise training",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${totalHours}H`,
    },
  }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [program, allPrograms, companyStats] = await Promise.all([
    fetchProgramBySlug(slug),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!program) notFound()

  const sequenceLabel = `Program ${String(program.homepageOrder + 1).padStart(2, "0")} / ${String(allPrograms.length).padStart(2, "0")}`
  const jsonLd = buildCourseJsonLd(program)

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Section 1 — Hero (Variant A) */}
      <ProgramHero program={program} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Who needs it */}
      <section
        aria-labelledby="who-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Who needs this
            </p>
            <h2 id="who-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
              Built for the team you actually have.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={program.whoNeedsIt} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Curriculum outline */}
      <section
        aria-labelledby="curriculum-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Curriculum outline
          </p>
          <h2 id="curriculum-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            What gets taught, week by week.
          </h2>
          <div className="mt-8">
            <PortableText value={program.curriculumOutline} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 4 — Exam objectives */}
      <section
        aria-labelledby="objectives-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-10">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Exam objectives
            </p>
            <h2 id="objectives-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
              Every domain the CompTIA exam covers.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.examObjectives.map((obj, i) => (
              <li key={obj} className="card-dark flex items-start gap-4">
                <span className="font-mono text-[0.875rem] text-[var(--color-accent-light)] mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1rem] font-medium text-[var(--color-text-primary)]">
                  {obj}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 5 — Outcomes */}
      <section
        aria-labelledby="outcomes-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            After completion
          </p>
          <h2 id="outcomes-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            What your team can do.
          </h2>
          <ol className="mt-10 space-y-6">
            {program.outcomes.map((outcome, i) => (
              <li key={outcome} className="flex gap-5">
                <span className="font-mono text-[0.875rem] text-[var(--color-accent-light)] pt-1 shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1rem] text-[var(--color-text-primary)] leading-relaxed">
                  {outcome}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 6 — Sample lesson */}
      <section
        aria-labelledby="lesson-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            From a real lesson
          </p>
          <h2 id="lesson-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            See what a working session feels like.
          </h2>
          <div className="mt-8 border-l-2 border-[var(--color-accent-light)] pl-6 py-2">
            <PortableText value={program.sampleLesson} components={programProseComponents} />
          </div>
          <p className="mt-6 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            → Full curriculum runs in the live program. Request a proposal to schedule.
          </p>
        </div>
      </section>

      {/* Section 7 — Sentinel vs Self-study */}
      <SentinelVsSelfStudy rows={program.comparisonSelfStudy} />

      {/* Section 8 — Related programs */}
      <RelatedPrograms current={program} all={allPrograms} />

      {/* Section 9 — Final CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

- [ ] **Step 2: TypeScript check + build**

Run: `pnpm tsc --noEmit`
Expected: clean.

Run: `pnpm build`
Expected: route table now shows `/programs/[slug]` (static, 3 prerendered for security-plus, cysa-plus, casp-plus). Total routes now 11.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/programs/[slug]/page.tsx"
git commit -m "feat(pr10): /programs/[slug] detail page with 9 sections + Course JSON-LD"
```

---

## Task 12: Add sitemap entries

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add 4 URLs**

Open `src/app/sitemap.ts`. Replace the current `return [...]` with:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/programs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/programs/security-plus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/programs/cysa-plus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/programs/casp-plus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Future PRs add /industries, /results, /about, /faq.
  ]
}
```

- [ ] **Step 2: TypeScript check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(pr10): sitemap entries for /programs hub + 3 detail pages"
```

---

## Task 13: End-to-end verification

No commits. Run verifications and report.

- [ ] **Step 1: Probe all 4 new URLs locally**

Confirm `pnpm dev` is running on http://localhost:3000.

```powershell
$urls = @('/programs', '/programs/security-plus', '/programs/cysa-plus', '/programs/casp-plus')
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000$u" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    "{0,4}  {1}" -f $r.StatusCode, $u
  } catch {
    "{0,4}  {1}" -f $_.Exception.Response.StatusCode.value__, $u
  }
}
```

Expected: 4× `200`.

- [ ] **Step 2: Confirm branded 404 still works on typo'd slugs**

```powershell
$urls = @('/programs/typo-not-real', '/programs/notreal')
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000$u" -UseBasicParsing -ErrorAction Stop
    "{0,4}  {1}" -f $r.StatusCode, $u
  } catch {
    "{0,4}  {1}" -f $_.Exception.Response.StatusCode.value__, $u
  }
}
```

Expected: `404` for both. PR 9's `not-found.tsx` should still catch these because `generateStaticParams` only prerenders 3 slugs; unknown slugs hit `notFound()` inside the detail page, which falls through to the root not-found.

- [ ] **Step 3: Run qa-smoke against local**

```bash
python scripts/qa-smoke.py http://localhost:3000
```

Expected:
- All 9 existing smoke tests still PASS
- HTTP 4xx/5xx resource failures: still **0** (no regression from PR 9)
- Other console errors: only the `/studio` CORS errors (operational, separate fix)

- [ ] **Step 4: Validate JSON-LD on a detail page**

Visit `http://localhost:3000/programs/security-plus` in a browser. Open DevTools → Elements → search for `application/ld+json`. Confirm the `<script>` tag is present and contains a valid Course schema (look for `"@type":"Course"`, `"offers"`, `"hasCourseInstance"`).

Optionally: copy the JSON content, paste into https://search.google.com/test/rich-results to validate against Google's parser.

- [ ] **Step 5: Manual visual sanity**

Visit each of:
- http://localhost:3000/programs
- http://localhost:3000/programs/security-plus
- http://localhost:3000/programs/cysa-plus
- http://localhost:3000/programs/casp-plus

For each, verify:
- Header + Footer render
- Hero section visible with eyebrow + title + body + stats + 2 CTAs
- All section headings (Who needs it, Curriculum outline, Exam objectives, After completion, From a real lesson, Sentinel vs Self-study, Compare other certifications, final CTA)
- No console errors (open DevTools → Console)
- Mobile responsive (resize to 375px, confirm comparison table stacks to cards)

- [ ] **Step 6: Push to deploy + verify on Vercel preview**

```bash
git push origin main
```

Wait for Vercel deploy (~2 min). Then:

```bash
python scripts/qa-smoke.py https://sentinel-website-sepia.vercel.app
```

And probe the 4 URLs against the preview URL as in Step 1.

Expected: same clean result. Detail pages render the same on production.

---

## Out-of-band reminders (not in this PR)

- After PR 10 ships, Footer's program detail links (`/programs/security-plus`, `/programs/cysa-plus`, `/programs/casp-plus`) finally lead somewhere real (PR 9 left them hitting the branded 404).
- Footer's "All Programs" link still anchors to `/#programs` (homepage). After PR 10 ships, consider changing it to `/programs` (the real hub). Out of scope for this PR — small follow-up.
- Marcus seeds real content for the 3 new fields via Sanity dashboard. Until then, fallback content renders.
- Industries / Results / FAQ / About / Legal pages still 404 to branded page (PRs 11-14).
- Sanity Studio CORS for `localhost:3000` still pending operational fix.
