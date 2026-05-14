# PR 10 — Programs Hub · Design

**Date:** 2026-05-14
**Project:** Sentinel Institute marketing site
**Status:** Approved — ready for plan

---

## Context

PR 9 closed the broken-route UX with a branded 404. The homepage's three program cards (in `ProgramsOverview`) still link to `/programs/{slug}` URLs that 404. PR 10 builds the real `/programs` hub:

- 1 index page at `/programs`
- 3 detail pages at `/programs/security-plus`, `/programs/cysa-plus`, `/programs/casp-plus`

The `programPage` Sanity schema already exists from PR 4 with `slug`, `certName`, `eyebrow`, `oneliner`, `priceUSD`, `durationWeeks`, `sessionsPerWeek`, `whoNeedsIt` (PortableText), `curriculumOutline` (PortableText), `examObjectives` (string[]), `homepageOrder`, `seoTitle`, `seoDescription`. PR 10 adds **3 new fields** for the "Premium" content depth chosen during brainstorm.

## Scope

### In scope

1. **Schema:** add `outcomes`, `sampleLesson`, `comparisonSelfStudy` to `programPage`.
2. **Index page** `/programs` — hero band + reused program-card grid + CTA band.
3. **Detail pages** `/programs/[slug]` — 9-section editorial layout per Hero Variant A (editorial single column).
4. **Component extraction:** pull the card grid out of `ProgramsOverview` into a reusable `ProgramGrid`.
5. **Sanity queries:** new `fetchAllPrograms()` + `fetchProgramBySlug(slug)` with PortableText fields included.
6. **Fallbacks:** seed `outcomes`, `sampleLesson`, `comparisonSelfStudy`, and the previously empty `curriculumOutline` for all 3 programs.
7. **SEO:** `generateStaticParams` + `generateMetadata` on detail pages; `Course` JSON-LD schema on each detail; `/programs` + 3 detail URLs added to `sitemap.ts`.
8. **PortableText components:** shared renderer config for `whoNeedsIt`, `curriculumOutline`, `sampleLesson`.

### Out of scope

- Industries / Results / FAQ / About / Legal pages (PRs 11–14)
- Sticky desktop right-rail CTA card (deferred — revisit only if conversion data demands it)
- Sanity content seeding by Marcus (operational task; fallbacks render until seeded)
- Cal.com `discovery_call_booked` listener (already deferred Phase 2 work)
- Image hero (program detail page hero is text-only by design — matches editorial discipline)

---

## Schema additions

Append to `sanity/schemas/programPage.ts`:

```ts
defineField({
  name: 'outcomes',
  type: 'array',
  title: 'Outcomes after completion',
  description: '3–10 capability statements. Render under "After completion, your team can…"',
  of: [defineArrayMember({ type: 'string' })],
  validation: (Rule) => Rule.required().min(3).max(10).unique(),
}),
defineField({
  name: 'sampleLesson',
  type: 'blockContent',
  title: 'Sample lesson preview',
  description: 'Editorial excerpt from a real lesson. Show prospects what the actual instruction feels like.',
  validation: (Rule) => Rule.required(),
}),
defineField({
  name: 'comparisonSelfStudy',
  type: 'array',
  title: 'Sentinel vs Self-study comparison',
  description: '3–8 rows comparing Sentinel approach to CompTIA self-study / Pearson VUE prep.',
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

Type definitions in `src/lib/sanity/types.ts` extend `ProgramPage`:

```ts
export interface ComparisonRow {
  category: string
  sentinel: string
  selfStudy: string
}

export interface ProgramPage {
  // ... existing fields
  outcomes: string[]
  sampleLesson: PortableTextBlock[]
  comparisonSelfStudy: ComparisonRow[]
}
```

---

## Index page · `/programs`

**File:** `src/app/(marketing)/programs/page.tsx`

Server component. Fetches all 3 programs via `fetchAllPrograms()` and renders 3 sections.

### Section 1 — Hero band

Editorial single column on `bg-[var(--color-surface)]`. Matches homepage hero discipline.

- Eyebrow: `Programs · 03` (mono, accent-light)
- H1: `Three certifications. One methodology.` (display serif, clamp 2-3rem)
- Body: `Every Sentinel program runs the same 8–12 week methodology — live instruction, weekly assessments, and the same first-attempt pass guarantee. Choose the certification that matches where your team is today.` (~30 words)
- 2 CTAs: Request a Proposal (primary) + Book a 20-Min Discovery Call (secondary)

### Section 2 — Program grid

Renders `<ProgramGrid programs={programs} />` — the extracted card grid (see Component extraction).

### Section 3 — Final CTA band

Reuses the existing `ProposalCTA` pattern (already on homepage). Same component if importable, or a `<ProgramsCTA />` clone if its props/availableSlots dependency makes reuse awkward.

---

## Detail page · `/programs/[slug]`

**File:** `src/app/(marketing)/programs/[slug]/page.tsx`

Server component with:

- `generateStaticParams()` → returns `[{ slug: 'security-plus' }, { slug: 'cysa-plus' }, { slug: 'casp-plus' }]` from the Sanity schema's ALLOWED_SLUGS (or fetched list).
- `generateMetadata({ params })` → reads `seoTitle` / `seoDescription` from fetched program.
- ISR via `export const revalidate = 3600`.
- Calls `notFound()` if `fetchProgramBySlug(slug)` returns null (defense against typo'd URLs even though `generateStaticParams` covers all valid slugs).

### Sections (top to bottom)

#### 1. Hero — Variant A editorial single column

Implemented as `<ProgramHero program={program} sequenceLabel={"Program 01 / 03"} />`.

Anatomy:

```
[eyebrow]   CompTIA Security+ · Program 01 / 03    (mono, accent-light)

