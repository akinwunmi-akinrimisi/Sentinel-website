# Sentinel Homepage — PR 7: §10 CTA + §11 FAQ + Cal.com Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the final two homepage sections — §10 Proposal CTA (full-bleed dark with `availableSlots` from Sanity) and §11 FAQ Preview (4 accordion rows rendered from Sanity `blockContent` answers via `<PortableText>`). Add a `BookingDialog` Cal.com modal wired to every "Book a 20-Minute Discovery Call" button on the homepage. Close the honeypot gap flagged in the PR 6 code review by adding a hidden `<input>` to `ProposalForm` and rejecting populated honeypots server-side. Add a `Faq[]` fallback so the FAQ section degrades cleanly when Sanity is empty.

**Architecture:** `ProposalCTA` and `FAQPreview` are server components — `ProposalCTA` takes `availableSlots: number` (derived in `page.tsx` from `companyStats`), `FAQPreview` takes `faqs: Faq[]`. The Cal.com modal lives in `BookingDialog.tsx` (client component) — it controls a shadcn `<Dialog>` whose body is an `<iframe src={NEXT_PUBLIC_CAL_LINK}>`. The dialog exposes a fallback "Open in new tab" link inside its body so users on networks that block iframes can still book. Because two sections (Hero + ProposalCTA) need the modal trigger, the trigger is exposed as a small `BookingButton` named export that any server component can render. Honeypot: a screen-reader-hidden `<input name="hp_field">` is added to `ProposalForm`; the schema gains an optional `hp_field` that the API route validates must be empty, otherwise returns a 200 success without sending the email (mimics success so the bot doesn't iterate).

**Tech Stack:** Next.js 16.2.6 server components + 1 client component · TypeScript strict · `next-sanity/portable-text` for `<PortableText>` (transitively in next-sanity v12) · shadcn `<Accordion>` + `<Dialog>` (already installed) · Cal.com via plain `<iframe>` (no `@calcom/embed-react` dep added — keeps bundle smaller).

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` §10 Proposal CTA, §11 FAQ Preview, §11.1 PR 7. `WEBSITE_CONTEXT.md` §7 (Cal.com link).

**Out of scope for PR 7 (deferred to PR 8):**
- GA4 `discovery_call_booked` event (Cal.com posts a message via `postMessage` from the iframe — wiring the listener is PR 8 polish).
- Lighthouse CI / final responsive QA — PR 8.
- CCPA consent banner — PR 8.
- Stripe Payment Link for Security Awareness — out of scope (separate flow).

---

## File Structure for This PR

```
src/lib/sanity/fallbacks.ts                       MODIFY: add Faq import + FALLBACK_FAQS
src/lib/proposal/schema.ts                        MODIFY: add optional hp_field (honeypot)

src/components/sections/
├── BookingDialog.tsx                             CREATE: client component, Cal.com iframe modal
├── ProposalCTA.tsx                               CREATE: §10 — full-bleed dark CTA with availableSlots
└── FAQPreview.tsx                                CREATE: §11 — 4 accordion rows rendered via PortableText

src/components/sections/Hero.tsx                  MODIFY: secondary CTA opens BookingDialog (was target=_blank)
src/components/forms/ProposalForm.tsx             MODIFY: add hidden honeypot input
src/app/api/proposal/route.ts                    MODIFY: reject populated honeypot (silent 200)
src/app/(marketing)/page.tsx                     MODIFY: import 2 new sections + render in order
```

---

## Task 1 — Add `Faq` fallback

Append a `Faq[]` fallback to `src/lib/sanity/fallbacks.ts` so the FAQ section renders sensibly when Sanity returns empty.

**Files:**
- Modify: `src/lib/sanity/fallbacks.ts`

- [ ] **Step 1: Update the import block at the top** — add `Faq` to the existing import list:

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

- [ ] **Step 2: Append at the end of the file:**

```ts

export const FALLBACK_FAQS: Faq[] = [
  {
    _id: 'fallback-faq-1',
    question: 'Do you offer a pass guarantee?',
    answer: [
      {
        _type: 'block',
        _key: 'faq1-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq1-1-s1',
            text: 'Yes. Every Sentinel Institute contract includes a no-pass, re-train clause: any participant who does not pass on the first attempt is re-enrolled in the next cohort at no additional cost.',
            marks: [],
          },
        ],
      },
    ],
    category: 'general',
    featured: true,
    order: 0,
  },
  {
    _id: 'fallback-faq-2',
    question: 'How long does a typical cohort take?',
    answer: [
      {
        _type: 'block',
        _key: 'faq2-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq2-1-s1',
            text: 'Security+ runs 8 weeks, CySA+ runs 10 weeks, and CASP+ runs 12 weeks. We hold three 2-hour live sessions per week, recorded for asynchronous access if a participant misses a session.',
            marks: [],
          },
        ],
      },
    ],
    category: 'logistics',
    featured: true,
    order: 1,
  },
  {
    _id: 'fallback-faq-3',
    question: 'What does pricing look like for a 25-person cohort?',
    answer: [
      {
        _type: 'block',
        _key: 'faq3-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq3-1-s1',
            text: 'Per-seat pricing scales down with cohort size and certification track. A 25-person Security+ cohort lands in the high five figures; we send a tailored proposal within one business day of your request.',
            marks: [],
          },
        ],
      },
    ],
    category: 'pricing',
    featured: true,
    order: 2,
  },
  {
    _id: 'fallback-faq-4',
    question: 'Will this satisfy our compliance auditor?',
    answer: [
      {
        _type: 'block',
        _key: 'faq4-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq4-1-s1',
            text: 'We provide named, dated certification artifacts mapped to the specific compliance framework you are audited against — HIPAA, PCI-DSS, CMMC, SOC 2, NIST CSF, NERC CIP. Auditors have accepted our documentation on every engagement to date.',
            marks: [],
          },
        ],
      },
    ],
    category: 'compliance',
    featured: true,
    order: 3,
  },
]
```

- [ ] **Step 3: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors. The PortableTextBlock shape matches the pattern used in PR 5 Task 11 fallbacks.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sanity/fallbacks.ts
git commit -m "feat(pr7): add FALLBACK_FAQS"
```

