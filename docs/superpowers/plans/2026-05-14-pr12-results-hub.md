# PR 12 — Results Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/results` index + 1 detail page (`/results/healthcare-hipaa-security-plus`) on top of the existing `caseStudy` Sanity schema (extended with 2 new fields).

**Architecture:** Mirrors PR 10/11 patterns. Add `timeline` + `roi` to schema. Build 4 new components in `src/components/results/`. Detail page composes 10 sections (the richest detail page yet). Index renders editorial list cards that scale from 1 case study to N. Reuses PR 11's `RecommendedPrograms` component via a small slug-mapping helper.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 · Sanity v5 + next-sanity v12.

**Spec reference:** `docs/superpowers/specs/2026-05-14-pr12-results-hub-design.md`
**Editorial content reference:** `docs/superpowers/seed/pr12-fallbacks-content.md` (challenge/solution/outcome PortableText + timeline + roi for the existing case study)

---

## File Inventory

**Create:**
- `src/components/results/ResultsHero.tsx` — Variant A hero for case study detail
- `src/components/results/CaseStudyTimeline.tsx` — chronological milestone list
- `src/components/results/CaseStudyROI.tsx` — large editorial ROI statement
- `src/components/results/ResultsCard.tsx` — full-width editorial card for the index page
- `src/app/(marketing)/results/page.tsx` — index
- `src/app/(marketing)/results/[slug]/page.tsx` — dynamic detail with generateStaticParams

**Modify:**
- `sanity/schemas/caseStudy.ts` — append 2 fields with inline object type for timeline
- `src/lib/sanity/types.ts` — add `TimelineMilestone`; extend `CaseStudy`
- `src/lib/sanity/fallbacks.ts` — fill `challenge`/`solution`/`outcome` + add `timeline`/`roi` for FALLBACK_CASE_STUDY
- `src/lib/sanity/queries.ts` — add `CASE_STUDY_DETAIL_FIELDS` + 2 fetcher helpers
- `src/app/sitemap.ts` — add 2 URLs

---

## Task 1: Add 2 new fields to `caseStudy` Sanity schema

**File:** `sanity/schemas/caseStudy.ts`

- [ ] **Step 1: Append 2 field blocks**

Open `sanity/schemas/caseStudy.ts`. After the `featured` field (around line 168) and before the closing `]` of the `fields` array, insert:

```ts
    defineField({
      name: 'timeline',
      type: 'array',
      title: 'Timeline milestones',
      description: '3–7 chronological milestones from initial contact to outcome.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineMilestone',
          fields: [
            defineField({ name: 'date', type: 'string', description: 'YYYY-MM format', validation: (Rule) => Rule.required().regex(/^\d{4}-\d{2}$/, { name: 'YYYY-MM' }) }),
            defineField({ name: 'headline', type: 'string', validation: (Rule) => Rule.required().max(80) }),
            defineField({ name: 'description', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(300) }),
          ],
          preview: { select: { title: 'headline', subtitle: 'date' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(3).max(7),
    }),
    defineField({
      name: 'roi',
      type: 'text',
      title: 'ROI statement',
      description: 'Single 1–3 sentence statement quantifying the financial or risk impact.',
      rows: 4,
      validation: (Rule) => Rule.required().max(500),
    }),
```

`defineArrayMember` already imported in this file (line 1).

- [ ] **Step 2: tsc + commit**

```bash
pnpm tsc --noEmit
git add sanity/schemas/caseStudy.ts
git commit -m "feat(pr12): add timeline + roi to caseStudy schema"
```

---

## Task 2: Extend types + fill fallback content (bundled)

**Files:**
- Modify: `src/lib/sanity/types.ts`
- Modify: `src/lib/sanity/fallbacks.ts`

- [ ] **Step 1: Add TimelineMilestone + extend CaseStudy**

Open `src/lib/sanity/types.ts`. Locate the `CaseStudy` interface (around line 51-78). BEFORE it, insert:

```ts
export interface TimelineMilestone {
  date: string
  headline: string
  description: string
}
```

Then extend `CaseStudy` — find the closing `}` of the interface and add 2 fields before it:

