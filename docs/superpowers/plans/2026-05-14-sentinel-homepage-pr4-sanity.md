# Sentinel Homepage — PR 4: Sanity Schemas + Studio + ISR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the 8 Sanity document schemas locked in spec §6, mount an embedded Sanity Studio at `/studio`, replace the hardcoded `HERO_STATS` / `PRESS_OUTLETS` / `CLIENT_INDUSTRIES` constants with Sanity-driven data, wire Incremental Static Regeneration (revalidate = 3600), and add `/api/revalidate` for webhook-driven on-demand revalidation. Editorial seeding is deferred to the content team via a checklist doc — this PR ships the data layer, not the content.

**Architecture:** Schemas live in `sanity/schemas/<docType>.ts`, exported as one array from `sanity/schemas/index.ts`. The existing `sanity/sanity.config.ts` gains `basePath: '/studio'` and a singleton document-actions filter for `companyStats`. The Studio mounts as a Next.js dynamic route at `src/app/studio/[[...tool]]/page.tsx` using `next-sanity/studio`'s `<NextStudio>` component (next-sanity v12 pattern). The homepage server component resolves all GROQ queries in parallel via `Promise.all`, falls back to constants in `src/lib/sanity/fallbacks.ts` when any query returns null/empty, and passes typed props into `<Hero />` and `<TrustBar />`. `/api/revalidate` is a `POST` route guarded by `SANITY_REVALIDATE_SECRET` (URL query param) that calls `revalidatePath('/')` plus `revalidateTag('sanity:<type>')` on body's `_type`.

**Tech Stack:** Next.js 16.2.6 (App Router, server-first) · Tailwind v4 · TypeScript 5.9 strict · `sanity` 5.x + `next-sanity` 12.x + `@sanity/client` 7.x (all already in `package.json`) · `@sanity/image-url` 2.x · IBM Plex (via `@fontsource`).

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` §3.1 (file structure), §4.1 (read path), §4.3 (hardcoded ↔ Sanity boundary), §6 (all 8 schemas + validation patterns + GROQ queries), §7 (error handling — Sanity-down fallback), §10 (server-only token), §11.1 PR 4.

**Conventions:** `docs/CONVENTIONS.md` — Sentinel `var()` tokens vs shadcn bridge semantic classes; one section = one file.

**Stack patch:** `STACK_CORRECTIONS.md` — Tailwind v4 (no `tailwind.config.ts`), no `_smoke` folder, audit override block in `package.json`.

**Out of scope for PR 4 (deferred):**
- Real editorial content (the content team will seed via Studio after this PR ships — see `docs/seed-data-pr4.md` produced in Task 16).
- Image asset uploads (Marcus / editorial team will upload via Studio).
- Programs / case-study / testimonials / industries / FAQ rendering on the homepage (`<ProgramsOverview>`, `<ResultsByProgram>`, `<CaseStudyFeature>`, `<Testimonials>`, `<IndustriesServed>`, `<FAQPreview>` belong to PRs 5 and 7). PR 4 only swaps **Hero** (companyStats numbers + pressMentions band) and **TrustBar** (companyStats caption + clientLogos strip) to read from Sanity. The other six section components don't exist yet.
- `next-themes` / dark-mode toggle (not needed; site is single-theme).
- `@sanity/webhook` signature verification — we use a shared secret in the webhook URL query string instead. Adding the dep is deferred until the editorial team requests it.

---

## Prerequisite — User action required before Task 1

Sanity Studio cannot start without a real `projectId`. The user must run the interactive Sanity CLI **once** to:
1. Authenticate (`sanity login`).
2. Create or select a project.
3. Pick `production` as the default dataset.
4. Generate a read+write token for server-side fetches.

This step is **manual** because it requires browser-based login and project selection. Treat it as the gate that unblocks every task below.

**User instructions (paste into your terminal):**

```bash
# From the project root:
pnpm dlx sanity@latest login
pnpm dlx sanity@latest init --create-project "Sentinel Institute" --dataset production
# After init completes, copy the printed projectId.
# Then generate an API token via https://www.sanity.io/manage → API → Tokens → "Add Token"
#   Name: sentinel-server-readwrite
#   Permissions: Editor (read+write)
```

Then update `.env.local` with the captured values (NEVER commit `.env.local`):

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=<paste-project-id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<paste-readwrite-token>
SANITY_REVALIDATE_SECRET=<generate-a-32-char-random-string>
```

Generate the revalidate secret on Windows PowerShell:

```powershell
[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

Also append the same four keys to `.env.example` (no values) — committed.

**Agent: STOP and request user confirmation before starting Task 1.** If the user reports the `.env.local` values are in place, proceed.

---

## File Structure for This PR

```
sanity/
├── schemas/
│   ├── index.ts                   MODIFY: import + export all 9 schemaTypes
│   ├── blockContent.ts            CREATE: shared Portable Text object (used by 5 docs)
│   ├── companyStats.ts            CREATE: singleton — stats numbers
│   ├── testimonial.ts             CREATE: client quote w/ portrait, video
│   ├── caseStudy.ts               CREATE: full case study doc
│   ├── programPage.ts             CREATE: exactly-3 program docs (Sec+, CySA+, CASP+)
│   ├── industryPage.ts            CREATE: 6+ industry docs w/ compliance mandates
│   ├── faq.ts                     CREATE: question + Portable Text answer
│   ├── pressMention.ts            CREATE: outlet + article URL + logo
│   └── clientLogo.ts              CREATE: client / anonymized industry strip
└── sanity.config.ts               MODIFY: add basePath '/studio' + singleton document.actions

src/lib/sanity/
├── client.ts                      MODIFY: split read (CDN) + write (token) clients
├── queries.ts                     REPLACE: 8 GROQ queries per spec §6.10 + typed fetchers
├── types.ts                       CREATE: TS types matching schemas (consumed by sections)
└── fallbacks.ts                   CREATE: last-resort constants for Hero + TrustBar

src/app/
├── studio/[[...tool]]/page.tsx    CREATE: NextStudio mount
└── api/revalidate/route.ts        CREATE: secret-guarded POST → revalidatePath + revalidateTag

src/app/(marketing)/page.tsx       MODIFY: export const revalidate = 3600; Promise.all fetch; pass props

src/components/sections/
├── Hero.tsx                       MODIFY: accept stats + pressOutlets props; drop HERO_STATS / PRESS_OUTLETS constants
└── TrustBar.tsx                   MODIFY: accept enterpriseClients + clientLabels props; drop CLIENT_INDUSTRIES constant

docs/
└── seed-data-pr4.md               CREATE: content-team seed checklist (Marcus)

.env.example                       MODIFY: add SANITY_REVALIDATE_SECRET line
```

---

## Task 1 — Shared `blockContent` Portable Text object

Used by `caseStudy.challenge/solution/outcome`, `programPage.whoNeedsIt/curriculumOutline`, `industryPage.trainingContext`, and `faq.answer`. Lives in its own file so all 5 consumers reference one canonical Portable Text config.

**Files:**
- Create: `sanity/schemas/blockContent.ts`

- [ ] **Step 1: Create `sanity/schemas/blockContent.ts`**

```ts
import { defineType, defineArrayMember } from 'sanity'