---

## Task 2 — Honeypot field in schema + form + route

The PR 6 code review flagged the absence of a honeypot. Close that gap before PR 7 ships.

**Files:**
- Modify: `src/lib/proposal/schema.ts`
- Modify: `src/components/forms/ProposalForm.tsx`
- Modify: `src/app/api/proposal/route.ts`

- [ ] **Step 1: Update `src/lib/proposal/schema.ts`** — add `hp_field` to the schema. Locate the `notes` field and add after it (before the closing `})`):

```ts
  notes: z.string().trim().max(2000).optional().default(''),
  /** Honeypot — must be empty. Bots fill all fields; humans never see it (sr-only). */
  hp_field: z.string().max(0).optional().default(''),
})
```

The `.max(0)` validation will fail if anything was typed. Combined with `.optional().default('')`, the field accepts nothing or an empty string. The API route rejects anything that fails this constraint via a silent success (not a 422, to avoid teaching bots).

- [ ] **Step 2: Update `src/components/forms/ProposalForm.tsx`** — add a hidden honeypot input. Inside the `<form>`, just after the opening `<form ...>` tag and BEFORE the first `<Field>`, insert:

```tsx
      {/* Honeypot — hidden from sighted users + assistive tech. Bots fill all fields. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[10000px] -top-[10000px] h-0 w-0 opacity-0 pointer-events-none"
        {...register("hp_field")}
      />
```

The `absolute` + off-screen positioning hides from sighted users; `tabIndex={-1}` skips tab order; `aria-hidden="true"` hides from screen readers; `autoComplete="off"` prevents password managers from filling it.

Also update `useForm`'s `defaultValues` to include `hp_field: ""`:

```tsx
    defaultValues: {
      fullName: "",
      businessEmail: "",
      phone: "",
      company: "",
      jobTitle: "",
      certifications: [],
      notes: "",
      hp_field: "",
    },
```

- [ ] **Step 3: Update `src/app/api/proposal/route.ts`** — after `proposalSchema.safeParse(json)` succeeds and `payload` is destructured (around line 95-98), add a honeypot check BEFORE the rate-limit step:

```ts
  const payload = parsed.data

  // Honeypot — bots fill all fields. If hp_field is non-empty, silently 200
  // without sending email. The bot thinks it succeeded and doesn't retry.
  if (payload.hp_field && payload.hp_field.length > 0) {
    return NextResponse.json({ success: true })
  }

  // 3. Rate limit by IP
```

