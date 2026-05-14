# PR 11 — Industries Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/industries` index + 6 detail pages (`/industries/{healthcare,financial-services,government-defense,utilities,insurance,legal}`) on top of the existing `industryPage` Sanity schema (extended with 3 new fields).

**Architecture:** Mirrors PR 10's Programs Hub pattern. Extract `IndustryGrid` from `IndustriesServed` (DRY for the index page). Build 5 new industry-specific components in `src/components/industries/`. Detail page composes 7 sections; index page composes 3. PortableText body content reuses PR 10's `programProseComponents` map. Cross-links to `/programs/{slug}` via `recommendedProgramSlugs`.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 · Sanity v5 + next-sanity v12 · @portabletext/react via `next-sanity` re-export.

**Spec reference:** `docs/superpowers/specs/2026-05-14-pr11-industries-hub-design.md`
**Editorial content reference:** `docs/superpowers/seed/pr11-fallbacks-content.md` (all 6 industries × `trainingContext` + 3 new fields)

---

## File Inventory

**Create:**
- `src/components/sections/IndustryGrid.tsx` — extracted card grid (server component)
- `src/components/industries/IndustryHero.tsx` — Variant A hero
- `src/components/industries/ComplianceClauses.tsx` — numbered citation list
- `src/components/industries/RiskScenarios.tsx` — left-bordered breach narratives
- `src/components/industries/FeaturedCaseStudyCard.tsx` — compact case study summary (renders only if linked)
- `src/components/industries/RecommendedPrograms.tsx` — 1–3 program mini-cards filtered by `recommendedProgramSlugs`
- `src/app/(marketing)/industries/page.tsx` — index
- `src/app/(marketing)/industries/[slug]/page.tsx` — dynamic detail with generateStaticParams

**Modify:**
- `sanity/schemas/industryPage.ts` — append 3 fields with inline object types
- `src/lib/sanity/types.ts` — add `ComplianceClause` + `RiskScenario`; extend `IndustryPage`
- `src/lib/sanity/fallbacks.ts` — fill `trainingContext` + add 3 new fields for all 6 industries
- `src/lib/sanity/queries.ts` — add `INDUSTRY_DETAIL_FIELDS` + 2 fetcher helpers
- `src/components/sections/IndustriesServed.tsx` — delegate inner grid to IndustryGrid
- `src/app/sitemap.ts` — add 7 URLs

---

## Task 1: Add 3 new fields to `industryPage` Sanity schema

**File:** Modify `sanity/schemas/industryPage.ts` — append after `seoDescription`

- [ ] **Step 1: Edit industryPage.ts**

Open `sanity/schemas/industryPage.ts`. After the existing `seoDescription` defineField block (around lines 59-65) and before the closing `]` of the `fields` array, insert these 3 new field blocks:

```ts
    defineField({
      name: 'complianceClauses',
      type: 'array',
      title: 'Compliance clauses',
      description: '3–6 specific regulatory citations (e.g., HIPAA § 164.308(a)(5)(i)).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'complianceClause',
          fields: [
            defineField({ name: 'code', type: 'string', validation: (Rule) => Rule.required().max(40) }),
            defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required().max(120) }),
            defineField({ name: 'description', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(400) }),
          ],
          preview: { select: { title: 'code', subtitle: 'title' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(3).max(6),
    }),
    defineField({
      name: 'riskScenarios',
      type: 'array',
      title: 'Risk scenarios',
      description: '2–3 declassified breach narratives showing what failed audits look like in this industry.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'riskScenario',
          fields: [
            defineField({ name: 'headline', type: 'string', validation: (Rule) => Rule.required().max(80) }),
            defineField({ name: 'narrative', type: 'text', rows: 5, validation: (Rule) => Rule.required().max(600) }),
          ],
          preview: { select: { title: 'headline' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: 'recommendedProgramSlugs',
      type: 'array',
      title: 'Recommended program slugs',
      description: '1–3 program slugs (security-plus / cysa-plus / casp-plus) that map to this industry’s risk profile.',
      of: [
        defineArrayMember({
          type: 'string',
          options: { list: ['security-plus', 'cysa-plus', 'casp-plus'] },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(3).unique(),
    }),
```

