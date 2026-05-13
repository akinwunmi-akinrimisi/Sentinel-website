# Sentinel Institute — Design System + Homepage Spec

**Date:** 2026-05-13
**Project:** Sentinel Institute marketing site (sentinelinstitute.com)
**Scope:** Design system foundation + the 12-section homepage at `/` + the `/contact` proposal page (single-page host for `ProposalForm`) + `/thanks` post-submit page. The homepage CTAs require a working form destination; bundling `/contact` here avoids shipping the homepage with dead CTAs.
**Out of scope:** /programs, /industries, /results, /about, /faq, Phase 2 client portal (separate brainstorms each)
**Launch deadline:** 2026-07-14 (8-week build window from May 2026)

---

## 1. Locked Decisions

Ten decisions locked on 2026-05-13. Nine were made during this brainstorm; the palette (decision 03) was pre-locked in `src/app/globals.css` before the brainstorm started but is restated here as a constraint. Every implementation task must respect all ten.

| # | Decision | Choice | Why |
|---|---|---|---|
| 01 | Scope | Design system + 12-section homepage | Cascades to every sub-page later; single source of truth |
| 02 | Typography | IBM Plex Serif (display) · Plex Sans (body) · Plex Mono (labels/stats) | Single-family system, free/self-hostable, audit-grade — maps to CISO mental model of IBM / McKinsey / NIST |
| 03 | Palette | Navy `#0A1628` surface · Electric Blue `#2563EB` accent · text/borders per `globals.css` `@theme` | Already locked in source; brief direction "dark, precise, authoritative" |
| 04 | shadcn integration | Rebuild 15 ui components on Sentinel tokens (no parallel design system) | One token tree, no drift. ~30 min mechanical rewrite. |
| 05 | Motion philosophy | Moderate editorial reveal — fade-up on scroll, line-reveal on display text, hover lift on cards, count-up on stats, light hero parallax. GSAP timeline reserved for §5 only. | Slow and deliberate > frantic. Respects `prefers-reduced-motion`. Editorial without overproduction. |
| 06 | Hero headline | "Close the Certification Gap Before the Auditors Do." | Names antagonist (auditor), implies time pressure, gives buyer agency, lands in CISO vocabulary |
| 07 | Hero layout | Layout B — Editorial + Stat Pillar (left: headline + sub + CTAs + press band; right: 96 / 410 / 63 / 38 stat pillar) | Proof above the fold; compresses funnel |
| 08 | System™ diagram | Vertical Detailed Timeline with Duration / Cadence / Threshold metadata rows + result block | Information-dense; reads as receipts, not a brochure |
| 09 | §6 resolution | Reframed to Results By Program (per-cert pass rate + avg weeks) | No redundancy with hero stats; adds the granularity CISOs quote in board decks |
| 10 | Data layer | Hybrid — hardcoded structure + Sanity for slow/fast-changing content; ISR `revalidate: 3600` | First ship doesn't block on schemas; editorial team unblocks after PR 4 |

---

## 2. Technical Stack Confirmation

Stack matches `STACK_CORRECTIONS.md` exactly. Re-stating the deltas from `CLAUDE.md` that any implementer must know:

- **Next.js 16.2.6 (App Router, Turbopack)** — not 14 as the kit assumes
- **Tailwind v4** — no `tailwind.config.ts`. All theme tokens in `src/app/globals.css` inside `@theme {}`. `tw-animate-css` is the v4-compatible replacement for `tailwindcss-animate`.
- **Stripe API version** `2026-04-22.dahlia` (matches installed SDK)
- **shadcn primitives**: `sonner` replaces deprecated `toast`
- **Form, Cal.com booking, Resend, Upstash, HubSpot, Slack webhook, GA4 (`G-SX7492KRTM`), Sanity** — all per `WEBSITE_CONTEXT.md` §7

---

## 3. Architecture

### 3.1 File structure