- [ ] **Step 4: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/proposal/schema.ts src/components/forms/ProposalForm.tsx src/app/api/proposal/route.ts
git commit -m "feat(pr7): honeypot field on proposal form + silent 200 on populated"
```

---

## Task 3 — `BookingDialog` client component

Renders a shadcn `<Dialog>` whose body is a Cal.com iframe. Exposes a `<BookingButton>` named export — a styled trigger that opens the dialog. Inside the dialog body, render a fallback "Open in new tab" link for users on networks that block iframes (e.g., strict corp firewalls).

**Files:**
- Create: `src/components/sections/BookingDialog.tsx`

- [ ] **Step 1: Create `src/components/sections/BookingDialog.tsx`**:

```tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"

interface BookingButtonProps {
  variant?: "primary" | "secondary"
  className?: string
  /** Optional data-cta attribute for GA4 — defaults to "booking-dialog-open". */
  ctaId?: string
  children?: React.ReactNode
}

/**
 * Button that opens a Cal.com discovery-call modal. Falls back to a
 * target="_blank" anchor inside the modal body when the iframe is blocked
 * (some corporate networks). Use anywhere the spec calls for a
 * "Book a 20-Minute Discovery Call" CTA — Hero secondary, ProposalCTA secondary.
 */
export function BookingButton({
  variant = "secondary",
  className,
  ctaId = "booking-dialog-open",
  children = "Book a 20-Minute Discovery Call",
}: BookingButtonProps) {
  const [open, setOpen] = useState(false)
  const cls = variant === "primary" ? "btn-primary" : "btn-secondary"
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`${cls}${className ? ` ${className}` : ""}`}
          data-cta={ctaId}
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[960px] h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
          <DialogTitle className="font-display text-[1.125rem] text-[var(--color-text-primary)]">
            Book a 20-Minute Discovery Call
          </DialogTitle>
          <DialogDescription className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            Sentinel Institute · Enterprise Cybersecurity Certification
          </DialogDescription>
        </DialogHeader>
        <div className="h-full w-full bg-white">
          <iframe
            src={CAL_LINK}
            title="Book a 20-Minute Discovery Call"
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; geolocation"
          />
        </div>
        <div className="px-6 py-3 border-t border-[var(--color-border)] flex justify-end">
          <a
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
            data-cta="booking-dialog-fallback"
          >
            Open in new tab →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors. shadcn `<Dialog>` lives at `src/components/ui/dialog.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/BookingDialog.tsx
git commit -m "feat(pr7): BookingButton + Cal.com iframe modal with new-tab fallback"
```

---

## Task 4 — Wire `BookingButton` into `Hero.tsx`

The Hero currently has a `<a target="_blank">` for the secondary CTA. Replace with `<BookingButton>`.

**Files:**
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Read `src/components/sections/Hero.tsx`** to find the existing secondary CTA `<a>` element.

- [ ] **Step 2: Edit the file:**
  1. Add an import for the BookingButton near the other component imports:
  ```tsx
  import { BookingButton } from "@/components/sections/BookingDialog"
  ```
  2. Replace the existing secondary CTA `<a href={…CAL_LINK} target="_blank">…</a>` element (the one with class `btn-secondary` and the label "Book a 20-Minute Discovery Call") with:
  ```tsx
  <BookingButton variant="secondary" ctaId="hero-secondary" />
  ```

- [ ] **Step 3: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "refactor(pr7): Hero secondary CTA uses BookingButton"
```

---

## Task 5 — `ProposalCTA.tsx` (§10)

Full-bleed dark navy with grain-overlay. Single centered column, max-w 48rem. Eyebrow, display headline, sub with `{availableSlots}` interpolation, two CTAs (Primary `Request a Training Proposal →` routes to `/contact`; Secondary opens BookingDialog), beneath caption.

**Files:**
- Create: `src/components/sections/ProposalCTA.tsx`

- [ ] **Step 1: Create `src/components/sections/ProposalCTA.tsx`**:

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"

interface ProposalCTAProps {
  /** Number of remaining cohort slots — pulled from companyStats. */
  availableSlots: number
}

export function ProposalCTA({ availableSlots }: ProposalCTAProps) {
  return (
    <section
      aria-labelledby="proposal-cta-headline"
      className="relative py-24 md:py-32 bg-[var(--color-surface)] grain-overlay overflow-hidden"
    >
      <div className="container-sentinel relative">
        <div className="max-w-[48rem] mx-auto text-center">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Q3 2026 Enrollment
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="proposal-cta-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
            >
              Ready to close your certification gap?
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] max-w-[36rem] mx-auto leading-relaxed">
              We&apos;re currently accepting Q3 2026 enterprise contracts.{" "}
              <span className="text-[var(--color-text-primary)] font-medium">
                {availableSlots} spots remaining.
              </span>
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary" data-cta="cta-primary">
                Request a Training Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="cta-secondary" />
            </div>
          </FadeUp>

          <FadeUp delay={0.6}>
            <p className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Response within 1 business day  ·  No-pass, re-train guarantee
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
git add src/components/sections/ProposalCTA.tsx
git commit -m "feat(pr7): ProposalCTA (§10, full-bleed dark with availableSlots)"
```