[h1]        Foundational security operations.       (display serif, clamp 2.5-3rem)

[body]      For security analysts and SOC engineers establishing
            baseline competency across threats, identity, cryptography,
            and risk management.                    (max-w 36rem)

[stats]     INVESTMENT      DURATION       CADENCE
            $3,500          8 weeks        3× per week

[ctas]      Request a Proposal →   Book a 20-Min Discovery Call
```

`sequenceLabel` is derived from `program.homepageOrder` + total program count (e.g., `Program 01 / 03`). Padded to 2 digits.

`data-cta` attributes:
- Primary: `program-detail-primary` + `data-program={slug}`
- Secondary: `program-detail-secondary` + `data-program={slug}`

#### 2. Who needs it

Section with eyebrow `Who needs this` + PortableText render of `program.whoNeedsIt`. Uses a shared `<ProgramProse>` PortableText components map (defined below).

#### 3. Curriculum outline

Section with eyebrow `Curriculum outline` + PortableText render of `program.curriculumOutline`. Same `<ProgramProse>` config.

#### 4. Exam objectives

Section with eyebrow `Exam objectives` + a 2-column grid (1-col mobile) of `program.examObjectives` as cards. Each card: number index (e.g., `01`) in mono + objective name in serif medium.

#### 5. Outcomes (new schema)

Section with eyebrow `After completion` + numbered list of `program.outcomes`. Numbers in mono accent-light, body in serif medium. Layout: single column, max-w 48rem.

#### 6. Sample lesson preview (new schema)

Section with eyebrow `From a real lesson` + PortableText render of `program.sampleLesson` inside a `bg-[var(--color-surface-alt)]` block with left border accent. Below the lesson: small footnote `→ Full curriculum runs in the live program. Request a proposal to schedule.`

#### 7. Sentinel vs Self-study comparison (new schema)

Implemented as `<SentinelVsSelfStudy rows={program.comparisonSelfStudy} />`. Table with 3 columns: `Category | Sentinel | Self-study`. Header row uses mono uppercase labels. Body rows have alternating row tints. On mobile: stacks each row into a "card" with category label + the two values stacked.

#### 8. Related programs

Implemented as `<RelatedPrograms current={program} all={allPrograms} />`. Renders the OTHER 2 programs as horizontal mini-cards (eyebrow + certName + price + duration + link). Order: maintain `homepageOrder` ascending, excluding current.

#### 9. Final CTA band

Same component as the index page's section 3.

### JSON-LD Course schema

Inject via `<script type="application/ld+json">` in the detail page. Schema:

```ts
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": program.certName,
  "description": program.oneliner,
  "provider": {
    "@type": "Organization",
    "name": "Sentinel Institute",
    "sameAs": "https://sentinelinstitute.com"
  },
  "offers": {
    "@type": "Offer",
    "price": program.priceUSD,
    "priceCurrency": "USD",
    "category": "Enterprise training"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "courseWorkload": `PT${program.sessionsPerWeek * program.durationWeeks * 2}H` // estimate
  }
}
```

---

## Component extraction

The current `src/components/sections/ProgramsOverview.tsx` renders a `<section>` wrapper + card grid. PR 10 splits these:

- **New:** `src/components/sections/ProgramGrid.tsx` — only the inner card grid (the 3-column `<div>`). Takes `programs: ProgramCardData[]`. No surrounding section.
- **Refactored:** `ProgramsOverview` keeps its `<section>` wrapper (preserves `id="programs"` and `scroll-mt-24` from PR 9) but delegates the card grid to `<ProgramGrid programs={programs} />`.

`/programs` index page uses `<ProgramGrid>` directly (no double section nesting).

### New component files

- `src/components/programs/ProgramHero.tsx` — Variant A hero block. Takes `{ program, sequenceLabel }`.
- `src/components/programs/ProgramProse.tsx` — exported `portableTextComponents` config for PortableText render. Headings, paragraphs, lists, marks. Matches the FAQPreview style baseline but tuned for body content (looser line-height, slightly larger).
- `src/components/programs/SentinelVsSelfStudy.tsx` — comparison table component. Takes `{ rows: ComparisonRow[] }`.
- `src/components/programs/RelatedPrograms.tsx` — bottom band component. Takes `{ current: ProgramPage, all: ProgramPage[] }`.

All four live under `src/components/programs/` (new folder) because they're program-detail-specific.

---

## Sanity queries

**File:** `src/lib/sanity/queries.ts`

Add two queries:

```ts
const PROGRAM_DETAIL_FIELDS = `
  _id, slug, certName, eyebrow, oneliner, priceUSD, durationWeeks, sessionsPerWeek,
  whoNeedsIt, curriculumOutline, examObjectives,
  outcomes, sampleLesson, comparisonSelfStudy,
  homepageOrder, seoTitle, seoDescription
`