Note: `defineArrayMember` is already imported at the top of `programPage.ts` — verify it's also imported in `industryPage.ts` (current file uses only `defineType, defineField`). Add `defineArrayMember` to the import:

```ts
import { defineType, defineField, defineArrayMember } from 'sanity'
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add sanity/schemas/industryPage.ts
git commit -m "feat(pr11): add complianceClauses + riskScenarios + recommendedProgramSlugs to industryPage schema"
```

---

## Task 2-3: Extend types + fill fallback content for 6 industries (bundled)

These tasks bundle because adding required fields to the `IndustryPage` type breaks the existing `FALLBACK_INDUSTRIES` until the fallbacks are also extended.

**Files:**
- Modify: `src/lib/sanity/types.ts`
- Modify: `src/lib/sanity/fallbacks.ts`

- [ ] **Step 1: Extend types.ts**

Open `src/lib/sanity/types.ts`. After the `IndustryPage` interface declaration (line 116, just before the closing `}`), find:

```ts
export interface IndustryPage {
  _id: string
  slug: string
  industryName: string
  complianceMandate: string
  // ... other fields
}
```

Add 3 new fields before the closing `}` of `IndustryPage`:

```ts
  complianceClauses: ComplianceClause[]
  riskScenarios: RiskScenario[]
  recommendedProgramSlugs: ProgramSlug[]
```

And add 2 new interfaces BEFORE the `IndustryPage` interface:

```ts
export interface ComplianceClause {
  code: string
  title: string
  description: string
}

export interface RiskScenario {
  headline: string
  narrative: string
}
```

`ProgramSlug` is already defined at line 80. No new import needed.

- [ ] **Step 2: Read the seed-content doc**

Use the Read tool on `docs/superpowers/seed/pr11-fallbacks-content.md`. The doc contains the exact code blocks for each industry's `trainingContext`, `complianceClauses`, `riskScenarios`, and the `recommendedProgramSlugs` mapping table.

- [ ] **Step 3: Update fallbacks.ts imports**

In `src/lib/sanity/fallbacks.ts`, find the imports block (around lines 1-20). Add `ComplianceClause` and `RiskScenario` to whatever import line pulls from `./types`. The line should now include them alongside the existing types.

- [ ] **Step 4: Extend the Healthcare industry object**

Find the Healthcare industry object in `FALLBACK_INDUSTRIES` (slug `'healthcare'`, around lines 438-449). Replace its `trainingContext: [],` with the 2-block PortableText from the seed doc under `Healthcare § trainingContext`. Then immediately before `homepageOrder: 0,` insert 3 new fields:
- `trainingContext` (replace existing empty array): blocks from seed `Healthcare § trainingContext`
- `complianceClauses`: array from seed `Healthcare § complianceClauses`
- `riskScenarios`: array from seed `Healthcare § riskScenarios`
- `recommendedProgramSlugs: ['security-plus', 'cysa-plus']`

The Healthcare object should match this final shape:

```ts
{
  _id: 'fallback-industry-healthcare',
  slug: 'healthcare',
  industryName: 'Healthcare',
  complianceMandate: 'HIPAA Security Rule § 164.308',
  complianceMandateFull: 'HIPAA Security Rule § 164.308 requires covered entities to designate, train, and maintain workforce members in security awareness and incident response procedures appropriate to their role.',
  trainingContext: [
    /* PASTE: seed doc Healthcare § trainingContext (2 blocks, _key prefix h-tc-*) */
  ],
  complianceClauses: [
    /* PASTE: seed doc Healthcare § complianceClauses (4 objects) */
  ],
  riskScenarios: [
    /* PASTE: seed doc Healthcare § riskScenarios (2 objects) */
  ],
  recommendedProgramSlugs: ['security-plus', 'cysa-plus'],
  homepageOrder: 0,
  seoTitle: 'HIPAA Security Training for Healthcare Teams | Sentinel Institute',
  seoDescription: 'CompTIA Security+, CySA+, and CASP+ training tailored to HIPAA Security Rule § 164.308 workforce requirements.',
},
```