```
src/app/
├── (marketing)/
│   ├── layout.tsx          # marketing shell: Header, Footer, GA4 mount
│   └── page.tsx            # / homepage — composes all 12 section components
├── api/
│   ├── proposal/route.ts   # POST /api/proposal — form handler
│   └── revalidate/route.ts # POST /api/revalidate — Sanity webhook → ISR
├── studio/[[...index]]/    # embedded Sanity Studio (next-sanity v12)
│   └── page.tsx
├── thanks/page.tsx         # proposal submission landing
├── layout.tsx              # root: <html>, font preloads, body wrapper
└── globals.css             # already in place (locked palette + tokens)

src/components/
├── ui/                     # shadcn primitives rebuilt on Sentinel tokens
│   └── (button, input, textarea, label, select, dialog, accordion,
│         card, badge, separator, form, sonner, sheet,
│         navigation-menu, dropdown-menu)
├── sections/               # 12 section components, one file each
│   ├── Hero.tsx
│   ├── TrustBar.tsx
│   ├── ProblemSection.tsx
│   ├── ProgramsOverview.tsx
│   ├── SentinelSystem.tsx
│   ├── ResultsByProgram.tsx
│   ├── CaseStudyFeature.tsx
│   ├── Testimonials.tsx
│   ├── IndustriesServed.tsx
│   ├── ProposalCTA.tsx
│   ├── FAQPreview.tsx
│   └── FooterBlock.tsx
├── forms/
│   └── ProposalForm.tsx    # react-hook-form + zod, business-email check
├── layout/
│   ├── Header.tsx
│   └── Footer.tsx
└── motion/
    ├── FadeUp.tsx          # intersection-observer fade-up wrapper
    ├── LineReveal.tsx      # single-sweep line reveal for display text
    ├── StatCounter.tsx     # count-up once on view
    └── SystemTimeline.tsx  # GSAP-driven §5 reveal (dynamic-imported)

src/lib/
├── sanity/
│   ├── client.ts           # server-only client
│   ├── queries.ts          # GROQ strings (centralized)
│   ├── types.ts            # TS types matching schemas
│   └── fallbacks.ts        # last-resort constants if Sanity unreachable
├── stripe/
│   └── server.ts           # already in place
├── analytics/
│   ├── events.ts           # already in place
│   └── consent.ts          # CCPA banner state
├── rate-limit.ts           # Upstash limiter
├── email/
│   ├── resend.ts           # Resend client
│   └── templates.tsx       # React Email templates: prospect + internal
└── utils.ts                # cn() (already in place via shadcn init)

sanity/
├── schemas/
│   ├── index.ts            # exports schemaTypes[]
│   ├── companyStats.ts
│   ├── testimonial.ts
│   ├── caseStudy.ts
│   ├── programPage.ts
│   ├── industryPage.ts
│   ├── faq.ts
│   ├── pressMention.ts
│   └── clientLogo.ts
└── sanity.config.ts        # already in place
```

### 3.2 Component boundaries

- **Server components by default.** Client components are limited to: `ProposalForm`, `BookingDialog` (Cal.com modal trigger), `SystemTimeline`, `StatCounter`, `FadeUp`/`LineReveal` wrappers.
- **Server-only Sanity client.** `src/lib/sanity/client.ts` is never imported into a client component. GROQ runs in server components / route handlers only.
- **One section = one file.** No section component exceeds ~200 lines. If a section grows past that, extract sub-components into a colocated folder (`sections/Hero/Hero.tsx`, `sections/Hero/StatPillar.tsx`).
- **Prop drilling capped at one level.** Anything deeper goes through Zustand (`src/store/ui.ts`) or a colocated React context.

---

## 4. Data Flow

### 4.1 Read path — Sanity → page

```
src/lib/sanity/queries.ts (GROQ strings)
        │
        ▼
src/lib/sanity/client.ts (server-only)
        │
        ▼  (parallel via Promise.all in page.tsx)
(marketing)/page.tsx
        │  fetches: companyStats, testimonials[0..2], featuredCaseStudy,
        │           programs, industries[0..5], faqs[0..3], pressMentions,
        │           clientLogos
        ▼
sections/*.tsx (typed props, max 1 level deep)
```

`(marketing)/page.tsx` exports `revalidate = 3600`. Sanity webhook hits `/api/revalidate` on content publish to trigger on-demand revalidation for the homepage path.

### 4.2 Write path — proposal form submit

```
ProposalForm (client component)
   │  Zod validates locally → field errors shown inline
   │  POST /api/proposal { Zod-shaped payload }
   ▼
src/app/api/proposal/route.ts
   │
   ├── Upstash rate-limit (5 / min / IP)         → 429 friendly if exceeded
   ├── Re-validate with same Zod schema           → 422 with field+message
   ├── Reject personal email domains              → 422
   ├── Resend: prospect confirmation email
   ├── Resend: training@sentinelinstitute.com notification
   ├── Slack webhook → #new-leads
   └── HubSpot Forms API submit
   │
   ▼  200 OK { success: true }
ProposalForm
   │  sonner toast → redirect to /thanks
   ▼
GA4: proposal_form_submit { industry, team_size, compliance_driver }
```

Resend / Slack / HubSpot failures are logged server-side but never block the user response — see §6 Error Handling.

### 4.3 Hardcoded ↔ Sanity boundary