```ts
  timeline: TimelineMilestone[]
  roi: string
```

- [ ] **Step 2: Read the seed doc**

Use Read on `docs/superpowers/seed/pr12-fallbacks-content.md` for the editorial content.

- [ ] **Step 3: Extend FALLBACK_CASE_STUDY**

Open `src/lib/sanity/fallbacks.ts`. Locate `FALLBACK_CASE_STUDY` (around line 413). Make these changes inside the object:

a) Replace `challenge: [],` with the 3-block PortableText from seed `challenge` (keys `cs-ch-1/2/3`).

b) Replace `solution: [],` with the 3-block PortableText from seed `solution` (keys `cs-so-1/2/3`).

c) Replace `outcome: [],` with the 3-block PortableText from seed `outcome` (keys `cs-ou-1/2/3`).

d) Before `publishedDate:`, insert 2 new fields:
- `timeline: [...]` — 5 milestones from seed
- `roi: '...'` — string from seed

The final shape (showing only changed portions):

```ts
export const FALLBACK_CASE_STUDY: CaseStudy = {
  _id: 'fallback-case-study-1',
  slug: 'healthcare-hipaa-security-plus',
  // ... other existing fields unchanged ...
  challenge: [ /* PASTE: 3 blocks from seed */ ],
  solution: [ /* PASTE: 3 blocks from seed */ ],
  outcome: [ /* PASTE: 3 blocks from seed */ ],
  outcomeMetrics: [ /* existing 3 metrics unchanged */ ],
  timeline: [ /* PASTE: 5 milestones from seed */ ],
  roi: '/* PASTE: ROI string from seed */',
  publishedDate: '2026-04-01T00:00:00.000Z',
  featured: true,
}
```

**Apostrophe note:** several seed strings contain U+2019 curly apostrophes (e.g., `OCR's`, `CISO's`, `Sentinel's`). Use a Python byte-level fix if the Edit tool downgrades them — see PR 11's pattern at commit `c611077`. The brand voice requires U+2019, not U+0027.

- [ ] **Step 4: tsc + commit**

```bash
pnpm tsc --noEmit
git add src/lib/sanity/types.ts src/lib/sanity/fallbacks.ts
git commit -m "feat(pr12): extend CaseStudy type + seed challenge/solution/outcome/timeline/roi for fallback"
```

---

## Task 3: Add Sanity query helpers for case studies

**File:** `src/lib/sanity/queries.ts`

- [ ] **Step 1: Add projection + 2 queries + 2 fetchers**

Open `src/lib/sanity/queries.ts`. After the existing `industryBySlugQuery` (from PR 11) and before `homepageIndustriesQuery`, insert:

```ts
const CASE_STUDY_DETAIL_FIELDS = `
  _id, "slug": slug.current,
  clientIndustry, clientIndustryAnonymized, complianceDriver,
  teamSize, weeksToCertification, certificationsPassed,
  buyerName, buyerTitle,
  "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
  buyerQuote, challenge, solution, outcome, outcomeMetrics,
  timeline, roi,
  "clientLogo": clientLogo{ "url": asset->url, "alt": alt },
  publishedDate, featured
`

export const allCaseStudiesQuery = groq`
  *[_type == "caseStudy"] | order(publishedDate desc){ ${CASE_STUDY_DETAIL_FIELDS} }
`

export const caseStudyBySlugQuery = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{ ${CASE_STUDY_DETAIL_FIELDS} }
`
```

At the bottom of the file (after fetchIndustryBySlug), add:

```ts
import { FALLBACK_CASE_STUDY } from './fallbacks'