- [ ] **Step 5: Extend the Financial Services industry object**

Same pattern. Slug `'financial-services'`. Content from seed doc `Financial Services` section. PortableText `_key` prefix `f-tc-*`. `recommendedProgramSlugs: ['security-plus', 'cysa-plus']`.

- [ ] **Step 6: Extend the Government & Defense industry object**

Same pattern. Slug `'government-defense'`. Content from seed doc `Government & Defense` section. PortableText `_key` prefix `d-tc-*`. `recommendedProgramSlugs: ['cysa-plus', 'casp-plus']`.

- [ ] **Step 7: Extend the Utilities industry object**

Same pattern. Slug `'utilities'`. Content from seed doc `Utilities` section. PortableText `_key` prefix `u-tc-*`. `recommendedProgramSlugs: ['security-plus', 'casp-plus']`.

- [ ] **Step 8: Extend the Insurance industry object**

Same pattern. Slug `'insurance'`. Content from seed doc `Insurance` section. PortableText `_key` prefix `i-tc-*`. `recommendedProgramSlugs: ['security-plus', 'cysa-plus']`.

- [ ] **Step 9: Extend the Legal industry object**

Same pattern. Slug `'legal'`. Content from seed doc `Legal` section. PortableText `_key` prefix `l-tc-*`. **Note:** Legal only has 3 `complianceClauses` (not 4 like the others) — that's intentional, matches the spec's `min(3)` validation.  `recommendedProgramSlugs: ['security-plus']` (just one).

- [ ] **Step 10: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean — all 6 IndustryPage objects in FALLBACK_INDUSTRIES now satisfy the extended interface.

- [ ] **Step 11: Commit (bundles Tasks 2 + 3)**

```bash
git add src/lib/sanity/types.ts src/lib/sanity/fallbacks.ts
git commit -m "feat(pr11): extend IndustryPage type + seed editorial fallback content for 6 industries"
```

---

## Task 4: Add Sanity query helpers for industries

**File:** Modify `src/lib/sanity/queries.ts`

- [ ] **Step 1: Add the detail-fields projection + 2 queries**

Open `src/lib/sanity/queries.ts`. After the existing `programBySlugQuery` (Task 4 of PR 10) and before `homepageIndustriesQuery`, insert:

```ts
const INDUSTRY_DETAIL_FIELDS = `
  _id, "slug": slug.current, industryName,
  complianceMandate, complianceMandateFull, trainingContext,
  complianceClauses, riskScenarios, recommendedProgramSlugs,
  "featuredCaseStudy": featuredCaseStudy->{
    _id, "slug": slug.current,
    clientIndustry, clientIndustryAnonymized, complianceDriver,
    teamSize, weeksToCertification, certificationsPassed,
    buyerName, buyerTitle,
    "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
    buyerQuote, outcomeMetrics
  },
  homepageOrder, seoTitle, seoDescription
`

export const allIndustryDetailsQuery = groq`
  *[_type == "industryPage"] | order(homepageOrder asc){ ${INDUSTRY_DETAIL_FIELDS} }
`

export const industryBySlugQuery = groq`
  *[_type == "industryPage" && slug.current == $slug][0]{ ${INDUSTRY_DETAIL_FIELDS} }
`
```

Note: `INDUSTRY_DETAIL_FIELDS` is not exported (template fragment). The `featuredCaseStudy` projection dereferences the Sanity reference inline via `->{}` so the detail page doesn't need a separate fetch.

- [ ] **Step 2: Add the fetcher helpers**

Still in `src/lib/sanity/queries.ts`. At the bottom of the file (after the existing `fetchProgramBySlug` from PR 10), add:

```ts
import { FALLBACK_INDUSTRIES } from './fallbacks'

/**
 * Returns all 6 industries with full detail fields. Used by /industries index
 * page and detail pages (for sequenceLabel computation). Uses the length-check
 * fallback pattern from PR 10's fetchAllPrograms — Sanity returning [] still
 * falls back to the seed constants.
 */
export async function fetchAllIndustries(): Promise<IndustryPage[]> {
  const data = await safeFetch<IndustryPage[]>(allIndustryDetailsQuery, [])
  return data.length > 0 ? data : FALLBACK_INDUSTRIES
}

/**
 * Returns a single industry by slug, or null if the slug is unknown.
 * Tries Sanity first, falls back to the matching seed constant.
 */
export async function fetchIndustryBySlug(slug: string): Promise<IndustryPage | null> {
  try {
    const data = await sanityClient.fetch<IndustryPage | null>(
      industryBySlugQuery,
      { slug },
      { next: { tags: ['industryPage', `industryPage:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchIndustryBySlug failed:', slug, error)
    }
  }
  return FALLBACK_INDUSTRIES.find((p) => p.slug === slug) ?? null
}
```

Move the `import { FALLBACK_INDUSTRIES } from './fallbacks'` line up to join the other imports at the top of the file (project convention).

- [ ] **Step 3: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sanity/queries.ts
git commit -m "feat(pr11): add fetchAllIndustries + fetchIndustryBySlug with fallback resilience"
```

---

## Task 5: Extract IndustryGrid, refactor IndustriesServed

**Files:**
- Create: `src/components/sections/IndustryGrid.tsx`
- Modify: `src/components/sections/IndustriesServed.tsx`

- [ ] **Step 1: Create IndustryGrid.tsx**

Create `src/components/sections/IndustryGrid.tsx` with the inner card grid currently inside IndustriesServed. Full content:

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustryGridProps {
  industries: IndustryPage[]
  /** Delay (seconds) added to each card's FadeUp animation. Default 0.3 to match the original IndustriesServed offset. */
  baseDelay?: number
}