export async function fetchAllPrograms(): Promise<ProgramPage[]> {
  // Existing fetchHomepageData already pulls program cards (lighter projection).
  // This pulls the full detail set for /programs index + RelatedPrograms.
  const query = `*[_type == "programPage"] | order(homepageOrder asc) { ${PROGRAM_DETAIL_FIELDS} }`
  return (await fetchSanity<ProgramPage[]>(query)) ?? FALLBACK_PROGRAMS
}

export async function fetchProgramBySlug(slug: string): Promise<ProgramPage | null> {
  const query = `*[_type == "programPage" && slug.current == $slug][0] { ${PROGRAM_DETAIL_FIELDS} }`
  const fetched = await fetchSanity<ProgramPage>(query, { slug })
  if (fetched) return fetched
  return FALLBACK_PROGRAMS.find((p) => p.slug === slug) ?? null
}
```

Pattern: live Sanity first, fall back to `FALLBACK_PROGRAMS` on miss. This matches the existing `fetchHomepageData` resilience.

---

## Fallback content

`src/lib/sanity/fallbacks.ts` — extend each of the 3 program entries with:

- `outcomes` (3–5 realistic capability statements per cert)
- `sampleLesson` (single-block PortableText placeholder, ~200 words of editorial copy)
- `comparisonSelfStudy` (4–5 rows covering Schedule, Live instruction, Pass guarantee, Lab access, Compliance docs)
- `curriculumOutline` (was empty `[]` — fill with 3–4 PortableText blocks per program covering module structure)

These are placeholders Marcus can replace via the Sanity dashboard. They ship as real, plausible editorial copy so the page renders well immediately on deploy.

---

## Sitemap

`src/app/sitemap.ts` — add 4 URLs:

```ts
{ url: `${SITE}/programs`, changeFrequency: 'monthly', priority: 0.8 },
{ url: `${SITE}/programs/security-plus`, changeFrequency: 'monthly', priority: 0.7 },
{ url: `${SITE}/programs/cysa-plus`, changeFrequency: 'monthly', priority: 0.7 },
{ url: `${SITE}/programs/casp-plus`, changeFrequency: 'monthly', priority: 0.7 },
```

---

## Quality bars

- `pnpm tsc --noEmit` clean
- `pnpm lint` clean (2 acceptable pre-existing warnings only)
- `pnpm build` clean — route table now shows `/programs` (static) + `/programs/[slug]` (static, 3 prerendered)
- All 4 new URLs return HTTP 200 (verified via `scripts/qa-smoke.py` augmented to probe the 4 routes)
- Branded 404 still returns 404 on `/programs/typo-slug` (regression check)
- JSON-LD `Course` schema valid on each detail page (visual check via DevTools)
- `pnpm audit` zero high/critical
- Each detail page meets Lighthouse ≥ 90 Performance / 100 Accessibility on a local headless run

---

## Open questions / risks

- **PortableText components map shape:** the `ProgramProse` config will need to handle block styles `normal | h2 | h3 | blockquote`, list types `bullet | number`, and marks `strong | em | link`. The FAQPreview map covers some of these; will reuse where applicable and document new ones inline.
- **`comparisonSelfStudy` content quality:** the table only sings if the rows are sharp. Fallback content must show how it should look. If Marcus seeds weak rows the section becomes filler — flagging for content review during the post-deploy QA.
- **Course JSON-LD `courseWorkload`:** estimate is `sessions/week × weeks × 2h per session`. If the real session length differs, schema will be lightly wrong. Acceptable for v1.

## Out-of-band reminders

- After PR 10 ships, the Footer's 3 program detail links + "All Programs" anchor finally lead somewhere real (PR 9 left them hitting the branded 404).
- The homepage's `ProgramsOverview` "Explore the program →" CTAs also start working.
- The dynamic `/programs/[slug]` route's `generateStaticParams` covers the 3 known slugs. Any other slug (typo or future cert) still routes to branded 404 via `notFound()`.
- Sanity Studio CORS for `localhost:3000` still pending operational fix in Sanity dashboard.