export async function fetchAllCaseStudies(): Promise<CaseStudy[]> {
  const data = await safeFetch<CaseStudy[]>(allCaseStudiesQuery, [])
  return data.length > 0 ? data : [FALLBACK_CASE_STUDY]
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const data = await sanityClient.fetch<CaseStudy | null>(
      caseStudyBySlugQuery,
      { slug },
      { next: { tags: ['caseStudy', `caseStudy:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchCaseStudyBySlug failed:', slug, error)
    }
  }
  return FALLBACK_CASE_STUDY.slug === slug ? FALLBACK_CASE_STUDY : null
}
```

Move the `FALLBACK_CASE_STUDY` import to the top of the file alongside the existing fallback imports.

- [ ] **Step 2: tsc + commit**

```bash
pnpm tsc --noEmit
git add src/lib/sanity/queries.ts
git commit -m "feat(pr12): add fetchAllCaseStudies + fetchCaseStudyBySlug with fallback resilience"
```

---

## Task 4-7: Build 4 components (bundled into one dispatch)

All 4 components live in `src/components/results/` (new folder). All server components. Bundle into a single subagent dispatch for efficiency.

---

### Task 4: ResultsHero — Variant A hero for case study detail

**File:** Create `src/components/results/ResultsHero.tsx`

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { CaseStudy } from "@/lib/sanity/types"

interface ResultsHeroProps {
  caseStudy: CaseStudy
  /** "Case 01 / N" — derived by caller. */
  sequenceLabel: string
}

export function ResultsHero({ caseStudy, sequenceLabel }: ResultsHeroProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const certList = caseStudy.certificationsPassed.join(" + ")

  return (
    <section
      aria-labelledby="results-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {industry} · {caseStudy.complianceDriver} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="results-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {industry} — {caseStudy.complianceDriver}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {caseStudy.buyerName}, {caseStudy.buyerTitle}, led a {caseStudy.teamSize}-person security team through Sentinel’s certification path in {caseStudy.weeksToCertification} weeks under live audit scrutiny.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Team size</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{caseStudy.teamSize} learners</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Time to cert</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{caseStudy.weeksToCertification} weeks</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Certifications</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{certList}</dd>
              </div>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="results-detail-primary" data-case-study={caseStudy.slug}>
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="results-detail-secondary" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

Commit:
```bash
git add src/components/results/ResultsHero.tsx
git commit -m "feat(pr12): ResultsHero — Variant A hero for case study detail page"
```

---

### Task 5: CaseStudyTimeline — chronological milestone list

**File:** Create `src/components/results/CaseStudyTimeline.tsx`

```tsx
import type { TimelineMilestone } from "@/lib/sanity/types"

interface CaseStudyTimelineProps {
  milestones: TimelineMilestone[]
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" })

function formatYearMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-")
  if (!year || !month) return yyyymm
  return monthFormatter.format(new Date(Number(year), Number(month) - 1, 1))
}

export function CaseStudyTimeline({ milestones }: CaseStudyTimelineProps) {
  return (
    <section
      aria-labelledby="timeline-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel max-w-[48rem]">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
          Timeline
        </p>
        <h2
          id="timeline-headline"
          className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
        >
          From audit finding to closed corrective action.
        </h2>

        <ol className="mt-12 relative">
          {milestones.map((milestone, i) => (
            <li
              key={`${milestone.date}-${i}`}
              className={`relative pl-10 ${i === milestones.length - 1 ? "" : "pb-10"}`}
            >
              {i !== milestones.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--color-border)]"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-[var(--color-accent-light)] bg-[var(--color-surface)]"
              />
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                {formatYearMonth(milestone.date)}
              </p>
              <h3 className="mt-2 font-display text-[1.125rem] font-medium tracking-[-0.005em] text-[var(--color-text-primary)]">
                {milestone.headline}
              </h3>
              <p className="mt-2 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
```

Commit:
```bash
git add src/components/results/CaseStudyTimeline.tsx
git commit -m "feat(pr12): CaseStudyTimeline — vertical milestone list with date markers"
```

---

### Task 6: CaseStudyROI — large editorial ROI statement

**File:** Create `src/components/results/CaseStudyROI.tsx`

```tsx
interface CaseStudyROIProps {
  text: string
}

export function CaseStudyROI({ text }: CaseStudyROIProps) {
  return (
    <section
      aria-labelledby="roi-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel max-w-[48rem] text-center">
        <p
          id="roi-headline"
          className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium"
        >
          ROI
        </p>
        <blockquote className="mt-6 font-display text-[1.5rem] md:text-[1.875rem] font-medium tracking-[-0.01em] leading-[1.3] text-[var(--color-text-primary)]">
          {text}
        </blockquote>
      </div>
    </section>
  )
}
```

Commit:
```bash
git add src/components/results/CaseStudyROI.tsx
git commit -m "feat(pr12): CaseStudyROI — large centered editorial ROI statement"
```

---

### Task 7: ResultsCard — full-width editorial card for index page

**File:** Create `src/components/results/ResultsCard.tsx`

```tsx
import Link from "next/link"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface ResultsCardProps {
  caseStudy: CaseStudy
}

export function ResultsCard({ caseStudy }: ResultsCardProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const topMetrics = caseStudy.outcomeMetrics.slice(0, 3)

  return (
    <Link
      href={`/results/${caseStudy.slug}`}
      className="card-dark block hover:border-[var(--color-accent-light)]"
      data-cta="results-card"
      data-case-study={caseStudy.slug}
    >
      <article className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            {industry} · {caseStudy.complianceDriver}
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            {caseStudy.certificationsPassed.join(" + ")} · {caseStudy.weeksToCertification} weeks
          </p>
        </header>

        <blockquote className="font-display text-[1.375rem] md:text-[1.625rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)] max-w-[44rem]">
          {caseStudy.buyerQuote}
        </blockquote>

        <div className="flex items-center gap-4">
          <SanityAvatar image={caseStudy.buyerHeadshot} fullName={caseStudy.buyerName} size={48} />
          <div>
            <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
              {caseStudy.buyerName}, {caseStudy.buyerTitle}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              {industry}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border)]">
          {topMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {metric.label}
              </dt>
              <dd className="mt-2 font-display text-[1.5rem] md:text-[1.75rem] font-medium text-[var(--color-text-primary)]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] inline-flex items-center gap-2">
          Read the full case
          <span aria-hidden="true">→</span>
        </p>
      </article>
    </Link>
  )
}
```

Commit:
```bash
git add src/components/results/ResultsCard.tsx
git commit -m "feat(pr12): ResultsCard — full-width editorial card for /results index"
```

---

After all 4 commits (Tasks 4-7), run `pnpm tsc --noEmit && pnpm build`. Expected: clean. Same route count (21) — components not wired yet.

---

## Task 8: Create /results index page

**File:** Create `src/app/(marketing)/results/page.tsx`

- [ ] **Step 1: Create file**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { ResultsCard } from "@/components/results/ResultsCard"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllCaseStudies, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Results",
  description:
    "Case studies from Sentinel Institute enterprise certification cohorts — documented outcomes from teams under live compliance audits.",
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

export default async function ResultsIndexPage() {
  const [allCaseStudies, companyStats] = await Promise.all([
    fetchAllCaseStudies(),
    fetchCompanyStats(),
  ])

  return (
    <>
      <section
        aria-labelledby="results-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Results · {String(allCaseStudies.length).padStart(2, "0")}
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="results-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Outcomes that hold up under audit.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every Sentinel case study is a documented outcome from a real enterprise security cohort under live regulatory scrutiny. Names anonymized where contractually required; metrics are exact.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="results-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="results-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      <section
        aria-labelledby="results-list-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Case studies
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="results-list-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                The work, in our clients’ words.
              </h2>
            </FadeUp>
          </div>
          <ul className="space-y-6 max-w-[72rem]">
            {allCaseStudies.map((cs, i) => (
              <FadeUp key={cs._id} delay={0.2 + i * 0.1}>
                <li>
                  <ResultsCard caseStudy={cs} />
                </li>
              </FadeUp>
            ))}
          </ul>
        </div>
      </section>

      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

Note: `clients’` body string uses U+2019 — preserve curly apostrophe.

- [ ] **Step 2: tsc + build**

```bash
pnpm tsc --noEmit && pnpm build
```

Expected: `/results` appears as new static route. Total routes goes from 21 to 22.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/results/page.tsx"
git commit -m "feat(pr12): /results index page — hero + editorial cards + ProposalCTA"
```

---

## Task 9: Create /results/[slug] detail page (10 sections)

**File:** Create `src/app/(marketing)/results/[slug]/page.tsx`

- [ ] **Step 1: Create file with exact content**

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import { ResultsHero } from "@/components/results/ResultsHero"
import { CaseStudyTimeline } from "@/components/results/CaseStudyTimeline"
import { CaseStudyROI } from "@/components/results/CaseStudyROI"
import { RecommendedPrograms } from "@/components/industries/RecommendedPrograms"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import {
  fetchAllCaseStudies,
  fetchCaseStudyBySlug,
  fetchAllPrograms,
  companyStatsQuery,
} from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats, ProgramSlug } from "@/lib/sanity/types"

export const revalidate = 3600

/** Lookup table: cert name (as stored in caseStudy.certificationsPassed) → program slug. */
const CERT_TO_SLUG: Record<string, ProgramSlug> = {
  "Security+": "security-plus",
  "CySA+": "cysa-plus",
  "CASP+": "casp-plus",
}

function certNamesToSlugs(certNames: string[]): ProgramSlug[] {
  return certNames
    .map((name) => CERT_TO_SLUG[name])
    .filter((slug): slug is ProgramSlug => Boolean(slug))
}

export async function generateStaticParams() {
  const all = await fetchAllCaseStudies()
  return all.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cs = await fetchCaseStudyBySlug(slug)
  if (!cs) return { title: "Case study not found" }
  const industry = cs.clientIndustryAnonymized ?? cs.clientIndustry
  return {
    title: `${industry} — ${cs.complianceDriver}`,
    description: `${cs.buyerName}, ${cs.buyerTitle} led a ${cs.teamSize}-person team through ${cs.certificationsPassed.join(" + ")} certification in ${cs.weeksToCertification} weeks.`,
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

export default async function ResultsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [caseStudy, allCaseStudies, allPrograms, companyStats] = await Promise.all([
    fetchCaseStudyBySlug(slug),
    fetchAllCaseStudies(),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!caseStudy) notFound()

  const index = allCaseStudies.findIndex((cs) => cs.slug === caseStudy.slug)
  const sequenceLabel = `Case ${String(Math.max(index, 0) + 1).padStart(2, "0")} / ${String(allCaseStudies.length).padStart(2, "0")}`
  const recommendedSlugs = certNamesToSlugs(caseStudy.certificationsPassed)
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry

  return (
    <>
      {/* Section 1 — Hero (Variant A) */}
      <ResultsHero caseStudy={caseStudy} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Challenge */}
      <section
        aria-labelledby="challenge-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              The challenge
            </p>
            <h2
              id="challenge-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              What the team walked in carrying.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={caseStudy.challenge} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Solution */}
      <section
        aria-labelledby="solution-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            The solution
          </p>
          <h2
            id="solution-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            How Sentinel structured the response.
          </h2>
          <div className="mt-8">
            <PortableText value={caseStudy.solution} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 4 — Outcome */}
      <section
        aria-labelledby="outcome-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            The outcome
          </p>
          <h2
            id="outcome-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            What landed at the end of the cohort.
          </h2>
          <div className="mt-8">
            <PortableText value={caseStudy.outcome} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 5 — Outcome metrics */}
      <section
        aria-labelledby="metrics-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-10">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Outcome metrics
            </p>
            <h2
              id="metrics-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              The numbers the auditors saw.
            </h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudy.outcomeMetrics.map((metric, i) => (
              <div key={`${metric.label}-${i}`} className="card-dark">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {metric.label}
                </dt>
                <dd className="mt-3 font-display text-[2.25rem] md:text-[2.75rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)] leading-none">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Section 6 — Timeline */}
      <CaseStudyTimeline milestones={caseStudy.timeline} />

      {/* Section 7 — ROI */}
      <CaseStudyROI text={caseStudy.roi} />

      {/* Section 8 — Buyer testimonial */}
      <section
        aria-labelledby="testimonial-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p id="testimonial-headline" className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            In their words
          </p>
          <blockquote className="mt-8 font-display text-[1.5rem] md:text-[1.875rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)]">
            {caseStudy.buyerQuote}
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <SanityAvatar image={caseStudy.buyerHeadshot} fullName={caseStudy.buyerName} size={56} />
            <div>
              <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {industry}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 — Recommended programs */}
      <RecommendedPrograms slugs={recommendedSlugs} allPrograms={allPrograms} />

      {/* Section 10 — Final CTA */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

- [ ] **Step 2: tsc + build**

```bash
pnpm tsc --noEmit && pnpm build
```

Expected: route table shows `● /results/[slug]` with 1 prerendered child route. Total routes 23.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/results/[slug]/page.tsx"
git commit -m "feat(pr12): /results/[slug] detail page with 10 sections + cert-to-slug program mapping"
```

---

## Task 10: Sitemap entries

**File:** Modify `src/app/sitemap.ts`

- [ ] **Step 1: Append 2 URLs**

After the existing `/industries/legal` entry, before the closing `]`, insert:

```ts
    { url: `${SITE_URL}/results`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/results/healthcare-hipaa-security-plus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

Update the trailing comment from `// Future PRs add /results, /about, /faq.` to `// Future PRs add /about, /faq.`

- [ ] **Step 2: tsc + build + commit**

```bash
pnpm tsc --noEmit && pnpm build
git add src/app/sitemap.ts
git commit -m "feat(pr12): sitemap entries for /results hub + 1 detail page"
```

---

## Task 11: End-to-end verification

No commits. Verifies the full PR.

- [ ] **Step 1: Probe new URLs locally**

```powershell
$urls = @('/results', '/results/healthcare-hipaa-security-plus', '/results/typo-not-real')
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000$u" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    "{0,4}  {1}" -f $r.StatusCode, $u
  } catch {
    "{0,4}  {1}" -f $_.Exception.Response.StatusCode.value__, $u
  }
}
```

Expected: 200 / 200 / 404.

- [ ] **Step 2: Verify RecommendedPrograms shows correct subset**

The case study's certificationsPassed is `['Security+', 'CySA+']`. The detail page should show 2 program cards (Security+ + CySA+), not CASP+.

```powershell
$html = (Invoke-WebRequest -Uri http://localhost:3000/results/healthcare-hipaa-security-plus -UseBasicParsing).Content
$count = ($html | Select-String -Pattern 'data-cta="industry-recommended-program"' -AllMatches).Matches.Count
"recommended program cards: $count (expected: 2)"
```

Expected: `recommended program cards: 2`.

- [ ] **Step 3: Verify all 10 sections render**

```powershell
$html = (Invoke-WebRequest -Uri http://localhost:3000/results/healthcare-hipaa-security-plus -UseBasicParsing).Content
$h2s = ($html | Select-String -Pattern '<h2[^>]*>([^<]+)' -AllMatches).Matches.Count
"h2 count: $h2s (expected: 8 — Challenge/Solution/Outcome/Metrics/Timeline (no h2 in ROI)/Testimonial/Recommended/ProposalCTA)"
```

Note: actually expected count is 8 (Challenge, Solution, Outcome, Metrics, Timeline, Testimonial, Recommended, ProposalCTA). ROI uses a `<p>` with the eyebrow, not an `<h2>`. If the count is off, inspect h2 list.

- [ ] **Step 4: Push + verify on Vercel preview**

```bash
git push origin main
```

Wait ~90s for Vercel auto-deploy. Then re-run Step 1 against `https://sentinel-website-sepia.vercel.app/results/...`.

Expected: same clean result.

---

## Out-of-band reminders

- After PR 12 ships, PR 11's `FeaturedCaseStudyCard` links to `/results/{slug}` lead somewhere real (when industries seed a case study).
- The case study's `buyerHeadshot.url` is empty in fallback. `SanityAvatar` falls back to initials — page still looks clean.
- If Marcus seeds a case study with a non-CompTIA cert (e.g., 'CISSP'), the `RecommendedPrograms` section silently drops it (no /programs/cissp page exists). Worth a future schema constraint if needed.
- Sanity Studio CORS for `localhost:3000` still pending operational fix.
