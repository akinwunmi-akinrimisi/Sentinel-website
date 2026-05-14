# PR 11 — Industries Hub · Design

**Date:** 2026-05-14
**Project:** Sentinel Institute marketing site
**Status:** Approved — ready for plan

---

## Context

PR 10 shipped the Programs hub. PR 11 mirrors the pattern for Industries: 1 index page + 6 detail pages (`/industries/{slug}` for the 6 existing fallback industries).

The `industryPage` Sanity schema already exists from PR 4 with `slug`, `industryName`, `complianceMandate`, `complianceMandateFull`, `trainingContext` (PortableText — currently empty in fallbacks), `featuredCaseStudy` (reference, optional), `homepageOrder`, `seoTitle`, `seoDescription`. PR 11 adds **3 new fields** for the "Premium" content depth.

## Scope

### In scope

1. **Schema:** add `complianceClauses`, `riskScenarios`, `recommendedProgramSlugs` to `industryPage`.
2. **Types:** new `ComplianceClause` + `RiskScenario` interfaces; extend `IndustryPage`.
3. **Queries:** new `INDUSTRY_DETAIL_FIELDS` projection + `fetchAllIndustries()` + `fetchIndustryBySlug(slug)` with the `data.length > 0 ? data : FALLBACK_INDUSTRIES` pattern (mirroring PR 10's fetchAllPrograms fix).
4. **Fallbacks:** seed all 6 industries with `trainingContext` (currently `[]`) + 3 new fields. Reference editorial content: `docs/superpowers/seed/pr11-fallbacks-content.md`.
5. **Index page** at `/industries` — hero band + reused IndustryGrid + ProposalCTA.
6. **Detail pages** at `/industries/[slug]` with 7 sections + Variant A hero.
7. **Component extraction:** pull the card grid out of `IndustriesServed` into a reusable `IndustryGrid` (DRY, same pattern as PR 10's ProgramGrid).
8. **New components** in `src/components/industries/`: `IndustryHero` (Variant A), `ComplianceClauses` (numbered citation list), `RiskScenarios` (left-bordered editorial blocks), `FeaturedCaseStudyCard` (compact summary, rendered only if `featuredCaseStudy` linked), `RecommendedPrograms` (1–3 program mini-cards filtered by `recommendedProgramSlugs`).
9. **Sitemap:** add `/industries` + 6 detail URLs.
10. **PortableText components:** reuse `programProseComponents` from PR 10 (already shaped for body content — rename optional to `detailProseComponents` if a future refactor wants it).

### Out of scope

- Results / FAQ / About / Legal pages (PRs 12–14).
- Industry-specific case study writing (the `featuredCaseStudy` reference may be null for most industries — section 5 renders nothing in that case).
- /results/{slug} click-through from the case study card — that route 404s to branded page until PR 12 ships.
- Sanity content seeding by Marcus (operational; fallbacks render until seeded).
- Cross-industry comparison features (e.g., "compare healthcare vs financial-services").

---

## Schema additions

Append to `sanity/schemas/industryPage.ts`:

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

Type definitions in `src/lib/sanity/types.ts`:

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

export interface IndustryPage {
  // ... existing fields
  complianceClauses: ComplianceClause[]
  riskScenarios: RiskScenario[]
  recommendedProgramSlugs: ProgramSlug[]
}
```

---

## Index page · `/industries`

**File:** `src/app/(marketing)/industries/page.tsx`

Server component. ISR `revalidate = 3600`. Fetches `fetchAllIndustries()` + `fetchCompanyStats()` in parallel.

### Sections

1. **Hero band** — bg-surface, full-bleed. Eyebrow `Industries · 06`. H1 "Six industries. One certification track per compliance mandate." Intro body. 2 CTAs (Request Proposal + Book Discovery Call).
2. **Industry grid** — bg-surface-alt. Eyebrow "Choose your sector" + h2 "Built for the regulator who audits you." + `<IndustryGrid industries={industries} />`.
3. **CTA band** — reuse `ProposalCTA` with `companyStats.availableSlots`.

---

## Detail page · `/industries/[slug]`

**File:** `src/app/(marketing)/industries/[slug]/page.tsx`

Server component with:
- `generateStaticParams()` → returns `[{ slug: 'healthcare' }, ... 6 slugs]`
- `generateMetadata({ params })` → reads `seoTitle` / `seoDescription`
- ISR `export const revalidate = 3600`
- Calls `notFound()` if `fetchIndustryBySlug(slug)` returns null

### Sections (top to bottom)

#### 1. Hero — Variant A
Component: `<IndustryHero industry={industry} sequenceLabel={"Industry 01 / 06"} />`.
- Eyebrow: `{industryName} · {sequenceLabel}` (mono accent-light)
- H1: `industryName` (display serif, clamp 2.25-3.25rem)
- Body: `complianceMandateFull` (max-w 36rem)
- Stats row: single stat `Compliance mandate` → `complianceMandate` (more prominent for CISO audience; no price/duration like Programs)
- 2 CTAs: Request Proposal + Book Discovery Call
- `data-cta="industry-detail-{primary|secondary}"` + `data-industry={slug}`

#### 2. Training context
Section with eyebrow `Training context` + PortableText render of `industry.trainingContext` using `programProseComponents` from PR 10.

#### 3. Compliance clauses (new schema)
Component: `<ComplianceClauses clauses={industry.complianceClauses} />`.
- Section with eyebrow `Compliance clauses` + h2 "The specific citations this program addresses."
- Numbered list (1-col mobile / 2-col desktop). Each item: code (mono accent-light) + title (display serif) + description (body).

#### 4. Risk scenarios (new schema)
Component: `<RiskScenarios scenarios={industry.riskScenarios} />`.
- Section with eyebrow `What failed audits look like` + h2 "Real outcomes from teams without certified personnel."
- 2-3 left-bordered editorial blocks. Each: headline (display serif) + narrative (body).

#### 5. Featured case study (existing schema)
Component: `<FeaturedCaseStudyCard caseStudy={industry.featuredCaseStudy} />`.
- **Renders only if** `industry.featuredCaseStudy` is set (the schema reference is optional).
- Compact card: client industry + outcome metrics + buyer quote excerpt + link to `/results/{slug}` (which 404s to branded page until PR 12 ships — acceptable per Phase 2 sequencing).
- If `featuredCaseStudy` is null, the entire section is omitted (no empty placeholder).

#### 6. Recommended programs (new schema)
Component: `<RecommendedPrograms slugs={industry.recommendedProgramSlugs} allPrograms={allPrograms} />`.
- Section with eyebrow `Recommended programs` + h2 "Tracks that fit this risk profile."
- Filters `allPrograms` by `slugs`, renders 1-3 mini-cards (similar to PR 10's RelatedPrograms but driven by an explicit allowlist not "all others").
- Each mini-card links to `/programs/{slug}`.

#### 7. CTA band
ProposalCTA with `companyStats.availableSlots`.

### No JSON-LD on industry pages (v1)
Industry detail pages don't get JSON-LD in v1 — schema.org doesn't have a strong fit for "industry-specific certification training landing page." Course schema lives on /programs/{slug} (PR 10). Revisit if SEO data shows a gap.

---

## Component extraction

The current `src/components/sections/IndustriesServed.tsx` renders a `<section>` wrapper + 6-card grid. PR 11 splits these:

- **New:** `src/components/sections/IndustryGrid.tsx` — only the inner card grid. Takes `industries: IndustryPage[]`. No surrounding section.
- **Refactored:** `IndustriesServed` keeps its `<section>` wrapper (preserves `id="industries"` and `scroll-mt-24` from PR 9) but delegates the grid to `<IndustryGrid industries={industries} />`.

`/industries` index page uses `<IndustryGrid>` directly.

### New component files (in `src/components/industries/`)

- `IndustryHero.tsx` — Variant A hero, takes `{ industry, sequenceLabel }`.
- `ComplianceClauses.tsx` — takes `{ clauses: ComplianceClause[] }`.
- `RiskScenarios.tsx` — takes `{ scenarios: RiskScenario[] }`.
- `FeaturedCaseStudyCard.tsx` — takes `{ caseStudy: CaseStudy | null | undefined }`. Renders null if not provided.
- `RecommendedPrograms.tsx` — takes `{ slugs: ProgramSlug[], allPrograms: ProgramPage[] }`. Filters and renders.

All 5 in `src/components/industries/` (new folder).

---

## Sanity queries

**File:** `src/lib/sanity/queries.ts`

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

export async function fetchAllIndustries(): Promise<IndustryPage[]> {
  const data = await safeFetch<IndustryPage[]>(allIndustryDetailsQuery, [])
  return data.length > 0 ? data : FALLBACK_INDUSTRIES
}

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

The `fetchAllIndustries` uses the corrected `data.length > 0` fallback pattern from PR 10.

The `featuredCaseStudy` reference is projected inline so the detail page doesn't need a separate fetch (Sanity dereferences via `->{}` syntax).

---

## Fallback content

`src/lib/sanity/fallbacks.ts` — for each of 6 industries:

- Fill `trainingContext` (currently `[]`)
- Add `complianceClauses` (4 per industry, except Legal which has 3)
- Add `riskScenarios` (2 per industry)
- Add `recommendedProgramSlugs` (1-2 slugs per industry)

Exact editorial content per industry: see `docs/superpowers/seed/pr11-fallbacks-content.md`.

PortableText `_key` namespacing: `h-tc-*` (healthcare), `f-tc-*` (financial), `d-tc-*` (defense), `u-tc-*` (utilities), `i-tc-*` (insurance), `l-tc-*` (legal). No collisions with PR 10's `sp-`, `cs-`, `cp-` prefixes.

---

## Sitemap

`src/app/sitemap.ts` — add 7 URLs:

```ts
{ url: `${SITE_URL}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
{ url: `${SITE_URL}/industries/healthcare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
{ url: `${SITE_URL}/industries/financial-services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
{ url: `${SITE_URL}/industries/government-defense`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
{ url: `${SITE_URL}/industries/utilities`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
{ url: `${SITE_URL}/industries/insurance`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
{ url: `${SITE_URL}/industries/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

---

## Quality bars

- `pnpm tsc --noEmit` + `lint` + `build` clean
- Build route table shows `/industries` (static) + `/industries/[slug]` (● SSG, 6 prerendered)
- All 7 new URLs return HTTP 200
- `/industries/typo-slug` still hits branded 404 (PR 9 regression check)
- `RecommendedPrograms` shows the correct subset per industry (e.g., Healthcare shows Security+ + CySA+ only, not CASP+)
- Featured case study section is omitted on industries that don't have `featuredCaseStudy` set (fallbacks don't set it; verify via inspection)
- `pnpm audit` zero high/critical

---

## Open questions / risks

- **Featured case study URL:** the card links to `/results/{slug}` which 404s until PR 12 ships. Acceptable per Phase 2 sequencing; visitors hit the branded 404.
- **`recommendedProgramSlugs` validation:** Sanity validates `min(1).max(3).unique()` but doesn't enforce slug-existence against the ALLOWED_SLUGS in `programPage.ts`. If Marcus ever adds a 4th program slug, the dropdown won't auto-update — Sanity schema option lists are static. Acceptable trade-off; the editor can correct manually.

## Out-of-band reminders

- After PR 11 ships, Footer's 3 industry detail links (`/industries/financial-services`, `/industries/healthcare`, `/industries/government-defense`) finally lead somewhere real.
- Footer's "All Industries" link still anchors to `/#industries` (homepage). Consider updating to `/industries` (real hub) in a follow-up.
- Homepage IndustriesServed cards' "Industry detail →" CTAs now work.
- Sanity Studio CORS for `localhost:3000` still pending operational fix.