export function IndustryGrid({ industries, baseDelay = 0.3 }: IndustryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {industries.map((industry, i) => (
        <FadeUp key={industry._id} delay={baseDelay + i * 0.08} className="flex">
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
  )
}
```

- [ ] **Step 2: Refactor IndustriesServed.tsx**

Open `src/components/sections/IndustriesServed.tsx`. Replace the inner `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">...</div>` block with `<IndustryGrid industries={industries} />`. Add the import. Remove now-unused `Link` import.

Final file should be EXACTLY:

```tsx
import { FadeUp } from "@/components/motion/FadeUp"
import { IndustryGrid } from "@/components/sections/IndustryGrid"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustriesServedProps {
  industries: IndustryPage[]
}

export function IndustriesServed({ industries }: IndustriesServedProps) {
  return (
    <section
      id="industries"
      aria-labelledby="industries-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
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

        <IndustryGrid industries={industries} />
      </div>
    </section>
  )
}
```

Critical preservation:
- `id="industries"` MUST stay (PR 9 anchor target)
- `scroll-mt-24` MUST stay
- `aria-labelledby="industries-headline"` MUST stay

- [ ] **Step 3: TypeScript + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: clean — homepage still renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/IndustryGrid.tsx src/components/sections/IndustriesServed.tsx
git commit -m "refactor(pr11): extract IndustryGrid for reuse on /industries index"
```

---

## Task 6: Create IndustryHero component (Variant A)

**File:** Create `src/components/industries/IndustryHero.tsx`

The `src/components/industries/` folder doesn't exist yet — create it.

- [ ] **Step 1: Create the file**

Mirrors PR 10's `ProgramHero` but with industry-appropriate stat (single compliance mandate stat, no price/duration).

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustryHeroProps {
  industry: IndustryPage
  /** "Industry 01 / 06" — derived from homepageOrder + total count by caller. */
  sequenceLabel: string
}

export function IndustryHero({ industry, sequenceLabel }: IndustryHeroProps) {
  return (
    <section
      aria-labelledby="industry-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {industry.industryName} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="industry-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {industry.industryName}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {industry.complianceMandateFull}
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)]">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Compliance mandate
              </dt>
              <dd className="mt-2 font-display text-[1.25rem] md:text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                {industry.complianceMandate}
              </dd>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="btn-primary"
                data-cta="industry-detail-primary"
                data-industry={industry.slug}
              >
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="industry-detail-secondary" />
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
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/industries/IndustryHero.tsx
git commit -m "feat(pr11): IndustryHero — Variant A editorial single-column hero with compliance stat"
```

---

## Task 7: Create ComplianceClauses component

**File:** Create `src/components/industries/ComplianceClauses.tsx`

- [ ] **Step 1: Create the file**

```tsx
import type { ComplianceClause } from "@/lib/sanity/types"

interface ComplianceClausesProps {
  clauses: ComplianceClause[]
}

export function ComplianceClauses({ clauses }: ComplianceClausesProps) {
  return (
    <section
      aria-labelledby="clauses-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Compliance clauses
          </p>
          <h2
            id="clauses-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            The specific citations this program addresses.
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clauses.map((clause, i) => (
            <li key={`${clause.code}-${i}`} className="card-dark flex flex-col gap-3">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] font-medium">
                {clause.code}
              </p>
              <h3 className="font-display font-medium text-[1.0625rem] tracking-[-0.005em] text-[var(--color-text-primary)]">
                {clause.title}
              </h3>
              <p className="text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {clause.description}
              </p>
            </li>
          ))}
        </ol>
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
git add src/components/industries/ComplianceClauses.tsx
git commit -m "feat(pr11): ComplianceClauses — numbered citation grid for industry detail pages"
```

---

## Task 8: Create RiskScenarios component

**File:** Create `src/components/industries/RiskScenarios.tsx`

- [ ] **Step 1: Create the file**

```tsx
import type { RiskScenario } from "@/lib/sanity/types"

interface RiskScenariosProps {
  scenarios: RiskScenario[]
}

export function RiskScenarios({ scenarios }: RiskScenariosProps) {
  return (
    <section
      aria-labelledby="scenarios-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            What failed audits look like
          </p>
          <h2
            id="scenarios-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Real outcomes from teams without certified personnel.
          </h2>
        </div>

        <ul className="max-w-[48rem] space-y-10">
          {scenarios.map((scenario, i) => (
            <li
              key={`${scenario.headline}-${i}`}
              className="border-l-2 border-[var(--color-accent-light)] pl-6 py-2"
            >
              <h3 className="font-display text-[1.125rem] md:text-[1.25rem] font-medium tracking-[-0.005em] text-[var(--color-text-primary)]">
                {scenario.headline}
              </h3>
              <p className="mt-3 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {scenario.narrative}
              </p>
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
git add src/components/industries/RiskScenarios.tsx
git commit -m "feat(pr11): RiskScenarios — left-bordered breach narratives for industry detail pages"
```

---

## Task 9: Create FeaturedCaseStudyCard component

**File:** Create `src/components/industries/FeaturedCaseStudyCard.tsx`

Renders ONLY if `caseStudy` prop is provided (the Sanity reference is optional, fallbacks don't set it). Compact summary linking to `/results/{slug}` (which 404s until PR 12 ships).

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface FeaturedCaseStudyCardProps {
  caseStudy: CaseStudy | null | undefined
}

export function FeaturedCaseStudyCard({ caseStudy }: FeaturedCaseStudyCardProps) {
  if (!caseStudy) return null

  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry

  return (
    <section
      aria-labelledby="case-study-card-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Featured case study
          </p>
          <h2
            id="case-study-card-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            What this looks like in production.
          </h2>
        </div>

        <article className="card-dark max-w-[48rem] flex flex-col gap-6">
          <blockquote className="font-display text-[1.25rem] md:text-[1.5rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)]">
            {caseStudy.buyerQuote}
          </blockquote>

          <div className="flex items-center gap-4">
            <SanityAvatar
              image={caseStudy.buyerHeadshot}
              fullName={caseStudy.buyerName}
              size={48}
            />
            <div>
              <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {industry}
              </p>
            </div>
          </div>

          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] pt-4 border-t border-[var(--color-border)]">
            {caseStudy.complianceDriver} · Team of {caseStudy.teamSize} · {caseStudy.weeksToCertification} weeks · {caseStudy.certificationsPassed.join(", ")}
          </p>

          <Link
            href={`/results/${caseStudy.slug}`}
            className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2 mt-2"
            data-cta="industry-case-study-card"
            data-case-study={caseStudy.slug}
          >
            Read the full case
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: clean. `SanityAvatar` already exists from PR 5.

- [ ] **Step 3: Commit**

```bash
git add src/components/industries/FeaturedCaseStudyCard.tsx
git commit -m "feat(pr11): FeaturedCaseStudyCard — compact case study summary, conditional render"
```

---

## Task 10: Create RecommendedPrograms component

**File:** Create `src/components/industries/RecommendedPrograms.tsx`

Filters `allPrograms` by the industry's `recommendedProgramSlugs` and renders 1-3 mini-cards linking to `/programs/{slug}`.

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link"
import type { ProgramPage, ProgramSlug } from "@/lib/sanity/types"

interface RecommendedProgramsProps {
  /** The slugs to recommend, from industry.recommendedProgramSlugs (1-3 items). */
  slugs: ProgramSlug[]
  /** All programs (fetched on the detail page) — filtered by slugs. */
  allPrograms: ProgramPage[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RecommendedPrograms({ slugs, allPrograms }: RecommendedProgramsProps) {
  const programs = slugs
    .map((slug) => allPrograms.find((p) => p.slug === slug))
    .filter((p): p is ProgramPage => Boolean(p))
    .sort((a, b) => a.homepageOrder - b.homepageOrder)

  if (programs.length === 0) return null

  return (
    <section
      aria-labelledby="recommended-programs-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Recommended programs
          </p>
          <h2
            id="recommended-programs-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Tracks that fit this risk profile.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {programs.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="card-dark flex flex-col gap-4 hover:border-[var(--color-accent-light)]"
              data-cta="industry-recommended-program"
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
              <h3 className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)] text-[1.25rem]">
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
git add src/components/industries/RecommendedPrograms.tsx
git commit -m "feat(pr11): RecommendedPrograms — filtered program mini-cards driven by industry slugs"
```

---

## Task 11: Create /industries index page

**File:** Create `src/app/(marketing)/industries/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { IndustryGrid } from "@/components/sections/IndustryGrid"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllIndustries, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Industries Served",
  description:
    "Sentinel Institute trains corporate security teams in healthcare, financial services, defense, utilities, insurance, and legal — calibrated to each industry's compliance mandate.",
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

export default async function IndustriesIndexPage() {
  const [allIndustries, companyStats] = await Promise.all([
    fetchAllIndustries(),
    fetchCompanyStats(),
  ])

  return (
    <>
      {/* Section 1 — Hero band */}
      <section
        aria-labelledby="industries-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Industries · 06
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="industries-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Six industries. One certification track per compliance mandate.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every industry Sentinel serves has a regulator. Every regulator audits the same thing: whether your security workforce can prove they’re trained for the role. Pick your sector — the curriculum maps to the standard.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="industries-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="industries-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 2 — Industry grid */}
      <section
        aria-labelledby="industries-grid-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Choose your sector
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="industries-grid-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                Built for the regulator who audits you.
              </h2>
            </FadeUp>
          </div>
          <IndustryGrid industries={allIndustries} baseDelay={0.2} />
        </div>
      </section>

      {/* Section 3 — CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

- [ ] **Step 2: TypeScript check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: clean. Route table now shows `/industries` as a new static route.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/industries/page.tsx"
git commit -m "feat(pr11): /industries index page — hero + IndustryGrid + ProposalCTA"
```

---

## Task 12: Create /industries/[slug] dynamic detail page

**File:** Create `src/app/(marketing)/industries/[slug]/page.tsx`

The biggest single composition in PR 11. Wires 7 sections + JSON-of-zero (no JSON-LD on industries v1 per spec) + ISR.

- [ ] **Step 1: Create the file**

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { IndustryHero } from "@/components/industries/IndustryHero"
import { ComplianceClauses } from "@/components/industries/ComplianceClauses"
import { RiskScenarios } from "@/components/industries/RiskScenarios"
import { FeaturedCaseStudyCard } from "@/components/industries/FeaturedCaseStudyCard"
import { RecommendedPrograms } from "@/components/industries/RecommendedPrograms"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import {
  fetchAllIndustries,
  fetchIndustryBySlug,
  fetchAllPrograms,
  companyStatsQuery,
} from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

const ALLOWED_SLUGS = [
  "healthcare",
  "financial-services",
  "government-defense",
  "utilities",
  "insurance",
  "legal",
] as const

export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const industry = await fetchIndustryBySlug(slug)
  if (!industry) return { title: "Industry not found" }
  return {
    title: industry.seoTitle.replace(" | Sentinel Institute", ""),
    description: industry.seoDescription,
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

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [industry, allIndustries, allPrograms, companyStats] = await Promise.all([
    fetchIndustryBySlug(slug),
    fetchAllIndustries(),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!industry) notFound()

  const sequenceLabel = `Industry ${String(industry.homepageOrder + 1).padStart(2, "0")} / ${String(allIndustries.length).padStart(2, "0")}`

  return (
    <>
      {/* Section 1 — Hero (Variant A) */}
      <IndustryHero industry={industry} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Training context */}
      <section
        aria-labelledby="training-context-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Training context
            </p>
            <h2
              id="training-context-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              Why this industry has its own curriculum.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={industry.trainingContext} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Compliance clauses */}
      <ComplianceClauses clauses={industry.complianceClauses} />

      {/* Section 4 — Risk scenarios */}
      <RiskScenarios scenarios={industry.riskScenarios} />

      {/* Section 5 — Featured case study (conditional render) */}
      <FeaturedCaseStudyCard caseStudy={industry.featuredCaseStudy} />

      {/* Section 6 — Recommended programs */}
      <RecommendedPrograms slugs={industry.recommendedProgramSlugs} allPrograms={allPrograms} />

      {/* Section 7 — Final CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
```

Note: `industry.featuredCaseStudy` is typed as `CaseStudy | undefined` (optional reference field). `IndustryPage` type may need to be checked — verify `featuredCaseStudy?: CaseStudy | null` is correctly declared in `types.ts`. If it's strictly typed as required, the GROQ projection still returns `null` when no reference is set, so the type can be updated to `featuredCaseStudy: CaseStudy | null` (without optional `?`) to satisfy both the schema-required-no-but-projects-nullable case. The `FeaturedCaseStudyCard` already handles null/undefined gracefully.

- [ ] **Step 2: Verify IndustryPage.featuredCaseStudy type**

Run: `grep -n "featuredCaseStudy" src/lib/sanity/types.ts`

If the type doesn't already accept null/undefined for `featuredCaseStudy`, edit it now to:

```ts
featuredCaseStudy?: CaseStudy | null
```

This matches what the GROQ dereference projection actually returns when no reference is set.

- [ ] **Step 3: TypeScript check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: clean. Route table should show `● /industries/[slug]` with 6 prerendered child routes (healthcare, financial-services, government-defense, utilities, insurance, legal).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/industries/[slug]/page.tsx" src/lib/sanity/types.ts
git commit -m "feat(pr11): /industries/[slug] detail page with 7 sections + recommended-program cross-links"
```

(The `types.ts` only goes in if Step 2 needed a fix.)

---

## Task 13: Add sitemap entries

**File:** Modify `src/app/sitemap.ts`

- [ ] **Step 1: Append 7 URLs**

Open `src/app/sitemap.ts`. After the last existing `/programs/casp-plus` entry, before the closing `]`, insert:

```ts
    { url: `${SITE_URL}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/industries/healthcare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/industries/financial-services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/industries/government-defense`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/industries/utilities`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/industries/insurance`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/industries/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

Update the trailing comment to mention `/results, /about, /faq` only (drop `/industries`).

- [ ] **Step 2: TypeScript check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(pr11): sitemap entries for /industries hub + 6 detail pages"
```

---

## Task 14: End-to-end verification

No commits. Verifies the full PR works.

- [ ] **Step 1: Probe 8 new URLs locally**

Confirm `pnpm dev` is on `http://localhost:3000`. Then:

```powershell
$urls = @('/industries', '/industries/healthcare', '/industries/financial-services', '/industries/government-defense', '/industries/utilities', '/industries/insurance', '/industries/legal', '/industries/typo-not-real')
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000$u" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    "{0,4}  {1}" -f $r.StatusCode, $u
  } catch {
    "{0,4}  {1}" -f $_.Exception.Response.StatusCode.value__, $u
  }
}
```

Expected:
- `/industries` → 200
- 6 detail slugs → 200 each
- `/industries/typo-not-real` → 404 (branded 404 from PR 9)

- [ ] **Step 2: Verify RecommendedPrograms shows correct subset per industry**

Probe each industry detail page and count program-card data-cta attributes:

```powershell
$cases = @{
  'healthcare' = 2          # security-plus + cysa-plus
  'financial-services' = 2  # security-plus + cysa-plus
  'government-defense' = 2  # cysa-plus + casp-plus
  'utilities' = 2           # security-plus + casp-plus
  'insurance' = 2           # security-plus + cysa-plus
  'legal' = 1               # security-plus
}
foreach ($slug in $cases.Keys) {
  $html = (Invoke-WebRequest -Uri "http://localhost:3000/industries/$slug" -UseBasicParsing).Content
  $count = ($html | Select-String -Pattern 'data-cta="industry-recommended-program"' -AllMatches).Matches.Count
  $expected = $cases[$slug]
  $status = if ($count -eq $expected) { 'OK' } else { 'MISMATCH' }
  "{0,-22} expected={1} actual={2} [{3}]" -f $slug, $expected, $count, $status
}
```

Expected: all 6 rows print `[OK]`.

- [ ] **Step 3: Verify FeaturedCaseStudyCard correctly omits**

The fallbacks don't set `featuredCaseStudy`, so the case study section should NOT appear on any fallback-driven detail page. Probe one:

```powershell
$html = (Invoke-WebRequest -Uri http://localhost:3000/industries/healthcare -UseBasicParsing).Content
if ($html | Select-String -Pattern 'Featured case study' -Quiet) {
  "FAIL — Featured case study section rendered with no caseStudy data"
} else {
  "OK — case study section correctly omitted"
}
```

Expected: `OK`.

- [ ] **Step 4: Run qa-smoke against local**

```bash
python scripts/qa-smoke.py http://localhost:3000
```

Expected: 9 standard tests still PASS, 0 HTTP 4xx resource failures, 0 console errors (excluding /studio CORS).

- [ ] **Step 5: Push + verify on Vercel preview**

```bash
git push origin main
```

Wait ~2 min for Vercel auto-deploy. Then re-run Step 1 + Step 2 against `https://sentinel-website-sepia.vercel.app/industries/...`.

Expected: same clean results on production.

---

## Out-of-band reminders (not in this PR)

- Footer's 3 industry detail links (`/industries/financial-services`, `/industries/healthcare`, `/industries/government-defense`) finally lead somewhere real after PR 11 ships.
- Footer's "All Industries" link still points to `/#industries` (homepage anchor). A follow-up should change this to `/industries` (the real hub).
- `/results/{slug}` links from FeaturedCaseStudyCard still 404 to branded page until PR 12 ships. Marcus's fallback content doesn't set `featuredCaseStudy` so this doesn't manifest in dev, but if he seeds one in Sanity later, the link will dead-end until PR 12.
- `/industries/government-defense` works correctly (PR 9 fixed the slug alignment).
- Marcus seeds real content via Sanity dashboard. Until then, fallback content renders.
- Sanity Studio CORS for `localhost:3000` still pending operational fix.