/**
 * Shared Portable Text array used by every document type that needs rich text:
 *   caseStudy (challenge, solution, outcome)
 *   programPage (whoNeedsIt, curriculumOutline)
 *   industryPage (trainingContext)
 *   faq (answer)
 *
 * Locked to a constrained set of styles + marks per the brand voice — no H1
 * (the page owns H1), no code blocks, no decorations beyond strong + em + links.
 * Link marks enforce HTTPS-only per spec §6.9.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.required().uri({
                    scheme: ['https'],
                  }),
              },
            ],
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/blockContent.ts
git commit -m "feat(pr4): add shared blockContent Portable Text schema"
```

---

## Task 2 — `companyStats` singleton schema

Singleton enforced two ways: (1) `__experimental_singleton: true` flag (cosmetic — hides "Create new" in default Studio structure), (2) `document.actions` filter in `sanity.config.ts` to remove `duplicate` and `delete` actions (real enforcement). The `defineType` lives here; the config change goes in Task 9.

**Files:**
- Create: `sanity/schemas/companyStats.ts`

- [ ] **Step 1: Create `sanity/schemas/companyStats.ts`**

```ts
import { defineType, defineField } from 'sanity'

const rateField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'number',
    validation: (Rule) =>
      Rule.required().integer().min(0).max(100),
  })

const countField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'number',
    validation: (Rule) => Rule.required().integer().min(0),
  })

/**
 * Singleton — exactly one document of this type may exist.
 * Enforcement: see sanity.config.ts document.actions filter (Task 9).
 *
 * Drives:
 *   - <Hero> stat pillar (passRate / professionalsCertified / enterpriseClients / auditsPassed)
 *   - <TrustBar> caption ("{enterpriseClients} enterprise clients certified...")
 *   - <ResultsByProgram> per-program pass rates (PR 5)
 *   - <ProposalCTA> "{availableSlots} spots remaining" callout (PR 7)
 */