---

## Task 6 — `FAQPreview.tsx` (§11)

Four accordion rows using shadcn `<Accordion>`. Each row: question (Plex Serif h3) + answer rendered from `blockContent` via `<PortableText>`. Subtle hairline border between rows. Footer link `See all 12 questions →` to `/faq`.

**Files:**
- Create: `src/components/sections/FAQPreview.tsx`

- [ ] **Step 1: Create `src/components/sections/FAQPreview.tsx`**:

```tsx
import Link from "next/link"
import { PortableText, type PortableTextComponents } from "next-sanity"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FadeUp } from "@/components/motion/FadeUp"
import type { Faq } from "@/lib/sanity/types"

interface FAQPreviewProps {
  faqs: Faq[]
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h3 className="font-display font-medium text-[var(--color-text-primary)] text-[1.125rem] mb-2 mt-4">{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className="font-display font-medium text-[var(--color-text-primary)] text-[1rem] mb-2 mt-3">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="pl-4 border-l-2 border-[var(--color-accent-light)] text-[var(--color-text-secondary)] italic my-3">{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="text-[var(--color-text-primary)] font-medium">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={(value as { href?: string })?.href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1 text-[var(--color-text-secondary)]">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 my-3 space-y-1 text-[var(--color-text-secondary)]">{children}</ol>,
  },
}

export function FAQPreview({ faqs }: FAQPreviewProps) {
  if (faqs.length === 0) return null

  return (
    <section
      aria-labelledby="faq-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[56rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              FAQ
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="faq-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Most-asked.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <Accordion type="single" collapsible className="mt-12">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq._id}
                  value={faq._id}
                  className="border-b border-[var(--color-border)]"
                >
                  <AccordionTrigger className="text-left py-6">
                    <span
                      className="font-display font-medium text-[var(--color-text-primary)] leading-[1.3]"
                      style={{ fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)" }}
                    >
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-1">
                    <PortableText value={faq.answer} components={portableTextComponents} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>

          <FadeUp delay={0.5}>
            <Link
              href="/faq"
              className="mt-10 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
              data-cta="faq-preview-all"
            >
              See all 12 questions
              <span aria-hidden="true">→</span>
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors. `PortableText` and `PortableTextComponents` are exported from `next-sanity`. shadcn `<Accordion>` lives at `src/components/ui/accordion.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/FAQPreview.tsx
git commit -m "feat(pr7): FAQPreview (§11, accordion + PortableText)"
```

---

## Task 7 — Compose §10 + §11 into `(marketing)/page.tsx`

Insert `<ProposalCTA>` after `<IndustriesServed>` and `<FAQPreview>` after `<ProposalCTA>`. Resolve fallback for FAQs.

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Read the current file** to confirm the existing 9-section composition.

- [ ] **Step 2: Edit `src/app/(marketing)/page.tsx`:**

a. Add imports near the existing section imports:
```tsx
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { FAQPreview } from "@/components/sections/FAQPreview"
```

b. Add `FALLBACK_FAQS` to the fallbacks import block:
```tsx
import {
  FALLBACK_CASE_STUDY,
  FALLBACK_CLIENT_LOGOS,
  FALLBACK_COMPANY_STATS,
  FALLBACK_FAQS,
  FALLBACK_HERO_PRESS,
  FALLBACK_INDUSTRIES,
  FALLBACK_PROGRAMS,
  FALLBACK_TESTIMONIALS,
} from "@/lib/sanity/fallbacks"
```

c. Inside `HomePage`, after the `industries` derivation, add:
```tsx
  const faqs = data.homepageFAQs.length > 0 ? data.homepageFAQs : FALLBACK_FAQS
```

d. Update the JSX to render ProposalCTA + FAQPreview after IndustriesServed:
```tsx
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
      <ProposalCTA availableSlots={stats.availableSlots} />
      <FAQPreview faqs={faqs} />
