# PR 12 — Results Hub · Design

**Date:** 2026-05-14
**Project:** Sentinel Institute marketing site
**Status:** Approved — ready for plan

---

## Context

PR 11 shipped /industries with `FeaturedCaseStudyCard` linking to `/results/{slug}` (which currently 404s). PR 12 builds the real /results hub. The `caseStudy` Sanity schema is already rich (PR 4) — `challenge`, `solution`, `outcome` as PortableText, `outcomeMetrics`, buyer quote + headshot, certifications passed, etc. PR 12 adds **2 new fields** for Premium depth: `timeline` (chronological milestones) and `roi` (single ROI statement).

The fallbacks currently contain 1 case study (`healthcare-hipaa-security-plus`). PR 12 builds the page template that scales as Marcus seeds more.

## Scope

### In scope

1. **Schema:** add `timeline` (array of date+headline+description) + `roi` (string) to `caseStudy`.
2. **Types:** add `TimelineMilestone`; extend `CaseStudy`.
3. **Queries:** `CASE_STUDY_DETAIL_FIELDS` projection + `fetchAllCaseStudies()` + `fetchCaseStudyBySlug()` with length-check fallback pattern.
4. **Fallbacks:** fill `challenge`/`solution`/`outcome` (currently `[]`) + add `timeline` and `roi` for the single existing case study. Editorial content per `docs/superpowers/seed/pr12-fallbacks-content.md`.
5. **Index page** `/results` — hero band + editorial list of case study cards + ProposalCTA.
6. **Detail page** `/results/[slug]` with 10 sections + Variant A hero.
7. **New components** in `src/components/results/`: `ResultsHero` (Variant A), `CaseStudyTimeline` (milestone list), `CaseStudyROI` (large editorial ROI statement), `ResultsCard` (full-width editorial card for the index page), `RecommendedPrograms` reused from `src/components/industries/` (driven by `certificationsPassed` instead of slug map).
8. **Sitemap:** add `/results` + 1 detail URL.
9. **Reuse:** `programProseComponents` for PortableText body content.

### Out of scope