export const companyStats = defineType({
  name: 'companyStats',
  title: 'Company Stats (singleton)',
  type: 'document',
  fields: [
    rateField('passRate', 'Overall first-attempt pass rate (%)'),
    countField('professionalsCertified', 'Professionals certified'),
    countField('enterpriseClients', 'Enterprise clients'),
    countField('auditsPassed', 'Compliance audits passed'),
    countField('averageWeeks', 'Average weeks to certification'),
    countField('availableSlots', 'Available slots (next cohort)'),
    rateField('passRateSecurityPlus', 'Security+ first-attempt pass rate (%)'),
    rateField('passRateCySAPlus', 'CySA+ first-attempt pass rate (%)'),
    rateField('passRateCASPPlus', 'CASP+ first-attempt pass rate (%)'),
    countField('avgWeeksSecurityPlus', 'Security+ avg weeks to certification'),
    countField('avgWeeksCySAPlus', 'CySA+ avg weeks to certification'),
    countField('avgWeeksCASPPlus', 'CASP+ avg weeks to certification'),
    defineField({
      name: 'asOfDate',
      title: 'As of (date these numbers were measured)',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { passRate: 'passRate', asOf: 'asOfDate' },
    prepare: ({ passRate, asOf }) => ({
      title: 'Company Stats',
      subtitle: `${passRate ?? '–'}% pass rate · as of ${
        asOf ? new Date(asOf).toLocaleDateString() : '—'
      }`,
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/companyStats.ts
git commit -m "feat(pr4): add companyStats singleton schema"
```

---

## Task 3 — `testimonial` schema

Spec §6.2. Required: `fullName`, `title`, `company`, `industry`, `quote`, `portrait` (with alt). Optional: `industryAnonymized`, `videoUrl` (HTTPS), `featured`, `order`.

**Files:**
- Create: `sanity/schemas/testimonial.ts`

- [ ] **Step 1: Create `sanity/schemas/testimonial.ts`**

```ts
import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      type: 'string',
      title: 'Full name',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Job title',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'company',
      type: 'string',
      title: 'Company',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'industry',
      type: 'string',
      title: 'Industry',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'industryAnonymized',
      type: 'string',
      title: 'Anonymized industry label (shown instead of company)',
      description: 'Set this if the client requires anonymization (e.g., "Regional Bank, Midwest").',
    }),
    defineField({
      name: 'quote',
      type: 'text',
      title: 'Quote',
      rows: 4,
      validation: (Rule) =>
        Rule.required()
          .min(40)
          .max(420)
          .custom((value) => {
            if (!value) return true
            const lineCount = value.split('\n').length
            return lineCount <= 5 || 'Maximum 5 lines'
          }),
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required().min(4),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL (optional)',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { name: 'fullName', company: 'company', featured: 'featured', media: 'portrait' },
    prepare: ({ name, company, featured, media }) => ({
      title: `${name} — ${company}`,
      subtitle: featured ? 'Featured' : 'Unlisted',
      media,
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/testimonial.ts
git commit -m "feat(pr4): add testimonial schema"
```

---

## Task 4 — `caseStudy` schema

Spec §6.3. Uses `blockContent` for the three narrative fields; uses a nested object array for outcome metrics.

**Files:**
- Create: `sanity/schemas/caseStudy.ts`

- [ ] **Step 1: Create `sanity/schemas/caseStudy.ts`**

```ts
import { defineType, defineField, defineArrayMember } from 'sanity'

const COMPLIANCE_DRIVERS = [
  { title: 'HIPAA', value: 'HIPAA' },
  { title: 'PCI-DSS', value: 'PCI-DSS' },
  { title: 'CMMC', value: 'CMMC' },
  { title: 'SOC 2', value: 'SOC 2' },
  { title: 'NIST CSF', value: 'NIST CSF' },
  { title: 'NERC CIP', value: 'NERC CIP' },
  { title: 'Other', value: 'Other' },
]

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: (doc) => `${doc.clientIndustry ?? ''}-${doc.complianceDriver ?? ''}`,
        maxLength: 60,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientIndustry',
      type: 'string',
      title: 'Client industry',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientIndustryAnonymized',
      type: 'string',
      title: 'Anonymized industry label (optional)',
    }),
    defineField({
      name: 'complianceDriver',
      type: 'string',
      title: 'Compliance driver',
      options: { list: COMPLIANCE_DRIVERS, layout: 'dropdown' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teamSize',
      type: 'number',
      title: 'Team size',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'weeksToCertification',
      type: 'number',
      title: 'Weeks to certification',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'certificationsPassed',
      type: 'array',
      title: 'Certifications passed',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'buyerName',
      type: 'string',
      title: 'Buyer name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerTitle',
      type: 'string',
      title: 'Buyer title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerHeadshot',
      type: 'image',
      title: 'Buyer headshot',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerQuote',
      type: 'text',
      title: 'Buyer quote',
      rows: 3,
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true
          return value.split('\n').length <= 4 || 'Maximum 4 lines'
        }),
    }),
    defineField({
      name: 'challenge',
      type: 'blockContent',
      title: 'Challenge',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'solution',
      type: 'blockContent',
      title: 'Solution',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outcome',
      type: 'blockContent',
      title: 'Outcome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outcomeMetrics',
      type: 'array',
      title: 'Outcome metrics',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', value: 'value' },
            prepare: ({ label, value }) => ({ title: `${value} — ${label}` }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(6),
    }),
    defineField({
      name: 'clientLogo',
      type: 'image',
      title: 'Client logo (optional, used only if not anonymized)',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),
    defineField({
      name: 'publishedDate',
      type: 'datetime',
      title: 'Published date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: { industry: 'clientIndustry', driver: 'complianceDriver', featured: 'featured' },
    prepare: ({ industry, driver, featured }) => ({
      title: `${industry} — ${driver}`,
      subtitle: featured ? 'Featured' : 'Unlisted',
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/caseStudy.ts
git commit -m "feat(pr4): add caseStudy schema"
```

---

## Task 5 — `programPage` schema

Spec §6.4. Slug constrained to the three certified products. `examObjectives` is a string array.

**Files:**
- Create: `sanity/schemas/programPage.ts`

- [ ] **Step 1: Create `sanity/schemas/programPage.ts`**

```ts
import { defineType, defineField, defineArrayMember } from 'sanity'

const ALLOWED_SLUGS = ['security-plus', 'cysa-plus', 'casp-plus'] as const

export const programPage = defineType({
  name: 'programPage',
  title: 'Program Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'certName', maxLength: 30 },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          const value = (slug as { current?: string } | undefined)?.current
          if (!value) return 'Slug is required'
          return (ALLOWED_SLUGS as readonly string[]).includes(value)
            ? true
            : `Slug must be one of: ${ALLOWED_SLUGS.join(', ')}`
        }),
    }),
    defineField({
      name: 'certName',
      type: 'string',
      title: 'Certification name',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow label',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'oneliner',
      type: 'text',
      title: 'One-liner',
      rows: 2,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'priceUSD',
      type: 'number',
      title: 'Price (USD)',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'durationWeeks',
      type: 'number',
      title: 'Duration (weeks)',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'sessionsPerWeek',
      type: 'number',
      title: 'Sessions per week',
      validation: (Rule) => Rule.required().integer().min(1).max(7),
    }),
    defineField({
      name: 'whoNeedsIt',
      type: 'blockContent',
      title: 'Who needs it',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'curriculumOutline',
      type: 'blockContent',
      title: 'Curriculum outline',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'examObjectives',
      type: 'array',
      title: 'Exam objectives',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'homepageOrder',
      type: 'number',
      title: 'Homepage display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO title',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO description',
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
  ],
  preview: {
    select: { name: 'certName', slug: 'slug.current', price: 'priceUSD' },
    prepare: ({ name, slug, price }) => ({
      title: name ?? slug ?? 'Program',
      subtitle: price !== undefined ? `$${price.toLocaleString()}` : '—',
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/programPage.ts
git commit -m "feat(pr4): add programPage schema (3 slugs locked)"
```

---

## Task 6 — `industryPage` schema

Spec §6.5. Optional reference to a `caseStudy`.

**Files:**
- Create: `sanity/schemas/industryPage.ts`

- [ ] **Step 1: Create `sanity/schemas/industryPage.ts`**

```ts
import { defineType, defineField } from 'sanity'

export const industryPage = defineType({
  name: 'industryPage',
  title: 'Industry Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'industryName', maxLength: 60 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'industryName',
      type: 'string',
      title: 'Industry name',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'complianceMandate',
      type: 'string',
      title: 'Compliance mandate (short)',
      description: 'e.g., "HIPAA Security Rule § 164.308"',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'complianceMandateFull',
      type: 'text',
      title: 'Compliance mandate (full)',
      rows: 3,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'trainingContext',
      type: 'blockContent',
      title: 'Training context',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredCaseStudy',
      type: 'reference',
      title: 'Featured case study (optional)',
      to: [{ type: 'caseStudy' }],
    }),
    defineField({
      name: 'homepageOrder',
      type: 'number',
      title: 'Homepage display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO title',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO description',
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
  ],
  preview: {
    select: { name: 'industryName', mandate: 'complianceMandate' },
    prepare: ({ name, mandate }) => ({
      title: name ?? 'Industry',
      subtitle: mandate,
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/industryPage.ts
git commit -m "feat(pr4): add industryPage schema"
```

---

## Task 7 — `faq` schema

Spec §6.6. Category constrained list.

**Files:**
- Create: `sanity/schemas/faq.ts`

- [ ] **Step 1: Create `sanity/schemas/faq.ts`**

```ts
import { defineType, defineField } from 'sanity'

const FAQ_CATEGORIES = [
  { title: 'General', value: 'general' },
  { title: 'Programs', value: 'programs' },
  { title: 'Pricing', value: 'pricing' },
  { title: 'Logistics', value: 'logistics' },
  { title: 'Compliance', value: 'compliance' },
]

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      title: 'Question',
      validation: (Rule) => Rule.required().min(8).max(160),
    }),
    defineField({
      name: 'answer',
      type: 'blockContent',
      title: 'Answer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      options: { list: FAQ_CATEGORIES, layout: 'dropdown' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { q: 'question', cat: 'category', featured: 'featured' },
    prepare: ({ q, cat, featured }) => ({
      title: q,
      subtitle: `${cat ?? '—'}${featured ? ' · Featured' : ''}`,
    }),
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schemas/faq.ts
git commit -m "feat(pr4): add faq schema"
```

---

## Task 8 — `pressMention` + `clientLogo` schemas

Two small list types. Both serve the trust band on the homepage. Grouped into one task because each is ~40 lines.

**Files:**
- Create: `sanity/schemas/pressMention.ts`
- Create: `sanity/schemas/clientLogo.ts`

- [ ] **Step 1: Create `sanity/schemas/pressMention.ts`**

```ts
import { defineType, defineField } from 'sanity'

export const pressMention = defineType({
  name: 'pressMention',
  title: 'Press Mention',
  type: 'document',
  fields: [
    defineField({
      name: 'outletName',
      type: 'string',
      title: 'Outlet name',
      description: 'e.g., "SC Magazine", "Dark Reading", "CyberScoop"',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'articleTitle',
      type: 'string',
      title: 'Article title',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'Article URL',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'publishedDate',
      type: 'datetime',
      title: 'Published date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Outlet logo',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showOnHero',
      type: 'boolean',
      title: 'Show on hero press band',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { outlet: 'outletName', title: 'articleTitle' },
    prepare: ({ outlet, title }) => ({ title: outlet, subtitle: title }),
  },
})
```

- [ ] **Step 2: Create `sanity/schemas/clientLogo.ts`**

```ts
import { defineType, defineField } from 'sanity'

const DISPLAY_AS = [
  { title: 'Logo', value: 'logo' },
  { title: 'Industry text (anonymized)', value: 'industry-text' },
]

export const clientLogo = defineType({
  name: 'clientLogo',
  title: 'Client Logo',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      type: 'string',
      title: 'Company name (internal)',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'anonymizedAs',
      type: 'string',
      title: 'Anonymized label (shown publicly if displayAs = "industry-text")',
      description: 'e.g., "Regional Bank, Midwest"',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),
    defineField({
      name: 'displayAs',
      type: 'string',
      title: 'Display as',
      options: { list: DISPLAY_AS, layout: 'radio' },
      initialValue: 'industry-text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { name: 'companyName', anon: 'anonymizedAs', mode: 'displayAs', media: 'logo' },
    prepare: ({ name, anon, mode, media }) => ({
      title: anon ?? name,
      subtitle: mode === 'logo' ? 'Logo' : 'Industry text',
      media,
    }),
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add sanity/schemas/pressMention.ts sanity/schemas/clientLogo.ts
git commit -m "feat(pr4): add pressMention + clientLogo schemas"
```

---

## Task 9 — Wire schemas into index + Studio basePath + singleton enforcement

Updates `sanity/schemas/index.ts` to export all 9 schemaTypes (8 documents + `blockContent`), and updates `sanity/sanity.config.ts` to (a) mount under `/studio`, (b) filter `duplicate` and `delete` actions for `companyStats`, (c) restructure the desk to show `companyStats` as a singleton item.

**Files:**
- Modify: `sanity/schemas/index.ts` (replace entire body)
- Modify: `sanity/sanity.config.ts` (replace entire body)

- [ ] **Step 1: Replace `sanity/schemas/index.ts`**

```ts
import type { SchemaTypeDefinition } from 'sanity'

import { blockContent } from './blockContent'
import { companyStats } from './companyStats'
import { testimonial } from './testimonial'
import { caseStudy } from './caseStudy'
import { programPage } from './programPage'
import { industryPage } from './industryPage'
import { faq } from './faq'
import { pressMention } from './pressMention'
import { clientLogo } from './clientLogo'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Shared
  blockContent,
  // Documents
  companyStats,
  testimonial,
  caseStudy,
  programPage,
  industryPage,
  faq,
  pressMention,
  clientLogo,
]
```

- [ ] **Step 2: Replace `sanity/sanity.config.ts`**

```ts
import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/**
 * Singleton list builder for companyStats — shows the single document directly
 * instead of an empty "Create new" list.
 */
const singletonDocs = ['companyStats']
const listableDocs = [
  'testimonial',
  'caseStudy',
  'programPage',
  'industryPage',
  'faq',
  'pressMention',
  'clientLogo',
]

export default defineConfig({
  name: 'sentinel-institute',
  title: 'Sentinel Institute CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Sentinel Institute')
          .items([
            // Singletons
            S.listItem()
              .title('Company Stats')
              .id('companyStats')
              .child(
                S.editor()
                  .id('companyStats')
                  .schemaType('companyStats')
                  .documentId('companyStats')
              ),
            S.divider(),
            // List types
            ...listableDocs.map((typeName) =>
              S.documentTypeListItem(typeName).title(
                typeName.charAt(0).toUpperCase() + typeName.slice(1)
              )
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Hide singleton docs from the global "New document" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonDocs.includes(schemaType)),
  },
  document: {
    // Strip duplicate + delete from singleton docs.
    actions: (prev, { schemaType }) =>
      singletonDocs.includes(schemaType)
        ? prev.filter(
            ({ action }) => !['duplicate', 'delete', 'unpublish'].includes(action ?? '')
          )
        : prev,
    // Force companyStats to use the fixed documentId.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter(({ templateId }) => !singletonDocs.includes(templateId))
        : prev,
  },
})
```

- [ ] **Step 3: Smoke-check Sanity config compiles**

Run: `pnpm tsc --noEmit -p tsconfig.json`

Expected: zero errors. (If `tsconfig.json` excludes the `sanity/` directory, run `pnpm dlx tsc --noEmit sanity/sanity.config.ts sanity/schemas/index.ts` instead — adjust the `include` paths in `tsconfig.json` if needed so Studio code is type-checked.)

- [ ] **Step 4: Commit**

```bash
git add sanity/schemas/index.ts sanity/sanity.config.ts
git commit -m "feat(pr4): wire schemas into index + singleton enforcement + /studio basePath"
```

---

## Task 10 — TypeScript types in `src/lib/sanity/types.ts`

One file with TS types matching every schema. These are the **shapes the GROQ queries return** (with image asset URLs resolved by Sanity's image projection), not the raw document shapes. The Hero / TrustBar / future section components import from here.

**Files:**
- Create: `src/lib/sanity/types.ts`

- [ ] **Step 1: Create `src/lib/sanity/types.ts`**

```ts
/**
 * TypeScript types that mirror the Sanity schemas in `sanity/schemas/`.
 *
 * These describe what GROQ queries return after projection (see queries.ts),
 * NOT the raw document shapes inside Sanity. Image fields are projected to
 * `{ url, alt }` so consumers don't need to build URLs.
 */

import type { PortableTextBlock } from 'next-sanity'

export interface SanityImage {
  url: string
  alt: string
}

export interface CompanyStats {
  passRate: number
  professionalsCertified: number
  enterpriseClients: number
  auditsPassed: number
  averageWeeks: number
  availableSlots: number
  passRateSecurityPlus: number
  passRateCySAPlus: number
  passRateCASPPlus: number
  avgWeeksSecurityPlus: number
  avgWeeksCySAPlus: number
  avgWeeksCASPPlus: number
  asOfDate: string
}

export interface Testimonial {
  _id: string
  fullName: string
  title: string
  company: string
  industry: string
  industryAnonymized?: string
  quote: string
  portrait: SanityImage
  videoUrl?: string
  featured: boolean
  order: number
}

export interface OutcomeMetric {
  label: string
  value: string
}

export interface CaseStudy {
  _id: string
  slug: string
  clientIndustry: string
  clientIndustryAnonymized?: string
  complianceDriver:
    | 'HIPAA'
    | 'PCI-DSS'
    | 'CMMC'
    | 'SOC 2'
    | 'NIST CSF'
    | 'NERC CIP'
    | 'Other'
  teamSize: number
  weeksToCertification: number
  certificationsPassed: string[]
  buyerName: string
  buyerTitle: string
  buyerHeadshot: SanityImage
  buyerQuote: string
  challenge: PortableTextBlock[]
  solution: PortableTextBlock[]
  outcome: PortableTextBlock[]
  outcomeMetrics: OutcomeMetric[]
  clientLogo?: SanityImage
  publishedDate: string
  featured: boolean
}

export type ProgramSlug = 'security-plus' | 'cysa-plus' | 'casp-plus'

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

export interface IndustryPage {
  _id: string
  slug: string
  industryName: string
  complianceMandate: string
  complianceMandateFull: string
  trainingContext: PortableTextBlock[]
  featuredCaseStudy?: { _ref: string; slug: string }
  homepageOrder: number
  seoTitle: string
  seoDescription: string
}

export interface Faq {
  _id: string
  question: string
  answer: PortableTextBlock[]
  category: 'general' | 'programs' | 'pricing' | 'logistics' | 'compliance'
  featured: boolean
  order: number
}

export interface PressMention {
  _id: string
  outletName: string
  articleTitle: string
  url: string
  publishedDate: string
  logo: SanityImage
  showOnHero: boolean
  order: number
}

export interface ClientLogo {
  _id: string
  companyName: string
  anonymizedAs?: string
  logo?: SanityImage
  displayAs: 'logo' | 'industry-text'
  order: number
}

/**
 * Aggregate shape returned by the homepage loader (page.tsx Promise.all).
 * `null` values mean Sanity returned nothing or the fetch failed — consumers
 * should fall back to constants in fallbacks.ts.
 */
export interface HomepageData {
  companyStats: CompanyStats | null
  homepageTestimonials: Testimonial[]
  featuredCaseStudy: CaseStudy | null
  allPrograms: ProgramPage[]
  homepageIndustries: IndustryPage[]
  homepageFAQs: Faq[]
  heroPress: PressMention[]
  clientLogos: ClientLogo[]
}
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/types.ts
git commit -m "feat(pr4): add Sanity TypeScript types"
```

---

## Task 11 — Rewrite `queries.ts` with full GROQ set + typed fetcher

Replaces the current stub `queries.ts` with all 8 GROQ strings from spec §6.10 plus a typed `fetchHomepageData()` helper that runs them in parallel, projects image fields to `{ url, alt }`, and swallows fetch errors so the page can fall back to constants.

Also splits `client.ts` into a **read client** (CDN, no token) and a **write/read-token client** (server-only, used inside `fetchHomepageData` so draft content stays out of CDN cache).

**Files:**
- Modify: `src/lib/sanity/client.ts` (replace entire body)
- Modify: `src/lib/sanity/queries.ts` (replace entire body)

- [ ] **Step 1: Replace `src/lib/sanity/client.ts`**

```ts
import { createClient, type ClientConfig } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const SHARED: Pick<ClientConfig, 'projectId' | 'dataset' | 'apiVersion'> = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-10-01',
}

/**
 * Public read client — CDN-cached, anonymous. Used by `fetchHomepageData` for
 * the standard read path. Safe to import into server components.
 */
export const sanityClient = createClient({
  ...SHARED,
  useCdn: true,
})

/**
 * Server-only write/read-token client. Use ONLY inside route handlers, server
 * components, or build-time scripts. Reads from the live API (no CDN cache),
 * which is needed when the request must reflect the very latest publish.
 *
 * Never import this into a `"use client"` file — the token would leak.
 */
export const sanityServerClient = createClient({
  ...SHARED,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source)
```

- [ ] **Step 2: Replace `src/lib/sanity/queries.ts`**

```ts
import { groq } from 'next-sanity'
import { sanityClient } from './client'
import type {
  CaseStudy,
  ClientLogo,
  CompanyStats,
  Faq,
  HomepageData,
  IndustryPage,
  PressMention,
  ProgramPage,
  Testimonial,
} from './types'

/* -----------------------------------------------------------------------------
 * GROQ strings — centralized per spec §6.10
 * Image fields are projected to { url, alt } so consumers don't build URLs.
 * -------------------------------------------------------------------------- */

export const companyStatsQuery = groq`
  *[_type == "companyStats"][0]{
    passRate, professionalsCertified, enterpriseClients, auditsPassed,
    averageWeeks, availableSlots,
    passRateSecurityPlus, passRateCySAPlus, passRateCASPPlus,
    avgWeeksSecurityPlus, avgWeeksCySAPlus, avgWeeksCASPPlus,
    asOfDate
  }
`

export const homepageTestimonialsQuery = groq`
  *[_type == "testimonial" && featured == true] | order(order asc)[0..2]{
    _id, fullName, title, company, industry, industryAnonymized, quote,
    "portrait": { "url": portrait.asset->url, "alt": portrait.alt },
    videoUrl, featured, order
  }
`

export const featuredCaseStudyQuery = groq`
  *[_type == "caseStudy" && featured == true] | order(publishedDate desc)[0]{
    _id, "slug": slug.current,
    clientIndustry, clientIndustryAnonymized, complianceDriver,
    teamSize, weeksToCertification, certificationsPassed,
    buyerName, buyerTitle,
    "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
    buyerQuote, challenge, solution, outcome, outcomeMetrics,
    "clientLogo": clientLogo{ "url": asset->url, "alt": alt },
    publishedDate, featured
  }
`

export const allProgramsQuery = groq`
  *[_type == "programPage"] | order(homepageOrder asc){
    _id, "slug": slug.current, certName, eyebrow, oneliner,
    priceUSD, durationWeeks, sessionsPerWeek,
    whoNeedsIt, curriculumOutline, examObjectives,
    homepageOrder, seoTitle, seoDescription
  }
`

export const homepageIndustriesQuery = groq`
  *[_type == "industryPage"] | order(homepageOrder asc)[0..5]{
    _id, "slug": slug.current, industryName,
    complianceMandate, complianceMandateFull, trainingContext,
    "featuredCaseStudy": featuredCaseStudy->{ _ref: _id, "slug": slug.current },
    homepageOrder, seoTitle, seoDescription
  }
`

export const homepageFAQsQuery = groq`
  *[_type == "faq" && featured == true] | order(order asc)[0..3]{
    _id, question, answer, category, featured, order
  }
`

export const heroPressQuery = groq`
  *[_type == "pressMention" && showOnHero == true] | order(order asc){
    _id, outletName, articleTitle, url, publishedDate,
    "logo": { "url": logo.asset->url, "alt": logo.alt },
    showOnHero, order
  }
`

export const clientLogosQuery = groq`
  *[_type == "clientLogo"] | order(order asc){
    _id, companyName, anonymizedAs,
    "logo": logo{ "url": asset->url, "alt": alt },
    displayAs, order
  }
`

/* -----------------------------------------------------------------------------
 * Aggregate homepage fetcher
 * -------------------------------------------------------------------------- */

async function safeFetch<T>(query: string, fallback: T): Promise<T> {
  try {
    const data = await sanityClient.fetch<T>(query, {}, { next: { tags: ['homepage'] } })
    return data ?? fallback
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] query failed:', query.slice(0, 80), error)
    }
    return fallback
  }
}

/**
 * Fetches every dataset the homepage needs in parallel. Each query has its own
 * try/catch via `safeFetch` so a partial Sanity outage degrades to whichever
 * sections lost data — the rest still render. The page.tsx wrapper falls back
 * to constants from `fallbacks.ts` when individual queries return null/empty.
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  const [
    companyStats,
    homepageTestimonials,
    featuredCaseStudy,
    allPrograms,
    homepageIndustries,
    homepageFAQs,
    heroPress,
    clientLogos,
  ] = await Promise.all([
    safeFetch<CompanyStats | null>(companyStatsQuery, null),
    safeFetch<Testimonial[]>(homepageTestimonialsQuery, []),
    safeFetch<CaseStudy | null>(featuredCaseStudyQuery, null),
    safeFetch<ProgramPage[]>(allProgramsQuery, []),
    safeFetch<IndustryPage[]>(homepageIndustriesQuery, []),
    safeFetch<Faq[]>(homepageFAQsQuery, []),
    safeFetch<PressMention[]>(heroPressQuery, []),
    safeFetch<ClientLogo[]>(clientLogosQuery, []),
  ])

  return {
    companyStats,
    homepageTestimonials,
    featuredCaseStudy,
    allPrograms,
    homepageIndustries,
    homepageFAQs,
    heroPress,
    clientLogos,
  }
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sanity/client.ts src/lib/sanity/queries.ts
git commit -m "feat(pr4): full GROQ query set + typed fetchHomepageData()"
```

---

## Task 12 — Mount Sanity Studio at `/studio`

next-sanity v12 provides `<NextStudio>`. Lives at `src/app/studio/[[...tool]]/page.tsx`. The route must be a client component because Studio is a fully client-rendered SPA.

**Files:**
- Create: `src/app/studio/[[...tool]]/page.tsx`
- Create: `src/app/studio/[[...tool]]/layout.tsx` (to override the marketing layout that wraps everything in `<Header>`/`<Footer>` — Studio needs full viewport).

- [ ] **Step 1: Create `src/app/studio/[[...tool]]/layout.tsx`**

```tsx
import type { ReactNode } from 'react'

/**
 * Studio layout — strips the marketing Header/Footer that the (marketing)
 * route group adds. Studio is a full-viewport SPA.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export const metadata = {
  title: 'Sentinel Institute CMS',
  robots: 'noindex,nofollow',
}
```

- [ ] **Step 2: Create `src/app/studio/[[...tool]]/page.tsx`**

```tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'

/**
 * Embeds the Sanity Studio under /studio. The config import path reaches up
 * out of `src/app/studio/[[...tool]]/` to the project root, then into
 * `sanity/sanity.config.ts`.
 */
export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 3: Add fallback if `(marketing)` layout is the root for `/`**

Open `src/app/(marketing)/layout.tsx` and confirm it only applies to routes inside the `(marketing)` group — App Router route groups are scope-limited by default, so `/studio` should not inherit it. No edit needed if the file already exists as `src/app/(marketing)/layout.tsx`. Verify by running the dev server in Step 4.

- [ ] **Step 4: Smoke-test Studio in dev**

Run: `pnpm dev`

Then in a browser open: http://localhost:3000/studio

Expected:
- The page loads without the marketing Header/Footer wrapping it.
- The Sanity sign-in screen appears (or, if already signed in via `sanity login`, the desk loads).
- The left sidebar shows `Company Stats` (singleton) at the top, then a divider, then `Testimonial`, `Case study`, `Program page`, `Industry page`, `Faq`, `Press mention`, `Client logo`.
- The Vision tool tab is present.

If you see a 404 or a build error mentioning `next-sanity/studio` not found, run `pnpm install next-sanity@latest styled-components` (next-sanity v12 needs `styled-components` peer for Studio rendering).

Kill the dev server with Ctrl+C when done.

- [ ] **Step 5: Commit**

```bash
git add src/app/studio
git commit -m "feat(pr4): mount Sanity Studio at /studio"
```

---

## Task 13 — Populate `src/lib/sanity/fallbacks.ts`

Last-resort constants used when (a) Sanity is unreachable, (b) the document hasn't been seeded yet, or (c) the user is running the project locally without a real `SANITY_API_TOKEN`. These mirror the **current** hardcoded values in `Hero.tsx` and `TrustBar.tsx` so the page is visually identical to PR 3 if Sanity returns nothing.

**Files:**
- Create: `src/lib/sanity/fallbacks.ts`

- [ ] **Step 1: Create `src/lib/sanity/fallbacks.ts`**

```ts
import type {
  ClientLogo,
  CompanyStats,
  PressMention,
} from './types'

/**
 * Resilience layer — these constants render if Sanity returns null/empty for
 * any of the homepage queries. They mirror the hardcoded PR 1–3 values so a
 * Sanity outage degrades the page to "what it looked like before PR 4."
 *
 * Update these when the brand truth changes (e.g., a new press mention is
 * permanently live in production). DO NOT use them as a long-term content
 * store — they exist for fault tolerance.
 */

export const FALLBACK_COMPANY_STATS: CompanyStats = {
  passRate: 96,
  professionalsCertified: 410,
  enterpriseClients: 63,
  auditsPassed: 38,
  averageWeeks: 9,
  availableSlots: 12,
  passRateSecurityPlus: 97,
  passRateCySAPlus: 95,
  passRateCASPPlus: 94,
  avgWeeksSecurityPlus: 8,
  avgWeeksCySAPlus: 10,
  avgWeeksCASPPlus: 12,
  asOfDate: '2026-05-01T00:00:00.000Z',
}

export const FALLBACK_HERO_PRESS: PressMention[] = [
  {
    _id: 'fallback-press-sc-magazine',
    outletName: 'SC Magazine',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.scmagazine.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'SC Magazine' },
    showOnHero: true,
    order: 0,
  },
  {
    _id: 'fallback-press-dark-reading',
    outletName: 'Dark Reading',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.darkreading.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'Dark Reading' },
    showOnHero: true,
    order: 1,
  },
  {
    _id: 'fallback-press-cyberscoop',
    outletName: 'CyberScoop',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.cyberscoop.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'CyberScoop' },
    showOnHero: true,
    order: 2,
  },
]

export const FALLBACK_CLIENT_LOGOS: ClientLogo[] = [
  { _id: 'fb-cl-1', companyName: 'Regional Bank, Midwest', anonymizedAs: 'Regional Bank, Midwest', displayAs: 'industry-text', order: 0 },
  { _id: 'fb-cl-2', companyName: 'Health System, Northeast', anonymizedAs: 'Health System, Northeast', displayAs: 'industry-text', order: 1 },
  { _id: 'fb-cl-3', companyName: 'Defense Contractor, Mid-Atlantic', anonymizedAs: 'Defense Contractor, Mid-Atlantic', displayAs: 'industry-text', order: 2 },
  { _id: 'fb-cl-4', companyName: 'Insurance Carrier, Southeast', anonymizedAs: 'Insurance Carrier, Southeast', displayAs: 'industry-text', order: 3 },
  { _id: 'fb-cl-5', companyName: 'Utility, Pacific Northwest', anonymizedAs: 'Utility, Pacific Northwest', displayAs: 'industry-text', order: 4 },
  { _id: 'fb-cl-6', companyName: 'Law Firm, AmLaw 200', anonymizedAs: 'Law Firm, AmLaw 200', displayAs: 'industry-text', order: 5 },
  { _id: 'fb-cl-7', companyName: 'Pharmaceutical, Top 25', anonymizedAs: 'Pharmaceutical, Top 25', displayAs: 'industry-text', order: 6 },
  { _id: 'fb-cl-8', companyName: 'Financial Services, Big Four', anonymizedAs: 'Financial Services, Big Four', displayAs: 'industry-text', order: 7 },
]
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity/fallbacks.ts
git commit -m "feat(pr4): add fallbacks for companyStats, heroPress, clientLogos"
```

---

## Task 14 — `/api/revalidate` route with secret-token guard

POST handler that:
1. Validates `?secret=<SANITY_REVALIDATE_SECRET>` URL query param against env.
2. Parses JSON body, extracts `_type`.
3. Calls `revalidatePath('/')` plus `revalidateTag('homepage')` and `revalidateTag(\`sanity:${_type}\`)` if `_type` is known.
4. Returns `{ revalidated: true, type, now }` or `{ message }` 401.

We use a URL query secret (not header) because Sanity's webhook UI lets us embed the secret directly into the webhook target URL — simplest setup for the editorial team, no custom headers required.

**Files:**
- Create: `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Write the failing test scaffold**

There is no Jest/Vitest config wired up yet (per PR 1–3 plans testing has been manual). For this route we'll verify by `curl` after implementation. Skip the unit test in favor of two manual checks: (a) wrong secret → 401, (b) right secret → 200.

- [ ] **Step 2: Create `src/app/api/revalidate/route.ts`**

```ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *
 * Body (sent by Sanity webhook): `{ "_type": "companyStats", "_id": "..." }`
 *
 * Triggers ISR revalidation of:
 *   - the homepage path `/`
 *   - the `homepage` tag (used by every query in queries.ts)
 *   - a per-type tag `sanity:<_type>` so future per-type tag fetches can be
 *     invalidated independently
 *
 * Returns 401 if the secret query param doesn't match SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET
  const providedSecret = req.nextUrl.searchParams.get('secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: { _type?: string } = {}
  try {
    body = (await req.json()) as { _type?: string }
  } catch {
    // Sanity webhook may send empty body during manual ping — treat as homepage refresh.
  }

  revalidatePath('/')
  revalidateTag('homepage')
  if (body._type) {
    revalidateTag(`sanity:${body._type}`)
  }

  return NextResponse.json({
    revalidated: true,
    type: body._type ?? null,
    now: Date.now(),
  })
}

/** Block GET so the route doesn't show up in casual scans. */
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
```

- [ ] **Step 3: Manual verification — wrong secret returns 401**

Start the dev server (`pnpm dev`). In a second terminal:

```bash
curl -i -X POST "http://localhost:3000/api/revalidate?secret=wrong" \
  -H "Content-Type: application/json" \
  -d '{"_type":"companyStats"}'
```

Expected: `HTTP/1.1 401 Unauthorized` with body `{"message":"Invalid secret"}`.

- [ ] **Step 4: Manual verification — right secret returns 200**

Read `SANITY_REVALIDATE_SECRET` from `.env.local`, then:

```bash
curl -i -X POST "http://localhost:3000/api/revalidate?secret=<paste-secret>" \
  -H "Content-Type: application/json" \
  -d '{"_type":"companyStats"}'
```

Expected: `HTTP/1.1 200 OK` with body matching `{"revalidated":true,"type":"companyStats","now":<timestamp>}`.

Kill the dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/revalidate/route.ts
git commit -m "feat(pr4): add /api/revalidate webhook handler for Sanity ISR"
```

---

## Task 15 — Refactor `Hero.tsx` to read from Sanity props

Drop the `HERO_STATS` and `PRESS_OUTLETS` constants from inside the component. Accept `stats: CompanyStats` and `pressOutlets: string[]` as props. Map `stats` → the four-line pillar; render `pressOutlets` in the press band.

Order of pillar stats (per spec §5 §1 hero copy):
1. `passRate` (suffix `%`) — "First-Attempt Pass Rate"
2. `professionalsCertified` — "Professionals Certified"
3. `enterpriseClients` — "Enterprise Clients"
4. `auditsPassed` — "Compliance Audits Passed"

**Files:**
- Modify: `src/components/sections/Hero.tsx` (replace entire body)

- [ ] **Step 1: Replace `src/components/sections/Hero.tsx`**

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { LineReveal } from "@/components/motion/LineReveal"
import { StatCounter } from "@/components/motion/StatCounter"
import type { CompanyStats } from "@/lib/sanity/types"

interface HeroProps {
  /** Drives the stat pillar (right column). */
  stats: CompanyStats
  /** Outlet names rendered in the "AS FEATURED IN" band. */
  pressOutlets: string[]
}

interface HeroStat {
  value: number
  suffix: string
  label: string
}

function buildPillar(stats: CompanyStats): HeroStat[] {
  return [
    { value: stats.passRate, suffix: "%", label: "First-Attempt Pass Rate" },
    { value: stats.professionalsCertified, suffix: "", label: "Professionals Certified" },
    { value: stats.enterpriseClients, suffix: "", label: "Enterprise Clients" },
    { value: stats.auditsPassed, suffix: "", label: "Compliance Audits Passed" },
  ]
}

export function Hero({ stats, pressOutlets }: HeroProps) {
  const pillar = buildPillar(stats)

  return (
    <section
      aria-labelledby="hero-headline"
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 md:gap-16 items-start">
          {/* Left column */}
          <div>
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Enterprise Cybersecurity Certification
              </p>
            </FadeUp>

            <h1
              id="hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[0.95] text-[var(--color-text-primary)] max-w-[22ch]"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)" }}
            >
              <LineReveal>Close the Certification Gap Before the Auditors Do.</LineReveal>
            </h1>

            <FadeUp delay={0.5}>
              <p className="mt-7 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
                Sentinel Institute trains corporate security teams to pass CompTIA Security+,
                CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built
                into every contract.
              </p>
            </FadeUp>

            <FadeUp delay={0.65}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary" data-cta="hero-primary">
                  Request a Training Proposal
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  data-cta="hero-secondary"
                >
                  Book a 20-Minute Discovery Call
                </a>
              </div>
            </FadeUp>

            {pressOutlets.length > 0 && (
              <FadeUp delay={0.85}>
                <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.15em]">
                  <span className="text-[var(--color-text-muted)] opacity-70">As featured in</span>
                  {pressOutlets.map((outlet) => (
                    <span key={outlet} className="text-[var(--color-text-secondary)]">
                      {outlet}
                    </span>
                  ))}
                </div>
              </FadeUp>
            )}
          </div>

          {/* Right column — stat pillar */}
          <FadeUp delay={0.3} className="md:pt-2">
            <ul aria-label="Sentinel Institute outcomes">
              {pillar.map((stat, i) => (
                <li
                  key={stat.label}
                  className={
                    i === 0
                      ? "py-5"
                      : "py-5 border-t border-[var(--color-border)]"
                  }
                >
                  <span
                    className="block font-display font-medium tracking-[-0.025em] text-[var(--color-text-primary)] leading-none"
                    style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)" }}
                  >
                    <StatCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-2 block font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)]">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm tsc --noEmit`

Expected: errors about `Hero` being called without `stats`/`pressOutlets` in `(marketing)/page.tsx`. That's expected — Task 17 wires the props.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "refactor(pr4): Hero reads stats + pressOutlets from props"
```

---

## Task 16 — Refactor `TrustBar.tsx` to read from Sanity props

Drop the `CLIENT_INDUSTRIES` constant. Accept `enterpriseClients: number` (from companyStats) and `clientLabels: string[]` (derived in page.tsx: `clientLogo.anonymizedAs ?? clientLogo.companyName`). Render the caption with the live count.

**Files:**
- Modify: `src/components/sections/TrustBar.tsx` (replace entire body)

- [ ] **Step 1: Replace `src/components/sections/TrustBar.tsx`**

```tsx
import { FadeUp } from "@/components/motion/FadeUp"

interface TrustBarProps {
  /** Total enterprise clients certified — drives the right-side caption. */
  enterpriseClients: number
  /** Labels for the client strip. Pass anonymized labels for industry-text mode. */
  clientLabels: string[]
}

export function TrustBar({ enterpriseClients, clientLabels }: TrustBarProps) {
  return (
    <section
      aria-label="Trusted by"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface-alt)]"
    >
      <div className="container-sentinel py-10">
        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            {/* CompTIA badge — text fallback until SVG arrives */}
            <div
              role="img"
              aria-label="CompTIA Authorized Partner"
              className="inline-flex items-center gap-2.5 shrink-0 rounded border border-[var(--color-border-hover)] bg-[var(--color-surface-elevated)] px-3.5 py-2"
            >
              <span
                aria-hidden="true"
                className="font-display font-semibold text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--color-accent-light)]"
              >
                CompTIA
              </span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                Authorized Partner
              </span>
            </div>

            {/* Client industries strip */}
            {clientLabels.length > 0 && (
              <ul
                aria-label="Clients"
                className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
              >
                {clientLabels.map((label) => (
                  <li
                    key={label}
                    className="transition-colors hover:text-[var(--color-text-secondary)]"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}

            {/* Right-side caption — uses live count */}
            <p className="md:max-w-[26ch] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] md:text-right shrink-0">
              {enterpriseClients} enterprise clients certified across 11 regulated industries
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm tsc --noEmit`

Expected: same expected error pattern as Task 15 — `(marketing)/page.tsx` still calls TrustBar with no props. Resolves in Task 17.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TrustBar.tsx
git commit -m "refactor(pr4): TrustBar reads enterpriseClients + clientLabels from props"
```

---

## Task 17 — Wire `(marketing)/page.tsx` with ISR + Sanity data + fallbacks

Add `export const revalidate = 3600` to enable ISR (revalidate every hour). Fetch all homepage Sanity data via `fetchHomepageData()`. Resolve fallback values for any null/empty result. Pass typed props into `<Hero />` and `<TrustBar />`.

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (replace entire body)

- [ ] **Step 1: Replace `src/app/(marketing)/page.tsx`**

```tsx
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { SentinelSystem } from "@/components/sections/SentinelSystem"
import { fetchHomepageData } from "@/lib/sanity/queries"
import {
  FALLBACK_CLIENT_LOGOS,
  FALLBACK_COMPANY_STATS,
  FALLBACK_HERO_PRESS,
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

  return (
    <>
      <Hero stats={stats} pressOutlets={pressOutlets} />
      <TrustBar
        enterpriseClients={stats.enterpriseClients}
        clientLabels={clientLabels}
      />
      <SentinelSystem />
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck + build**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

Run: `pnpm build`

Expected: clean build. Watch for:
- `(marketing)/page.tsx` listed as `λ` (server-rendered with ISR) or `○ (Static)` with `revalidate: 3600` — either is acceptable; Next.js may statically prerender the first version.
- `/studio` listed under routes.
- `/api/revalidate` listed under routes.

- [ ] **Step 3: Smoke-test the homepage in dev**

Run: `pnpm dev`

Open: http://localhost:3000

Expected — the page looks **visually identical to PR 3** because:
1. Sanity has no documents seeded yet → every query returns null/empty.
2. `fetchHomepageData()` returns all-empty.
3. `page.tsx` falls back to constants in `fallbacks.ts`.
4. Those constants mirror the previous hardcoded values exactly.

If anything looks different (numbers wrong, press outlets missing, client labels missing), inspect the fallbacks file and the page.tsx fallback resolution before proceeding.

Kill the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(marketing\)/page.tsx
git commit -m "feat(pr4): wire ISR + Sanity data + fallbacks into homepage"
```

---

## Task 18 — Editorial seed-data checklist

The content team (Marcus per memory) seeds real documents via Studio after this PR ships. This doc is the deliverables list — what to create, in what order, with which fields filled. It is **not** a script; it is a human checklist.

**Files:**
- Create: `docs/seed-data-pr4.md`

- [ ] **Step 1: Create `docs/seed-data-pr4.md`**

```markdown
# Sentinel Institute — Editorial Seed Checklist (PR 4 deliverable)

This is the list of documents Marcus + editorial seed in Sanity Studio
(http://localhost:3000/studio in dev, or production studio URL) after PR 4
ships. Until these are seeded, the homepage falls back to constants in
`src/lib/sanity/fallbacks.ts` and visitors see the PR 3 hardcoded numbers.

Order matters for documents with references — seed in this order.

## 1. Company Stats (singleton — exactly 1 doc)

Sidebar → **Company Stats**. Fill every field; `asOfDate` is today.

- passRate · 96
- professionalsCertified · 410
- enterpriseClients · 63
- auditsPassed · 38
- averageWeeks · 9
- availableSlots · 12  (update weekly)
- passRateSecurityPlus · 97
- passRateCySAPlus · 95
- passRateCASPPlus · 94
- avgWeeksSecurityPlus · 8
- avgWeeksCySAPlus · 10
- avgWeeksCASPPlus · 12

## 2. Press Mentions (≥ 3 with showOnHero = true)

Sidebar → **Press mention** → New. Create at least these three (Marcus
provides article URLs):

- SC Magazine — showOnHero true, order 0
- Dark Reading — showOnHero true, order 1
- CyberScoop — showOnHero true, order 2

For each: outlet name, article title, HTTPS URL, published date, logo upload
(prefer SVG ≤ 50 KB), alt text required.

## 3. Client Logos (8 industry-text entries minimum)

Sidebar → **Client logo** → New. Use `displayAs: industry-text` for every
anonymized client. Eight to seed for the trust bar:

1. Regional Bank, Midwest
2. Health System, Northeast
3. Defense Contractor, Mid-Atlantic
4. Insurance Carrier, Southeast
5. Utility, Pacific Northwest
6. Law Firm, AmLaw 200
7. Pharmaceutical, Top 25
8. Financial Services, Big Four

Each row: companyName (internal — actual client name), anonymizedAs (the
public string above), displayAs = industry-text, order (0–7).

## 4. Programs (exactly 3 docs — Security+, CySA+, CASP+)

Sidebar → **Program page** → New, three times. Slugs must be exactly
`security-plus`, `cysa-plus`, `casp-plus`.

- Security+ — homepageOrder 0, copy from `WEBSITE_CONTEXT.md` §4
- CySA+    — homepageOrder 1
- CASP+    — homepageOrder 2

Each: certName, eyebrow, one-liner, priceUSD, durationWeeks, sessionsPerWeek,
Portable Text "whoNeedsIt", Portable Text "curriculumOutline", string array
"examObjectives", SEO title (≤ 70 ch), SEO description (≤ 160 ch).

## 5. Industries (6 docs — first cohort)

Sidebar → **Industry page** → New. Six to seed for the homepage:

1. Healthcare — HIPAA Security Rule § 164.308
2. Financial Services — PCI-DSS v4.0 §§ 12.6 and 12.10
3. Defense Contractors — CMMC Level 2 / NIST SP 800-171
4. Utilities — NERC CIP-004 Personnel Training
5. Insurance — NAIC Cybersecurity Insurance Data Security Model Law §§ 4 and 6
6. Legal — ABA Model Rules of Professional Conduct 1.6(c)

Each: industryName, complianceMandate (short citation), complianceMandateFull
(2–3 sentences), trainingContext (Portable Text), homepageOrder (0–5),
SEO title, SEO description. featuredCaseStudy reference is optional — link
once case studies are seeded in step 7.

## 6. FAQs (≥ 4 with featured = true)

Sidebar → **Faq** → New. Seed at least four with `featured: true` for the
homepage preview. Categories: general / programs / pricing / logistics /
compliance.

## 7. Testimonials (≥ 3 with featured = true)

Sidebar → **Testimonial** → New. Seed at least three with `featured: true`,
each with portrait image, alt text, ≤ 5-line quote, industryAnonymized if
the client requires it. Order 0–2.

## 8. Case Studies (≥ 1 with featured = true)

Sidebar → **Case study** → New. Seed at least one with `featured: true`
matching one of the seeded industries.

---

## After seeding

1. Hit `POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>` with body
   `{"_type":"companyStats"}` — refreshes the homepage immediately.
2. Or configure the Sanity webhook (Manage → API → Webhooks):
   - URL: `https://sentinelinstitute.com/api/revalidate?secret=<secret>`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["companyStats","testimonial","caseStudy","programPage","industryPage","faq","pressMention","clientLogo"]`
   - HTTP method: POST
   - Payload: select "Document"

The homepage will now reflect Sanity content; fallbacks only fire if Sanity
becomes unreachable.
```

- [ ] **Step 2: Commit**

```bash
git add docs/seed-data-pr4.md
git commit -m "docs(pr4): editorial seed-data checklist for content team"
```

---

## Task 19 — Final verification

Confirms PR 4 is green and ready to tag.

- [ ] **Step 1: Update `.env.example`**

Open `.env.example` and add this line after the existing Sanity block:

```
SANITY_REVALIDATE_SECRET=
```

Commit:

```bash
git add .env.example
git commit -m "chore(pr4): document SANITY_REVALIDATE_SECRET in .env.example"
```

- [ ] **Step 2: Apply pnpm audit overrides (from STACK_CORRECTIONS.md)**

Open `package.json` and add a `pnpm.overrides` block before the final `}`:

```json
  "pnpm": {
    "overrides": {
      "js-yaml": "^4.1.0",
      "postcss": "^8.5.0"
    }
  }
```

Then run:

```bash
pnpm install
pnpm audit
```

Expected: zero high / critical. Moderate findings should drop to 0 or match STACK_CORRECTIONS.md guidance.

Commit:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(pr4): pnpm overrides for js-yaml + postcss audit findings"
```

- [ ] **Step 3: Full typecheck**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 4: Full lint**

Run: `pnpm lint`

Expected: zero warnings, zero errors. (If lint complains about `any` usage anywhere, that's a regression — fix and re-commit before tagging.)

- [ ] **Step 5: Full build**

Run: `pnpm build`

Expected:
- Clean exit (status 0).
- `(marketing)/page.tsx` builds with revalidate 3600.
- `/studio/[[...tool]]` route present.
- `/api/revalidate` route present.
- No console errors mentioning missing env vars (a warning for empty `NEXT_PUBLIC_SANITY_PROJECT_ID` is acceptable if the user is testing without it; it MUST be set in Vercel prod).

- [ ] **Step 6: Manual Studio + homepage QA**

Run: `pnpm dev`

Then:
- Open http://localhost:3000 — confirms hero, trust bar, sentinel system render. With no Sanity content, you should see fallback numbers (96/410/63/38, "AS FEATURED IN · SC Magazine · Dark Reading · CyberScoop", 8 industry labels).
- Open http://localhost:3000/studio — confirms Studio loads, sidebar shows Company Stats (singleton) at top with divider, then 7 list types alphabetized.
- Create a test `companyStats` singleton with passRate = 99, save & publish.
- Hit `POST /api/revalidate?secret=<your-secret>` with `{"_type":"companyStats"}`.
- Refresh http://localhost:3000 — confirms hero pass-rate now shows 99%.
- Delete the test stats (it should NOT allow delete — confirms singleton enforcement). Instead, edit it back to 96.

Kill the dev server.

- [ ] **Step 7: Tag PR 4**

```bash
git tag pr-4-sanity-foundations
```

Do not push — tag stays local until the user reviews and gives the go-ahead. (Memory note: user prefers single-letter confirmation before push events.)

- [ ] **Step 8: Brief the user**

State to the user, in one or two sentences:
- PR 4 is complete: 8 schemas + studio + ISR + revalidate route + Hero/TrustBar Sanity refactor. Local tag `pr-4-sanity-foundations` set.
- Next action requires the user: seed real content via `/studio` following `docs/seed-data-pr4.md`, then configure the Sanity webhook in Manage → API → Webhooks pointing at `/api/revalidate?secret=<secret>`.

---

## Self-Review (Spec Coverage)

| Spec §11.1 PR 4 bullet | Covered by | Status |
|---|---|---|
| All 8 schemas + indexes | Tasks 2–8 (one schema each) + Task 9 (index) | ✅ |
| GROQ queries in `src/lib/sanity/queries.ts` | Task 11 | ✅ |
| `src/lib/sanity/types.ts` typed | Task 10 | ✅ |
| Studio mounted at `/studio` | Task 12 | ✅ |
| Seed real content (manually) | Task 18 (checklist deliverable) | ✅ (deferred to content team) |
| Swap Hero + TrustBar to read from Sanity | Tasks 15 + 16 + 17 | ✅ |
| ISR wired (`revalidate = 3600`) | Task 17 | ✅ |
| `/api/revalidate/route.ts` webhook-driven | Task 14 | ✅ |
| `src/lib/sanity/fallbacks.ts` populated | Task 13 | ✅ |

| Spec §6 schema | Defined in | Status |
|---|---|---|
| 6.1 companyStats (singleton) | Task 2 + Task 9 (action filter) | ✅ |
| 6.2 testimonial | Task 3 | ✅ |
| 6.3 caseStudy | Task 4 | ✅ |
| 6.4 programPage (exactly 3) | Task 5 (slug validator) | ✅ |
| 6.5 industryPage | Task 6 | ✅ |
| 6.6 faq | Task 7 | ✅ |
| 6.7 pressMention | Task 8 | ✅ |
| 6.8 clientLogo | Task 8 | ✅ |
| 6.9 Validation patterns (slug lowercase-hyphen, image alt required, HTTPS regex, integer 0–100) | Distributed across Tasks 2–8 | ✅ |
| 6.10 GROQ queries (8) | Task 11 | ✅ |

| Spec §7 fallback (Sanity-down) | Covered by | Status |
|---|---|---|
| Page never returns 500 — falls back to constants | `safeFetch` in Task 11 + null-coalesce in Task 17 | ✅ |

| Spec §10 security | Covered by | Status |
|---|---|---|
| `SANITY_API_TOKEN` server-only | Task 11 (split into `sanityServerClient`) | ✅ |
| Secrets in `.env.local`, never committed | Prerequisite + Task 19 step 1 | ✅ |
| `dangerouslySetInnerHTML` avoided | Tasks 15/16/17 — no use | ✅ |

**Placeholder scan:** Grepped this plan for `TBD`, `TODO`, `fill in`, `implement later`, `add appropriate`, `similar to Task` — no hits. Every code step is complete code or a complete command.

**Type consistency:** `CompanyStats` field names match across `types.ts` (Task 10), `queries.ts` projections (Task 11), `fallbacks.ts` (Task 13), `Hero.tsx` consumer (Task 15), `TrustBar.tsx` consumer (Task 16), and `page.tsx` (Task 17). `companyStats` singleton documentId is consistent (`'companyStats'`) between the structure builder (Task 9) and the singleton enforcement filter (Task 9). All 8 schema `name` fields in `defineType` are referenced identically in `index.ts` (Task 9), `queries.ts` `_type ==` filters (Task 11), and `fetchHomepageData`'s `HomepageData` keys (Tasks 10 + 11).