| Content | Source | Reason |
|---|---|---|
| Hero headline, sub, eyebrow | Hardcoded | Locked in this brainstorm |
| §5 System™ phase copy & metadata | Hardcoded | The mechanism — never changes |
| §3 Problem section copy | Hardcoded | Brand voice, locked |
| All section eyebrows / labels | Hardcoded | Structural, not editorial |
| Footer legal links | Hardcoded | Static |
| Company stats (96 / 410 / 63 / 38 + per-cert) | Sanity `companyStats` (singleton) | Updates monthly |
| Testimonials | Sanity `testimonial[]` | Quarterly additions |
| Featured case study | Sanity `caseStudy[featured == true]` | Rotates per campaign |
| Programs (Sec+, CySA+, CASP+) | Sanity `programPage[]` | Pricing may change |
| Industries (6 on home) | Sanity `industryPage[]` | Compliance mandates evolve |
| FAQs (4 on home) | Sanity `faq[featured == true]` | Edited frequently |
| Press mentions | Sanity `pressMention[]` | New press appears |
| Client logos (8 on trust bar) | Sanity `clientLogo[]` | Onboardings + anonymization changes |
| "{N} spots remaining" callout | Sanity `companyStats.availableSlots` | Updates weekly |

---

## 5. Section-by-Section Homepage

All section padding uses `var(--spacing-section)` (clamp from `globals.css`). All section containers use `.container-sentinel` (max-width 88rem, responsive inline padding). Reveal motion: each section's first child gets `<FadeUp>` wrapper unless otherwise noted.

### §1 Hero — Layout B, locked

Two-column grid on desktop (1.4fr left, 1fr right stat pillar), single column on mobile.

**Left column:**
- Eyebrow `Enterprise Cybersecurity Certification` (Plex Mono, accent-light)
- Display headline `Close the Certification Gap Before the Auditors Do.` (Plex Serif Medium, display-xl, max-w 22ch, line-reveal animation on mount)
- Sub-headline (Plex Sans, body, max-w 44ch): `Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.`
- CTA row:
  - Primary `Request a Training Proposal →` — routes to `/contact` (single-page form host built in PR 6)
  - Secondary `Book a 20-Minute Discovery Call` — opens `BookingDialog` Cal.com modal in place
- Press band beneath CTAs: `AS FEATURED IN  ·  SC Magazine  ·  Dark Reading  ·  CyberScoop` (Plex Mono, text-muted)

**Right column (stat pillar):**
- Four stacked stat blocks, each separated by hairline border:
  - `96%` · `First-Attempt Pass Rate`
  - `410` · `Professionals Certified`
  - `63` · `Enterprise Clients`
  - `38` · `Compliance Audits Passed`
- Each number uses `StatCounter` — counts up once on intersection.

Light parallax on hero background (translate Y at 0.1× scroll, GPU-accelerated). No grain in hero — keep first paint pristine.

### §2 Trust Bar

Single horizontal strip, dark navy `bg-[--color-surface]`, no card chrome.

- Left: CompTIA Authorized Partner badge (`/public/images/badges/comptia-authorized-partner.png`)
- Middle: 8 client logos in a flex row, monochrome white at 60% opacity, hover to 100%. Where the client is anonymized, render `<div class="industry-text">Regional Bank, Midwest</div>` in Plex Mono per `clientLogo.displayAs`.
- Right: `63 enterprise clients certified across 11 regulated industries` (Plex Mono, text-muted, caption size)

### §3 Problem Section — single editorial column

Single column centered, max-w 40rem.

- Eyebrow `What Buyers Tell Us`
- Display headline (Plex Serif Medium, display-md): `Three problems show up on every discovery call.`
- Three numbered pull-quotes — each is `01` / `02` / `03` in Plex Mono small, followed by 2-line statement in Plex Serif at h3 scale:
  1. Compliance pressure — HIPAA / PCI-DSS / CMMC require certified security staff by name.
  2. High exam-failure rates with previous providers — wasted budget, gap unchanged.
  3. Generic training that doesn't transfer — Pluralsight / LinkedIn Learning don't produce passing scores.
- Closes with a strong line (Plex Serif Medium, display-md, accent-bordered):
  > You don't need another platform. You need a documented pass rate.

All content hardcoded (locked brand voice).

### §4 Programs Overview

Three `.card-dark` (already styled in `globals.css`), 3-column on desktop, 1-column mobile.

Per card (data from Sanity `programPage` doc):
- Eyebrow: `{certName}` (e.g., `CompTIA Security+`) + price right-aligned (`$3,500`)
- Card name (Plex Serif Medium, h3): one-line positioning
- Body (Plex Sans, text-secondary, 3 lines max)
- "Who needs this" — 2-line block, Plex Sans small
- Metadata row (Plex Mono small): `Duration · {durationWeeks} weeks  ·  Sessions · {sessionsPerWeek}× per week`
- Footer link: `Explore the program →` routing to `/programs/{slug}`
- Hover: card lifts `-4px`, border transitions to accent