```

- [ ] **Step 3: Verify build**

Run: `pnpm tsc --noEmit && pnpm build`

Expected: zero errors. The route table should still show `/` as the homepage with ISR. The page now renders 11 sections.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/page.tsx"
git commit -m "feat(pr7): compose 11-section homepage with §10 + §11"
```

---

## Task 8 — Final verification + tag

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`. Expected: zero errors.

- [ ] **Step 3: Build**

Run: `pnpm build`. Expected: clean exit. All previous routes plus an 11-section `/` homepage.

- [ ] **Step 4: Smoke (optional, dev only)**

If the user has `pnpm dev` running already (per earlier session note, it's on :3000), open http://localhost:3000 and visually confirm:
- §10 ProposalCTA renders below IndustriesServed with the "{N} spots remaining" callout.
- §11 FAQPreview renders below ProposalCTA with 4 expandable accordion rows.
- Clicking "Book a 20-Minute Discovery Call" anywhere (Hero or ProposalCTA secondary) opens the Cal.com modal.
- The modal has an "Open in new tab" fallback link in its footer.
- Honeypot on the contact form: open `/contact`, fill all visible fields, submit — expect redirect to `/thanks`. Then inspect the DOM for the hidden `hp_field` input (should be present, off-screen).

Skip if `pnpm dev` isn't running.

- [ ] **Step 5: Tag PR 7 locally**

```bash
git tag pr-7-cta-faq-booking
```

Do not push.

- [ ] **Step 6: Brief**

Summarize.

---

## Self-Review (Spec Coverage)

| Spec §11.1 PR 7 bullet | Covered by | Status |
|---|---|---|
| `ProposalCTA.tsx` with `availableSlots` from Sanity | Tasks 5 + 7 | ✅ |
| `FAQPreview.tsx` using rebuilt shadcn `<Accordion>`, `<PortableText>` for answers | Task 6 | ✅ |
| `BookingDialog.tsx` Cal.com modal with iframe fallback | Task 3 | ✅ |
| webapp-testing skill runs booking flow | Task 8 step 4 (manual; depends on dev server) | ⚠️ Conditional |

| Spec §10 detail | Task | Status |
|---|---|---|
| Full-bleed dark navy + grain-overlay | Task 5 | ✅ |
| Eyebrow `Q3 2026 Enrollment` | Task 5 | ✅ |
| Display headline `Ready to close your certification gap?` | Task 5 | ✅ |
| Sub with `{availableSlots} spots remaining` | Task 5 | ✅ |
| Primary `Request a Training Proposal →` → `/contact` | Task 5 | ✅ |
| Secondary `Book a 20-Minute Discovery Call` → BookingDialog | Task 5 (via BookingButton) | ✅ |
| Mono caption `Response within 1 business day · No-pass, re-train guarantee` | Task 5 | ✅ |

| Spec §11 detail | Task | Status |
|---|---|---|
| Section eyebrow `FAQ` | Task 6 | ✅ |
| Display headline `Most-asked.` | Task 6 | ✅ |
| Featured FAQs (4 max, ordered by `order`) | Task 6 (driven by `faqs` prop) + Task 7 (page.tsx slices via existing query) | ✅ |
| Question in serif h3 scale | Task 6 | ✅ |
| Answer in PortableText | Task 6 (portableTextComponents) | ✅ |
| Subtle hairline border between rows | Task 6 (`border-b border-[var(--color-border)]`) | ✅ |
| Footer link `See all 12 questions →` to `/faq` | Task 6 | ✅ |

| Cross-cutting | Task | Status |
|---|---|---|
| Honeypot field (closing PR 6 review gap) | Task 2 | ✅ |
| `Faq[]` fallback so /thanks degradation works end-to-end | Task 1 | ✅ |
| BookingButton reused by Hero secondary CTA | Task 4 | ✅ |

**Placeholder scan:** Grepped this plan for `TBD`, `TODO`, `fill in`, `implement later` — no hits.

**Type consistency:** `BookingButton` (Task 3) is imported by `Hero.tsx` (Task 4) and `ProposalCTA.tsx` (Task 5) — identical signature. `Faq` from `@/lib/sanity/types` is consumed by `FAQPreview.tsx` (Task 6) and matches `FALLBACK_FAQS` (Task 1). `PortableTextBlock[]` shape on `faq.answer` matches `<PortableText value={faq.answer}>` in Task 6.