- FAQ / About / Legal (PRs 13-14)
- Updating `FeaturedCaseStudyCard` (PR 11's component) to add visual link affordance — the existing `Read the full case →` text-link is fine
- Generating more case studies — schema is the multiplier; Marcus seeds via Sanity

---

## Schema additions

Append to `sanity/schemas/caseStudy.ts`:

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

Type extensions in `types.ts`:

```ts
export interface TimelineMilestone {
  date: string
  headline: string
  description: string
}

export interface CaseStudy {
  // ... existing fields
  timeline: TimelineMilestone[]
  roi: string
}
```

---

## Index page · `/results`

**File:** `src/app/(marketing)/results/page.tsx`

Server component. ISR `revalidate = 3600`. Fetches `fetchAllCaseStudies()` + `fetchCompanyStats()` in parallel.

### Sections

1. **Hero band** — bg-surface. Eyebrow `Results · {count}`. H1 "Outcomes that hold up under audit." Intro body. 2 CTAs.
2. **Case study list** — bg-surface-alt. Renders `<ResultsCard caseStudy={cs} />` for each case study (currently 1; scales to N).
3. **CTA band** — `ProposalCTA` with companyStats.availableSlots.

The editorial list of full-width cards is intentional — a 1-card grid would look bare. Editorial cards work at any count from 1 to 20+.

---

## Detail page · `/results/[slug]`

**File:** `src/app/(marketing)/results/[slug]/page.tsx`

Server component with `generateStaticParams()` returning all available slugs (initially 1), `generateMetadata`, ISR, and `notFound()` guard.

### Sections (top to bottom)

#### 1. Hero — Variant A
Component: `<ResultsHero caseStudy={cs} sequenceLabel={"Case 01 / N"} />`.
- Eyebrow: `{clientIndustry} · {complianceDriver} · {sequenceLabel}`
- H1: derived from `clientIndustryAnonymized ?? clientIndustry` + complianceDriver (e.g., "Health System, Northeast — HIPAA")
- Body: lead-in summary derived from buyer + team + weeks
- Stats row: team size · weeks to cert · certifications passed
- 2 CTAs

#### 2. Challenge (PortableText)
Section with eyebrow `The challenge`. PortableText render of `cs.challenge`.

#### 3. Solution (PortableText)
Section with eyebrow `The solution`. PortableText render of `cs.solution`.

#### 4. Outcome (PortableText)
Section with eyebrow `The outcome`. PortableText render of `cs.outcome`.

#### 5. Outcome metrics
Grid of `cs.outcomeMetrics` (1-6 items). Each: large value + label.

#### 6. Timeline (new schema)
Component: `<CaseStudyTimeline milestones={cs.timeline} />`. Vertical chronological list with date markers + headline + description.

#### 7. ROI (new schema)
Component: `<CaseStudyROI text={cs.roi} />`. Single large editorial statement, centered, on accent-tinted background.

#### 8. Buyer testimonial
Compact block: buyerQuote + headshot + buyerName / buyerTitle / industry label.

#### 9. Recommended programs
Reuse `RecommendedPrograms` from `src/components/industries/` (already filters by ProgramSlug[]). Pass `slugs = cs.certificationsPassed` mapped to slug form (e.g., 'Security+' → 'security-plus').

#### 10. CTA band
`ProposalCTA` with companyStats.availableSlots.

### No JSON-LD on case study pages in v1
Schema.org's `Article` or `Case study` schema is awkward fit. Revisit if SEO data demands.

---

## New components

In `src/components/results/`:

- `ResultsHero.tsx` — Variant A hero, takes `{ caseStudy, sequenceLabel }`.
- `CaseStudyTimeline.tsx` — chronological vertical list with date markers.
- `CaseStudyROI.tsx` — large centered editorial statement.
- `ResultsCard.tsx` — full-width editorial card for the index page (buyer quote + headshot + metrics inline + link to detail).

Reused (not new):
- `RecommendedPrograms` from `src/components/industries/` — pass slugs derived from certificationsPassed.

---

## Sanity queries

In `src/lib/sanity/queries.ts`:

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

Note: fallback is the single `FALLBACK_CASE_STUDY` object, wrapped in an array for `fetchAllCaseStudies`. If Marcus seeds more, this still works (Sanity returns the larger set, fallback only kicks in on total miss).

---

## Sitemap

Add 2 URLs after the `/industries/legal` entry:

```ts
{ url: `${SITE_URL}/results`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
{ url: `${SITE_URL}/results/healthcare-hipaa-security-plus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

Update trailing comment to `// Future PRs add /about, /faq.`

---

## Quality bars

- `pnpm tsc --noEmit` + `lint` + `build` clean
- Build route table shows `/results` (static) + `● /results/[slug]` (1 prerendered)
- All 2 new URLs return HTTP 200
- `/results/typo-slug` still hits branded 404 (PR 9 regression check)
- Recommended programs derived from `certificationsPassed` show correct subset (Healthcare case study certs are Security+ + CySA+ → mini-cards link to those 2)
- `pnpm audit` zero high/critical

---

## Open questions / risks

- **certificationsPassed → ProgramSlug mapping:** `['Security+', 'CySA+', 'CASP+']` → `['security-plus', 'cysa-plus', 'casp-plus']`. Implement as a simple lookup in the detail page or shared util. If a future case study includes a non-CompTIA cert (e.g., 'CISSP'), the RecommendedPrograms filter silently drops it (no /programs/cissp page exists).
- **Single case study:** the index page lists 1 card today. If that feels too sparse on visual review, consider adding a small "More case studies launching Q3 2026" message at the bottom of the list — but only after seeing the live rendering.

## Out-of-band reminders

- PR 11's `FeaturedCaseStudyCard` links to `/results/{slug}` finally lead somewhere after PR 12 ships.
- Marcus's fallback case study has empty `buyerHeadshot.url` — the `SanityAvatar` component handles fallback to initials, so the page still looks clean.
- Sanity Studio CORS for `localhost:3000` still pending operational fix.