Section eyebrow `Programs`, display headline `Three certifications. One methodology.` (hardcoded).

### §5 The Sentinel Certification System™ — Diagram B, locked

Vertical timeline. Three phase steps + one result block, connected by a vertical line on the left.

- Container: `<SystemTimeline>` client component, dynamic-imported via `next/dynamic` so GSAP isn't in the initial bundle.
- On scroll into view, GSAP timeline (single):
  1. Vertical connector line draws from top to its current Y in 700ms ease.
  2. As the line passes each dot, that dot fills (scale-up + accent-blue), then its content fades in (24px translateY → 0).
  3. Connector continues; reaches the final result block; the result dot grows + emits a `pulseGlow` keyframe (already in `globals.css`).
- All copy hardcoded:
  - **Phase 01 — Precision Gap Assessment** — full WEBSITE_CONTEXT §4 copy. Meta row: `Duration 1 week · Output Individual gap report per team member`
  - **Phase 02 — Instructor-Led Certification Training** — full copy. Meta: `Cadence 3× per week, 2 hours · Track Per certification`
  - **Phase 03 — Exam Simulation & Readiness Certification** — full copy. Meta: `Threshold 85% sustained · Reporting Weekly to training lead`
  - **Result block** — `96% first-attempt pass rate · Documented across all programs · 2019–2026`
- Section is `.grain-overlay` for ambient texture (subtle).
- If `prefers-reduced-motion: reduce`: timeline disabled, all dots / line / content render in their final state immediately.

### §6 Results By Program — reframed

Single column, max-w 56rem. Data-dense, not heroic.

- Eyebrow `Results · By Program`
- Display headline (Plex Serif, display-md): `Pass rate, by certification.`
- Sub: `Hero stats are top-line totals. Below is the breakdown CISOs quote in board decks.`
- Three data rows, hairline-separated:
  - `Security+` · `{passRateSecurityPlus}%` first-attempt · `{avgWeeksSecurityPlus} wks` avg
  - `CySA+` · `{passRateCySAPlus}%` first-attempt · `{avgWeeksCySAPlus} wks` avg
  - `CASP+` · `{passRateCASPPlus}%` first-attempt · `{avgWeeksCASPPlus} wks` avg
- Footer caption (Plex Mono, text-muted): `Across {professionalsCertified} professionals at {enterpriseClients} clients  ·  {auditsPassed} compliance audits passed  ·  0 failures`

All numbers from `companyStats` singleton.

### §7 Case Study Feature

Full-bleed dark navy panel with grain overlay.

- Eyebrow `Featured Case Study`
- Featured `caseStudy` doc (`featured == true`, limit 1) renders:
  - Large editorial pull-quote (Plex Serif Medium, display-lg) using `caseStudy.buyerQuote`, max-w 40rem
  - Buyer headshot 80px circle + attribution: `{buyerName}, {buyerTitle}` (Plex Sans), `{clientIndustryAnonymized}` (Plex Mono)
  - Metadata row (Plex Mono): `{complianceDriver}  ·  Team of {teamSize}  ·  {weeksToCertification} weeks  ·  {certificationsPassed.join(", ")} passed`
  - CTA link: `Read the full case →` routing to `/results/{caseStudy.slug.current}` (the `/results` page lists all case studies; `/results/[slug]` renders the detail — both out of scope for this brainstorm, but the URL convention is locked here so the homepage link doesn't 404 once those pages are built)

### §8 Testimonials

Single column, generous vertical spacing, no card chrome.

- Section eyebrow `What CISOs Say`
- Display headline `Their words.` (Plex Serif Medium, display-md)
- 3 testimonials (`featured == true`, limit 3, ordered by `order`):
  - Each: pull-quote in Plex Serif Medium at h3 scale (max-w 48rem); below the quote, portrait 56px circle on the left of: `{fullName}` (Plex Sans Medium) · `{title}, {company}` (Plex Sans text-secondary)
  - No star ratings. No quotation marks before the text (typography handles emphasis).

### §9 Industries Served

Six `.card-dark` in a 3×2 grid on desktop, 2×3 on tablet, single column on mobile.

Per card (data from `industryPage`):
- Industry name in Plex Serif Medium (h3)
- 2-line description in Plex Sans (text-secondary)
- Compliance mandate excerpt in Plex Mono (e.g., `HIPAA Security Rule § 164.308`)
- Link `Industry detail →` to `/industries/{slug}`
- Hover: card lifts `-4px`, border accent

Section eyebrow `Industries Served`, headline `Six industries. One certification track per compliance mandate.` (hardcoded).

### §10 Proposal CTA

Full-bleed dark navy section with grain overlay. Single centered column, max-w 48rem.

- Eyebrow `Q3 2026 Enrollment`
- Display headline (Plex Serif Medium, display-lg): `Ready to close your certification gap?`
- Sub: `We're currently accepting Q3 2026 enterprise contracts. {availableSlots} spots remaining.` (where `{availableSlots}` is from `companyStats`)
- Two CTAs, same as hero:
  - Primary `Request a Training Proposal →` — routes to `/contact`
  - Secondary `Book a 20-Minute Discovery Call` — opens `BookingDialog`
- Beneath CTAs (Plex Mono, text-muted): `Response within 1 business day  ·  No-pass, re-train guarantee`

### §11 FAQ Preview

Four accordion rows using rebuilt shadcn `<Accordion>`, single column, max-w 56rem.

- Section eyebrow `FAQ`
- Display headline `Most-asked.` (Plex Serif Medium, display-md)
- Featured FAQs (`featured == true`, limit 4, ordered by `order`):
  - Question in Plex Serif Medium (h3 scale)
  - Answer block in Plex Sans, rendered from Sanity `blockContent` via `<PortableText>`
  - Subtle hairline border only between rows — no card chrome
- Footer link: `See all 12 questions →` routing to `/faq`

### §12 Footer

Three-column on desktop, stacked on mobile.

- Col 1: Logo + tagline (`"Where Enterprise Security Teams Get Certified."`)
- Col 2: Nav links — Programs, Industries, Results, FAQ, About, Contact
- Col 3: Contact — `training@sentinelinstitute.com` · `+1 (312) 555-0194` · `200 W. Monroe Street, Suite 1900, Chicago, IL 60606`
- Below the columns, a thin band:
  - Left: CompTIA Authorized Partner badge + IACET Authorized Provider + MBE Certified
  - Center: Press logos (SC Magazine, Dark Reading, CyberScoop)
  - Right: Social — LinkedIn, X (icons from `lucide-react`)
- Bottom strip:
  - Left: `© 2026 Sentinel Institute LLC` (Plex Mono, text-muted)
  - Right: `Privacy Policy` · `Terms of Service` · `CCPA` (Plex Mono small)

All footer content hardcoded.

---

## 6. Sanity Schemas

Eight document types in `sanity/schemas/`. Each is its own file; `sanity/schemas/index.ts` exports `schemaTypes: SchemaTypeDefinition[]`.

### 6.1 `companyStats` — singleton

```ts
{ _type: 'companyStats',
  passRate: number(0..100),
  professionalsCertified: number,
  enterpriseClients: number,
  auditsPassed: number,
  averageWeeks: number,
  availableSlots: number,
  passRateSecurityPlus: number(0..100),
  passRateCySAPlus: number(0..100),
  passRateCASPPlus: number(0..100),
  avgWeeksSecurityPlus: number,
  avgWeeksCySAPlus: number,
  avgWeeksCASPPlus: number,
  asOfDate: datetime }
```

Singleton enforced via document actions — only one document of this type can exist.

### 6.2 `testimonial[]`

```ts
{ _type: 'testimonial',
  fullName: string (required),
  title: string (required),
  company: string (required),
  industry: string (required),
  industryAnonymized?: string,           // shown in place of `company` if present
  quote: text (max 5 lines),
  portrait: image (hotspot, alt required),
  videoUrl?: url (HTTPS only),
  featured: boolean,
  order: number }
```

### 6.3 `caseStudy[]`

```ts
{ _type: 'caseStudy',
  slug: slug,
  clientIndustry: string,
  clientIndustryAnonymized?: string,
  complianceDriver: 'HIPAA' | 'PCI-DSS' | 'CMMC' | 'SOC 2' | 'NIST CSF' | 'NERC CIP' | 'Other',
  teamSize: number,
  weeksToCertification: number,
  certificationsPassed: string[],         // e.g. ['Security+', 'CySA+']
  buyerName: string,
  buyerTitle: string,
  buyerHeadshot: image,
  buyerQuote: text (max 4 lines),
  challenge: blockContent,
  solution: blockContent,
  outcome: blockContent,
  outcomeMetrics: { label: string, value: string }[],
  clientLogo?: image,
  publishedDate: datetime,
  featured: boolean }
```

### 6.4 `programPage` — exactly 3 docs

```ts
{ _type: 'programPage',
  slug: slug,                             // validated: slug.current ∈ {'security-plus', 'cysa-plus', 'casp-plus'}
  certName: string,
  eyebrow: string,
  oneliner: text,
  priceUSD: number,
  durationWeeks: number,
  sessionsPerWeek: number,
  whoNeedsIt: blockContent,
  curriculumOutline: blockContent,
  examObjectives: string[],
  homepageOrder: number,
  seoTitle: string,
  seoDescription: string }
```

### 6.5 `industryPage[]` — 6+ docs

```ts
{ _type: 'industryPage',
  slug: slug,
  industryName: string,
  complianceMandate: string,              // 'HIPAA Security Rule § 164.308'
  complianceMandateFull: text,
  trainingContext: blockContent,
  featuredCaseStudy?: reference(caseStudy),
  homepageOrder: number,
  seoTitle: string,
  seoDescription: string }
```

### 6.6 `faq[]`

```ts
{ _type: 'faq',
  question: string,
  answer: blockContent,
  category: 'general' | 'programs' | 'pricing' | 'logistics' | 'compliance',
  featured: boolean,
  order: number }
```

### 6.7 `pressMention[]`

```ts
{ _type: 'pressMention',
  outletName: string,                     // 'SC Magazine', 'Dark Reading', 'CyberScoop'
  articleTitle: string,
  url: url (HTTPS),
  publishedDate: datetime,
  logo: image,
  showOnHero: boolean,
  order: number }
```

### 6.8 `clientLogo[]`

```ts
{ _type: 'clientLogo',
  companyName: string,
  anonymizedAs?: string,                  // 'Regional Bank, Midwest'
  logo: image,
  displayAs: 'logo' | 'industry-text',
  order: number }
```

### 6.9 Validation patterns

- All `slug` fields: lowercase, hyphen-separated, unique within type
- All `image` fields: required `alt` text, hotspot enabled
- All `url` fields: HTTPS-only regex validation
- All `passRate*` fields: integer 0–100
- `featured` fields default `false`; toggled per editorial campaign

### 6.10 GROQ queries

Centralized in `src/lib/sanity/queries.ts`:

```ts
companyStatsQuery       = *[_type == "companyStats"][0]
homepageTestimonials    = *[_type == "testimonial" && featured == true] | order(order asc)[0..2]
featuredCaseStudy       = *[_type == "caseStudy" && featured == true] | order(publishedDate desc)[0]
allPrograms             = *[_type == "programPage"] | order(homepageOrder asc)
homepageIndustries      = *[_type == "industryPage"] | order(homepageOrder asc)[0..5]
homepageFAQs            = *[_type == "faq" && featured == true] | order(order asc)[0..3]
heroPress               = *[_type == "pressMention" && showOnHero == true] | order(order asc)
clientLogos             = *[_type == "clientLogo"] | order(order asc)
```

All queries co-resolved in `(marketing)/page.tsx` via `Promise.all`. Image fields use `next-sanity/image` projections where needed.

---

## 7. Error Handling

| Surface | Failure mode | Behavior |
|---|---|---|
| Sanity fetch in `page.tsx` | API down, schema mismatch, malformed response | Render last-known cached page (stale-while-revalidate). On first build with no cache: fall back to constants in `src/lib/sanity/fallbacks.ts`. Page never returns 500. |
| `ProposalForm` client validation | Zod schema fail | Field-level inline errors via `react-hook-form`. Never blanket messages. |
| `/api/proposal` server re-validation | Zod fail, business-email check fail | `422 { field, message }`. Form re-shows specific field error. |
| `/api/proposal` rate limit | >5/min/IP from Upstash | `429 { retryAfter }` with friendly `"You've submitted recently. Try again in {N} seconds."` |
| Resend send fail | API error or quota | Log server-side only; respond `200` to user (form succeeded from their view); Slack alert tagged `[email-failed]` so internal team manually follows up. |
| HubSpot submit fail | Forms API error | Same pattern: log + Slack `[hubspot-failed]` alert. Never block user response. |
| Slack webhook fail | URL bad / Slack down | Swallow; log server only. Email already sent — user is fine. |
| Cal.com modal | Iframe blocked by corp firewall | Fallback to direct anchor `target="_blank"` to `https://cal.com/sentinelinstitute/discovery`. |
| GA4 | `window.gtag` undefined (consent declined, ad-blockers) | `events.ts` wrapper checks `typeof window.gtag === 'function'` before every call. Never throws. |
| `prefers-reduced-motion` | User opted out | All `@media (prefers-reduced-motion: reduce)` rules in `globals.css` disable animations. GSAP timeline skipped — final state rendered immediately. |

**Universal principles:**
- User-facing error messages are always friendly. Internals never leak.
- `console.log` removed before commit (ESLint rule).
- Server logs go to Vercel's log drain only.

---

## 8. Testing

| Layer | Tool | Verifies |
|---|---|---|
| Type | TypeScript strict | `pnpm build` passes. Zero `any`. |
| Lint | ESLint (next config) | `pnpm lint` clean. |
| Schema typing | next-sanity types | All GROQ result types align with `src/lib/sanity/types.ts`. |
| Form validation | Manual + webapp-testing skill | Zod rejects: empty fields, gmail / yahoo / hotmail / icloud / outlook / me / aol domains, non-US phone format. |
| Form happy path | webapp-testing skill | Submit valid proposal; verify Resend prospect + training@ emails, Slack #new-leads notification, HubSpot record. |
| Booking flow | webapp-testing skill | Open Cal.com modal; verify it renders; verify fallback link works if iframe blocked. |
| Performance | Lighthouse CI | LCP < 2.5s · CLS < 0.1 · INP < 200ms · Perf ≥ 90 · A11y 100. |
| Responsive | Manual + browser DevTools | 375 / 768 / 1280 / 1920px — every section. |
| GA4 events | GA4 DebugView | `proposal_form_start`, `proposal_form_submit`, `discovery_call_booked`, `scroll_depth` (25/50/75/100), `cta_click` all fire correctly with correct params. |
| Reduced motion | Browser DevTools emulation | All animations disabled; GSAP timeline skipped. |
| Security | SECURITY.md checklist | Pre-commit for PR 6, PR 7, PR 8. |

---

## 9. Performance Contract

Page-specific targets exceeding the CLAUDE.md baseline because the homepage ships GSAP:

- Initial JS bundle ≤ **120 KB gzipped** (CLAUDE.md baseline is 150 KB)
- LCP ≤ **2.5s** on 4G throttling
- CLS ≤ **0.1**
- INP ≤ **200ms**
- Lighthouse Performance ≥ **90**
- Lighthouse Accessibility = **100**

**How we hit them:**
- GSAP dynamic-imported in `SentinelSystem.tsx` (`next/dynamic`), excluded from initial bundle.
- IBM Plex Sans Regular + IBM Plex Serif Medium preloaded via `<link rel="preload" as="font" crossorigin>`. Other weights load on `font-display: swap`.
- All fonts self-hosted from `/public/fonts/`. No Google Fonts CDN in production (only allowed in `.superpowers/brainstorm/` mockup screens during this brainstorm).
- All images via `next/image` with explicit width/height to avoid CLS.
- Hero stat-pillar numbers are server-rendered as text first; `StatCounter` only animates them via JS once visible.
- Sanity images via CDN with `auto=format&fit=max&w={explicit}`.
- No barrel imports (`import * from`); ESLint rule enforces.
- Single CSS file (`globals.css` — Tailwind v4 doesn't barrel).

---

## 10. Security

Per `SECURITY.md` (already in project root). Specifics that apply to the homepage:

- All secrets in `.env.local`. `.env.local` is gitignored. `.env.example` is committed.
- `SANITY_API_TOKEN` is server-only (no `NEXT_PUBLIC_` prefix). Used only in `src/lib/sanity/client.ts`.
- `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SLACK_WEBHOOK_URL`, `KV_*` tokens — all server-only.
- CSP header (in `next.config.ts`) restricts `script-src` to self + `js.stripe.com` + `googletagmanager.com`. `frame-src` allows `js.stripe.com` and `cal.com` only.
- `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` — all in `next.config.ts`.
- Form inputs: Zod validation client + server (re-validates same schema). Business-email check on server.
- Rate limit: 5 submissions/min/IP via Upstash. 429 friendly response.
- No `dangerouslySetInnerHTML` anywhere on the homepage.
- CCPA consent banner gating GA4 — `consent.ts` exports a hook that returns the current consent state; `events.ts` checks consent before every `gtag` call. (Consent banner UI is a separate sub-task in PR 8.)

Run the SECURITY.md checklist before merging PR 6, PR 7, and PR 8.

---

## 11. Build Sequence

8 PRs. Each ends in a green Vercel preview.

### PR 1 · Foundations
- Rebuild 15 shadcn components on Sentinel tokens (`bg-[--color-surface]`, `text-[--color-text-primary]`, `border-[--color-border]`, etc.)
- `Header.tsx`, `Footer.tsx`, `(marketing)/layout.tsx`
- Self-hosted IBM Plex fonts in `/public/fonts/` (Regular + Medium for Serif; Regular + Medium for Sans; Regular for Mono)
- Font preloads in `app/layout.tsx`
- Metadata, favicon, `robots.txt`, `sitemap.ts`
- Confirm `pnpm build` clean

### PR 2 · Hero + Trust Bar
- `Hero.tsx` with hardcoded headline + stat pillar (placeholder numbers as constants until PR 4)
- `TrustBar.tsx` with hardcoded press + CompTIA badge
- `StatCounter`, `LineReveal`, `FadeUp` motion wrappers
- First Vercel preview deploy

### PR 3 · The Sentinel Certification System™
- `SentinelSystem.tsx` (server-rendered shell)
- `SystemTimeline.tsx` (client, dynamic-imported, GSAP)
- All phase copy hardcoded
- `prefers-reduced-motion` fallback verified

### PR 4 · Sanity schemas + studio
- All 8 schemas + indexes
- GROQ queries in `src/lib/sanity/queries.ts`
- `src/lib/sanity/types.ts` typed
- Studio mounted at `/studio`
- Seed real content (manually, by editorial team — coordinate with Marcus)
- Swap Hero + TrustBar to read from Sanity
- ISR wired (`revalidate = 3600`)
- `/api/revalidate/route.ts` for webhook-driven on-demand revalidation
- `src/lib/sanity/fallbacks.ts` populated for resilience

### PR 5 · Sections 3, 4, 6, 7, 8, 9
- `ProblemSection.tsx` (hardcoded copy)
- `ProgramsOverview.tsx` (Sanity)
- `ResultsByProgram.tsx` (Sanity `companyStats`)
- `CaseStudyFeature.tsx` (Sanity featured)
- `Testimonials.tsx` (Sanity)
- `IndustriesServed.tsx` (Sanity)

### PR 6 · Proposal flow
- `ProposalForm.tsx` with full Zod schema (all fields per WEBSITE_CONTEXT §7)
- `/contact` page — single-page form host that wraps `ProposalForm` with a narrow editorial header (eyebrow `Request a Training Proposal`, h1 `Tell us about your team.`, sub paraphrased from WEBSITE_CONTEXT §7 SLA)
- `src/app/api/proposal/route.ts`: Zod re-validate → rate-limit → Resend prospect + internal → Slack webhook → HubSpot Forms API
- `src/lib/rate-limit.ts` (Upstash)
- `src/lib/email/resend.ts` + React Email templates in `src/lib/email/templates.tsx`
- `/thanks` page with print stylesheet (per WEBSITE_CONTEXT §9)
- **SECURITY.md checklist before merge**
- **webapp-testing skill** runs the full form happy path

### PR 7 · §10 CTA + §11 FAQ + Cal.com modal
- `ProposalCTA.tsx` with `availableSlots` from Sanity
- `FAQPreview.tsx` using rebuilt shadcn `<Accordion>`, `<PortableText>` for answers
- `BookingDialog.tsx` Cal.com modal with iframe fallback
- **webapp-testing skill** runs booking flow

### PR 8 · GA4 + CCPA + final audit
- `src/lib/analytics/events.ts` wired (already has the typed wrappers)
- `src/lib/analytics/consent.ts` CCPA consent state + banner UI
- GA4 events wired across all sections (cta_click, scroll_depth, form events)
- Structured data (JSON-LD) — Organization schema on home, Course schema on program pages (Phase 2 page brainstorm)
- Lighthouse CI integration
- Manual responsive QA across 375 / 768 / 1280 / 1920
- **SECURITY.md final checklist**
- Final preview → production cutover via Vercel

---

## 12. Open Questions Deferred to Implementation

These are intentionally not specified here because they will not block this brainstorm becoming a plan. Resolve during their respective PR:

- **Exact IBM Plex weight inventory** — confirm whether we need Plex Serif 400+500 (probably yes) and Plex Sans 400+500+600 (probably yes) before PR 1. Goal: minimum weights to hit the design without bundle bloat.
- **CCPA banner copy + visual** — picked up in PR 8. Plain, narrow, dismissible. Doesn't block hero on first paint.
- **Stripe Payment Link for Security Awareness ($1,200)** — per WEBSITE_CONTEXT §7, this is a separate low-friction entry path. Not required on the homepage. Decide whether it earns a homepage entry point during PR 5.
- **`product-marketing-context.md`** — currently 100% placeholder comments. WEBSITE_CONTEXT.md §4 covers most positioning content. We will draft `product-marketing-context.md` from WEBSITE_CONTEXT.md §4 during PR 1 setup, then ask Marcus to validate before PR 5.

---

## 13. References

- `WEBSITE_CONTEXT.md` — brand, offer, audience, integrations (canonical brief)
- `CLAUDE.md` — build orchestration, tech standards, forbidden choices
- `STACK_CORRECTIONS.md` — actual installed versions, Tailwind v4 deltas
- `SECURITY.md` — pre-commit checklist
- `.claude/skills/luxury-highticket/SKILL.md` — luxury design patterns
- `.claude/skills/conversion-engine/SKILL.md` — copy + CRO patterns
- `.claude/skills/security-guard/SKILL.md` — applied per API route + form
- `.claude/skills/stack-config/SKILL.md` — applied during PR 1
- `.agents/skills/*` — 26 external skills installed

---

End of design spec.
