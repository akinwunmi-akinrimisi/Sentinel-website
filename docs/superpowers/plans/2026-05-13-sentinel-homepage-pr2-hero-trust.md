# Sentinel Homepage — PR 2: Hero + Trust Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hero section (Layout B — Editorial + Stat Pillar) and the Trust Bar section, plus the three reusable motion primitives the rest of the homepage will share. The (marketing) homepage replaces its PR 1 stub with these two sections composed end-to-end.

**Architecture:** Hero is a server component that hardcodes its copy per the locked brainstorm; it renders client motion wrappers (FadeUp, LineReveal, StatCounter) for the eyebrow / headline / stats. Trust Bar is also a server component with hardcoded placeholder content (Sanity wiring lands in PR 4). The two sections are stacked inside `(marketing)/page.tsx`.

**Tech Stack:** Next.js 16 (App Router, server-first) · Tailwind v4 · IBM Plex · CSS-driven animation via `globals.css` keyframes triggered by client-side IntersectionObserver wrappers. No GSAP yet (that's PR 3).

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` — PR 2 scope is §5 (§1 Hero, §2 Trust Bar) + §11.1 PR 2.

**Tech debt rolled in from PR 1 final review (resolved as the first commit before any new feature work):**
- Dead `--color-accent: #2563EB` token in Sentinel `@theme` block (`src/app/globals.css:29`) is unreachable due to bridge override at line 111. Cleaned up so future contributors aren't misled.
- Two parallel button systems (`.btn-primary` utility class vs shadcn `<Button>`) and the raw-`var()`-vs-semantic-class question — both resolved in a new `docs/CONVENTIONS.md`.

**Out of scope for PR 2 (deferred):**
- Hero parallax (translate Y 0.1× scroll) — deferred to PR 8 polish alongside font preloads and Lighthouse tuning. Static hero in PR 2.
- CompTIA Authorized Partner badge image (`/public/images/badges/comptia-authorized-partner.png`) — file doesn't exist yet. Trust Bar uses a text fallback chip; replace with real SVG when the brand asset is delivered.
- Client logo SVGs — same reason. Trust Bar uses the `industry-text` rendering mode per the schema spec, showing anonymized industry phrasings.
- BookingDialog Cal.com modal — Hero secondary CTA links directly to the Cal.com URL in a new tab for now. Modal wraps it in PR 7.
- Sanity wiring — all PR 2 content is hardcoded. Stats, press, logos move to Sanity in PR 4.

---

## File Structure for This PR

```
docs/
└── CONVENTIONS.md                      CREATE: button-system + token-usage conventions

src/app/
├── globals.css                         MODIFY (one line removed): drop dead --color-accent token
└── (marketing)/
    └── page.tsx                        MODIFY: replace PR 1 stub with <Hero /> + <TrustBar />

src/components/
├── motion/
│   ├── FadeUp.tsx                      CREATE: client wrapper — fades child up on intersection
│   ├── LineReveal.tsx                  CREATE: client wrapper — single-sweep reveal on mount
│   └── StatCounter.tsx                 CREATE: client wrapper — counts a number up once on intersection
└── sections/
    ├── Hero.tsx                        CREATE: server component, full Layout B
    └── TrustBar.tsx                    CREATE: server component, single horizontal strip
```

---

## Task 1 — Tech debt cleanup: drop dead `--color-accent`, add CONVENTIONS.md

**Files:**
- Modify: `src/app/globals.css` (remove one line — the dead `--color-accent: #2563EB;` declaration inside the Sentinel `@theme` block)
- Create: `docs/CONVENTIONS.md`

- [ ] **Step 1: Read current globals.css to confirm the line location**

```bash
grep -n "^\s*--color-accent:" src/app/globals.css
```

Expected: ONE line in the Sentinel `@theme` block (around line 29) with value `#2563EB;`. There may also be `--color-accent-light` and `--color-accent-dark` — leave those alone. There may also be a `--color-accent: var(--accent);` inside the SHADCN BRIDGE `@theme inline` block (around line 111) — leave that alone too; that's the bridge mapping which is desired.

The match you want to delete is the one inside the Sentinel `@theme { ... }` block (the top one).

- [ ] **Step 2: Delete the dead line**

Use the Edit tool to remove the exact line `  --color-accent: #2563EB;` from inside the Sentinel `@theme {}` block. Surrounding `--color-accent-light` and `--color-accent-dark` declarations stay. The Sentinel @theme block defines `--color-accent-light: #60A5FA;` and `--color-accent-dark: #1D4ED8;` immediately after the removed line — both must remain.

- [ ] **Step 3: Verify nothing depends on the deleted token**

```bash
grep -nE "var\(--color-accent\)" src/app/globals.css || echo "OK: no consumers"
grep -rnE "var\(--color-accent\)" src/components src/app || echo "OK: no consumers in src"
grep -rE "text-accent[^-]|bg-accent[^-]|border-accent[^-]|ring-accent[^-]" src/components src/app | head -10
```

The first two should print `OK: no consumers`. The third may show shadcn primitives using `bg-accent` / `text-accent` (which resolve via the bridge `@theme inline` block — they still work because the bridge declares its own `--color-accent: var(--accent)`).

- [ ] **Step 4: Create the conventions doc**

Write the file `docs/CONVENTIONS.md` with this exact content:

```markdown
# Sentinel Institute — Code Conventions

These conventions resolve ambiguities flagged in the PR 1 final code review. They apply to PR 2 onwards.

## Button systems — when to use which

The codebase has **two** button systems and they serve different purposes:

| Use case | Choose | Why |
|---|---|---|
| Marketing CTAs (Header, Hero, ProposalCTA, sub-page CTAs) | Sentinel utility class — `<a className="btn-primary">…</a>` or `<button className="btn-secondary">…</button>` | The brand button. Bigger touch target, hand-tuned padding, shadow-on-hover, intentional whitespace. Optimized for "press me, I'm the conversion" moments. |
| In-component UI (form submits, dialog confirms, dropdown items, toolbar) | shadcn primitive — `<Button variant="default">…</Button>` from `@/components/ui/button` | The functional button. Compact, multiple variants (`outline`, `ghost`, `secondary`, `destructive`, `link`), keyboard focus rings auto-wired, sizing tokens (`xs`, `sm`, `lg`, `icon`). |

**Rule of thumb:** if it sits inside a `<form>`, `<Dialog>`, `<DropdownMenu>`, `<NavigationMenu>`, or any other shadcn primitive, use the shadcn `<Button>`. Otherwise use the `.btn-primary` / `.btn-secondary` utility classes.

**Don't:** wrap `<Button>` with `.btn-primary`. Don't pass `variant="ghost"` to make a shadcn button look like a marketing CTA — use the utility class instead.

## Token references — raw `var()` vs semantic shadcn class

Tailwind v4 supports both. Pick consistently:

| Token name lives in… | How to reference it in JSX |
|---|---|
| Sentinel `@theme {}` (e.g., `--color-text-primary`, `--color-accent-light`, `--color-text-muted`, `--color-surface-elevated`, `--color-border-hover`, `--font-display`) | Raw arbitrary value: `className="text-[var(--color-text-primary)]"` |
| Sentinel `@theme {}` **and** also bridged in shadcn `@theme inline {}` (e.g., `--color-foreground`, `--color-background`, `--color-card`, `--color-border`, `--color-primary`, `--color-ring`, `--color-muted`, `--color-muted-foreground`) | Semantic class: `className="text-foreground bg-background border-border"` |

**Rule of thumb:** if shadcn primitives use it (semantic name like `text-foreground`), use the semantic class. If only Sentinel uses it (named token like `--color-text-primary`, `--color-accent-light`), use raw `var()`. Both resolve to the same hex; the choice is about *readability for the next contributor*. A semantic class signals "this surface participates in the design system's shared semantics"; a raw var signals "this is a Sentinel-specific token, look it up in `globals.css`."

**Examples from PR 1:**
- `Header.tsx` uses `text-[var(--color-text-primary)]` for the logo — correct, because no shadcn-semantic equivalent is more appropriate.
- `(marketing)/page.tsx` PR 1 stub uses `text-[var(--color-text-primary)]` and `text-[var(--color-text-secondary)]` — both Sentinel-specific tokens, no bridge equivalent, raw `var()` is the right call.
- shadcn `<Button>` internally uses `bg-primary text-primary-foreground` — those resolve via the bridge.

**When in doubt:** check whether `grep "--color-X:" src/app/globals.css` finds the token in the `@theme inline` block. If yes, you can use the semantic class. If no, use raw `var()`.

## File responsibility

Per the design spec:
- One section = one file in `src/components/sections/`.
- Server components by default. `"use client"` only when a hook (`useState`, `useEffect`, `useRef`) or browser API is actually needed.
- A section component should not exceed ~200 lines. If it does, extract sub-components into a colocated folder (e.g., `sections/Hero/Hero.tsx` + `sections/Hero/StatPillar.tsx`).

## Motion

Per the locked motion philosophy:
- Sections fade up on scroll. Use `<FadeUp>` (PR 2).
- Display headlines line-reveal once on first view. Use `<LineReveal>` (PR 2).
- Stat numbers count up once. Use `<StatCounter>` (PR 2).
- GSAP timeline used **only** in §5 Sentinel Certification System™ (PR 3).
- `prefers-reduced-motion: reduce` disables everything — already wired in `globals.css`.
```

- [ ] **Step 5: Verify build still passes**

```bash
pnpm build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` (the dropped Sentinel token had no consumers, so the build is unaffected).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css docs/CONVENTIONS.md
git commit -m "chore(design-system): drop dead --color-accent; document button + token conventions"
```

---

## Task 2 — Create FadeUp motion wrapper

`FadeUp` is a client component that wraps any child and fades it up (24px translateY → 0, opacity 0 → 1) when it intersects the viewport. Reuses the `fadeUp` keyframe already defined in `globals.css`.

**Files:**
- Create: `src/components/motion/FadeUp.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/components/motion
```

Create `src/components/motion/FadeUp.tsx` with this content:

```tsx
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface FadeUpProps {
  children: ReactNode
  /** Optional delay before the animation starts, in seconds. Default 0. */
  delay?: number
  /** Optional duration override, in seconds. Default 0.7 (matches Sentinel keyframe). */
  duration?: number
  /** Optional class to apply to the wrapper. */
  className?: string
  /** If true, animate immediately on mount instead of waiting for intersection. Default false. */
  immediate?: boolean
}

/**
 * Fades its children up from 24px below their final position when they
 * enter the viewport. Uses the `fadeUp` keyframe defined in globals.css.
 * Runs once per mount — does not re-animate on subsequent intersections.
 *
 * Respects `prefers-reduced-motion: reduce` via the global media query
 * in `globals.css` which disables all animations.
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  className,
  immediate = false,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(immediate)

  useEffect(() => {
    if (immediate || hasAnimated) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasAnimated(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate, hasAnimated])

  return (
    <div
      ref={ref}
      className={className}
      style={
        hasAnimated
          ? {
              animation: `fadeUp ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
              opacity: 0,
            }
          : { opacity: 0, transform: "translateY(24px)" }
      }
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`. (Component isn't rendered anywhere yet — this just verifies it type-checks.)

- [ ] **Step 3: Commit**

```bash
git add src/components/motion/FadeUp.tsx
git commit -m "feat(motion): add FadeUp client wrapper — IntersectionObserver triggers fadeUp keyframe"
```

---

## Task 3 — Create LineReveal motion wrapper

`LineReveal` is a client component that reveals its child text via a single horizontal sweep — used on the hero display headline. A colored bar starts covering the text fully and slides to the right, revealing the text behind it.

**Files:**
- Create: `src/components/motion/LineReveal.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/motion/LineReveal.tsx`:

```tsx
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface LineRevealProps {
  children: ReactNode
  /** Delay before the sweep starts, in seconds. Default 0.2. */
  delay?: number
  /** Sweep duration, in seconds. Default 0.85. */
  duration?: number
  /** Class on the wrapper. */
  className?: string
}

/**
 * Renders its child text behind a covering bar that slides away to the right,
 * revealing the text in a single sweep. Used for hero display headlines.
 * Uses the `lineReveal` keyframe defined in globals.css.
 *
 * Triggers once when the element enters the viewport. Respects
 * prefers-reduced-motion via the global media query in globals.css.
 */
export function LineReveal({
  children,
  delay = 0.2,
  duration = 0.85,
  className,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || triggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTriggered(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [triggered])

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--color-surface)",
          transformOrigin: "left center",
          transform: triggered ? "scaleX(0)" : "scaleX(1)",
          transition: triggered
            ? `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
            : "none",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
```

Notes:
- The `lineReveal` keyframe in `globals.css` is a CSS keyframe — but this component uses a direct transition for finer JS control over the trigger. Both approaches are valid; the inline transition allows the child to mount as static text immediately (correct text in DOM, just visually masked) and the sweep reveals it.
- The covering bar uses `var(--color-surface)` which is Sentinel navy — exactly matching the hero background, so the sweep is invisible except as it reveals the text.

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/motion/LineReveal.tsx
git commit -m "feat(motion): add LineReveal client wrapper — single-sweep reveal for display text"
```

---

## Task 4 — Create StatCounter motion wrapper

`StatCounter` counts a number from 0 (or a configured start) up to a target value once when it intersects the viewport. Used by the hero stat pillar.

**Files:**
- Create: `src/components/motion/StatCounter.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/motion/StatCounter.tsx`:

```tsx
"use client"

import { useEffect, useRef, useState } from "react"

interface StatCounterProps {
  /** The value to count up to. */
  target: number
  /** Optional suffix to render after the number (e.g., "%"). */
  suffix?: string
  /** Animation duration in seconds. Default 1.4. */
  duration?: number
  /** Optional class on the wrapper. */
  className?: string
}

const cubicEaseOut = (t: number): number => 1 - Math.pow(1 - t, 3)

/**
 * Counts up to `target` once when this element enters the viewport.
 * The DOM contains the final number from first render (SEO-friendly,
 * SSR-correct) — the visual count-up replaces it via React state once
 * client-side hydration completes and the element intersects.
 *
 * Respects prefers-reduced-motion by skipping animation and rendering
 * the final value immediately.
 */
export function StatCounter({
  target,
  suffix = "",
  duration = 1.4,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(target)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || hasAnimatedRef.current) return

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      hasAnimatedRef.current = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasAnimatedRef.current) continue
          hasAnimatedRef.current = true
          observer.disconnect()

          const startTime = performance.now()
          const startValue = 0
          const delta = target - startValue

          const tick = (now: number) => {
            const elapsed = (now - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            const eased = cubicEaseOut(progress)
            setDisplayValue(Math.round(startValue + delta * eased))
            if (progress < 1) requestAnimationFrame(tick)
          }

          setDisplayValue(0)
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={className} aria-label={`${target}${suffix}`}>
      {displayValue}
      {suffix}
    </span>
  )
}
```

Key design choices, explained:
- **SSR-correct**: initial state is the final value, so the server renders the correct number. On hydration, the IntersectionObserver decides whether to animate. If JS fails or is disabled, the number is right.
- **`aria-label` exposes the final value to screen readers** so the count-up is purely visual — screen readers announce `"96%"` not the running count.
- **`prefers-reduced-motion: reduce`** check skips animation entirely and leaves the final value.
- **`hasAnimatedRef`** prevents re-animation if the element scrolls out and back in.

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/motion/StatCounter.tsx
git commit -m "feat(motion): add StatCounter — counts up once on view, SSR-correct, a11y-safe"
```

---

## Task 5 — Build the Hero section

`Hero` is the homepage's first section. Server component. Layout B (Editorial + Stat Pillar). Two-column grid on desktop, stacked on mobile. Left column has eyebrow + headline + sub + CTAs + press band. Right column has the stat pillar.

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Create the file**

```bash
mkdir -p src/components/sections
```

Create `src/components/sections/Hero.tsx`:

```tsx
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { LineReveal } from "@/components/motion/LineReveal"
import { StatCounter } from "@/components/motion/StatCounter"

const HERO_STATS = [
  { value: 96, suffix: "%", label: "First-Attempt Pass Rate" },
  { value: 410, suffix: "", label: "Professionals Certified" },
  { value: 63, suffix: "", label: "Enterprise Clients" },
  { value: 38, suffix: "", label: "Compliance Audits Passed" },
] as const

const PRESS_OUTLETS = ["SC Magazine", "Dark Reading", "CyberScoop"] as const

export function Hero() {
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

            <FadeUp delay={0.85}>
              <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.15em]">
                <span className="text-[var(--color-text-muted)] opacity-70">As featured in</span>
                {PRESS_OUTLETS.map((outlet) => (
                  <span key={outlet} className="text-[var(--color-text-secondary)]">
                    {outlet}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right column — stat pillar */}
          <FadeUp delay={0.3} className="md:pt-2">
            <ul aria-label="Sentinel Institute outcomes">
              {HERO_STATS.map((stat, i) => (
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

Notes on the JSX:
- Section uses `aria-labelledby="hero-headline"` for landmark labeling. The h1 inside has the matching `id`.
- Display headline uses inline `style={{ fontSize: clamp(...) }}` because the Sentinel display scale is fluid clamp — Tailwind v4 supports this via arbitrary values too (`text-[clamp(2.5rem,5.5vw,4.25rem)]`) but inline is more readable for fluid sizes.
- Headline goes inside `<h1>` AND inside `<LineReveal>` so the screen reader sees the heading semantics and the sweep is purely visual.
- Stat pillar's first row has no top border (`i === 0`), subsequent rows get hairline borders — matches the brainstorm mockup.
- Press band lives at the bottom of the left column with a top border and reduced opacity for the "As featured in" label.
- Discovery call button opens Cal.com in a new tab with `rel="noopener noreferrer"` — the BookingDialog modal version comes in PR 7.

- [ ] **Step 2: Verify it imports cleanly**

```bash
pnpm build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`. (Not rendered anywhere yet.)

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat(sections): add Hero — Layout B with stat pillar, line-reveal headline, CTAs, press band"
```

---

## Task 6 — Build the TrustBar section

`TrustBar` is a single horizontal strip immediately under the hero. Server component. Per the brainstorm: CompTIA badge (text fallback for PR 2), client logos (8 anonymized industry phrasings in `industry-text` mode), and a caption line.

**Files:**
- Create: `src/components/sections/TrustBar.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/sections/TrustBar.tsx`:

```tsx
import { FadeUp } from "@/components/motion/FadeUp"

const CLIENT_INDUSTRIES = [
  "Regional Bank, Midwest",
  "Health System, Northeast",
  "Defense Contractor, Mid-Atlantic",
  "Insurance Carrier, Southeast",
  "Utility, Pacific Northwest",
  "Law Firm, AmLaw 200",
  "Pharmaceutical, Top 25",
  "Financial Services, Big Four",
] as const

export function TrustBar() {
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
            <ul
              aria-label="Clients"
              className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
            >
              {CLIENT_INDUSTRIES.map((industry) => (
                <li
                  key={industry}
                  className="transition-colors hover:text-[var(--color-text-secondary)]"
                >
                  {industry}
                </li>
              ))}
            </ul>

            {/* Right-side caption */}
            <p className="md:max-w-[26ch] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] md:text-right shrink-0">
              63 enterprise clients certified across 11 regulated industries
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
```

Notes:
- Section background uses `--color-surface-alt` (slightly lighter navy) so it visually separates from the Hero's `--color-surface`.
- CompTIA badge is text-only with `role="img"` + `aria-label` so screen readers announce "CompTIA Authorized Partner" without verbalizing the two-line typography.
- Client industries are anonymized phrasings using the `industry-text` display mode per the Sanity `clientLogo` schema spec. When real client logos are licensed in PR 4, swap to image-mode rendering.
- The 8 phrasings cover all 8 industries listed in WEBSITE_CONTEXT.md §3 (Financial Services, Healthcare, Government, Insurance, Utilities, Legal, Pharmaceuticals, Financial Services again with Big Four sizing).

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TrustBar.tsx
git commit -m "feat(sections): add TrustBar — CompTIA badge text, 8 client industries, certified-clients caption"
```

---

## Task 7 — Replace the (marketing)/page.tsx stub with Hero + TrustBar

The current PR 1 stub at `src/app/(marketing)/page.tsx` says "homepage shell is live". Replace its body with the two new sections in order.

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Replace file contents**

Open `src/app/(marketing)/page.tsx` and replace its body with:

```tsx
// src/app/(marketing)/page.tsx
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"

export const metadata: Metadata = {
  title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
    </>
  )
}
```

Notes:
- Metadata is unchanged from PR 1 (same description, same title).
- The previous PR 1 placeholder JSX is gone — replaced with `<Hero />` + `<TrustBar />`.

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -15
```

Expected: clean compile, route table still shows `/`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/page.tsx"
git commit -m "feat(homepage): compose Hero + TrustBar into the homepage"
```

---

## Task 8 — Verify final pnpm build clean (gate)

**Files:** none modified.

- [ ] **Step 1: Run full production build**

```bash
pnpm build
```

Expected:
- `✓ Compiled successfully`
- TypeScript pass
- Routes table includes `┌ ○ /`, `○ /robots.txt`, `○ /sitemap.xml`, `○ /_not-found`
- No new pages should appear (PR 2 doesn't add routes — just replaces homepage content)

If build fails, stop and report the exact error.

- [ ] **Step 2: No commit (gate task)**

---

## Task 9 — Verify final pnpm lint clean (gate)

- [ ] **Step 1: Run ESLint**

```bash
pnpm lint
```

Expected: zero output (clean).

If lint reports warnings or errors, fix inline and commit:

```bash
git status
git add -A
git commit -m "chore: lint fixes from PR 2 final pass"
```

If no lint fixes needed, skip the commit.

---

## Task 10 — Manual responsive QA + tag pr-2-hero-trust

**Files:** none modified — final manual check.

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Wait for `✓ Ready in …`.

- [ ] **Step 2: Manually verify at four viewport widths**

Open `http://localhost:3000` and use DevTools device-toolbar to switch widths.

For each of `375px`, `768px`, `1280px`, `1920px`, confirm:

**Hero**
- Eyebrow "Enterprise Cybersecurity Certification" in IBM Plex Mono, accent-light color
- Display headline "Close the Certification Gap Before the Auditors Do." in IBM Plex Serif Medium, wraps at ~22 characters
- Line-reveal animation plays once on first view (covering bar sweeps left → right)
- Sub-headline is body Plex Sans, text-secondary, max ~44 chars wide
- Primary CTA `Request a Training Proposal →` is a blue button linking to `/contact`
- Secondary CTA `Book a 20-Minute Discovery Call` is an outlined button linking to the Cal.com URL in a new tab
- Press band shows "As featured in" + SC Magazine · Dark Reading · CyberScoop, all in Plex Mono
- Stat pillar (right column on ≥768px, stacked below on <768px) shows 4 stats with hairline separators
- Stat numbers count from 0 up to 96 / 410 / 63 / 38 once when the pillar enters view
- Stat labels in Plex Mono, accent-light, uppercase letter-spaced

**TrustBar**
- Background is a slightly different navy from the Hero (surface-alt)
- CompTIA Authorized Partner badge on the left, text-only fallback
- 8 client industries in the middle, Plex Mono, text-muted color
- "63 enterprise clients certified across 11 regulated industries" caption on the right (≥768px) or below (<768px)
- Hovering an industry brightens its color slightly

**Layout health**
- No horizontal scroll at any width
- Sticky Header remains at the top during scroll
- Footer at the bottom of the page renders below the Trust Bar
- No console errors in DevTools

If anything fails, stop and report what.

- [ ] **Step 3: Verify Lighthouse perf does not regress from PR 1 baseline**

In Chrome DevTools → Lighthouse → run Performance + Accessibility audit on `http://localhost:3000`. Record the scores in the PR description. Targets (page-specific contract from spec §9):
- Performance ≥ 90
- Accessibility ≥ 95 (true 100 requires real CompTIA + client logos which arrive in PR 4)

PR 2 adds ~5 KB of motion component JS (FadeUp/LineReveal/StatCounter). Should not move LCP because hero text is server-rendered immediately; motion only refines the reveal.

- [ ] **Step 4: Tag PR completion**

```bash
git tag pr-2-hero-trust
git log --oneline pr-1-foundations..HEAD
```

Expected: ~8 commits (Task 1 cleanup + Tasks 2/3/4 motion + Tasks 5/6 sections + Task 7 compose + maybe a Task 9 lint fix).

---

## Self-Review (writing-plans skill, applied here)

**Spec coverage — every PR 2 deliverable in spec §11.1 is covered:**
- `Hero.tsx` — Task 5
- `TrustBar.tsx` — Task 6
- `StatCounter`, `LineReveal`, `FadeUp` motion wrappers — Tasks 2, 3, 4
- First Vercel preview deploy — deferred to user (no remote / Vercel setup yet in this project; will pick this up when the project gets a remote in a later PR). Flagged as deferred.

**Spec coverage — Hero design from §5 §1:**
- Two-column grid 1.4fr/1fr on desktop, stacked mobile ✓ Task 5
- Eyebrow "Enterprise Cybersecurity Certification" Plex Mono accent-light ✓
- Display headline (max 22ch, Plex Serif Medium, line-reveal) ✓
- Sub-headline (Plex Sans, max 44ch) ✓
- Primary CTA → `/contact`, secondary → Cal.com new tab (modal in PR 7) ✓
- Press band beneath CTAs ✓
- Stat pillar with 4 stats + StatCounter ✓
- Light parallax — DEFERRED to PR 8 (explicitly flagged in plan header)
- No grain in hero ✓ (not added)

**Spec coverage — TrustBar §5 §2:**
- Single horizontal strip ✓
- CompTIA Authorized Partner badge → text fallback (image deferred until brand asset delivered)
- 8 client logos (anonymized industry-text mode) ✓
- Right-side caption ✓

**Placeholder scan:** Searched the plan for "TBD", "TODO", "implement later", "fill in details", "similar to Task N", "handle edge cases", "add validation", and untested test references — zero matches. Every step contains either exact code or exact commands with expected output.

**Type consistency:** `FadeUp`, `LineReveal`, `StatCounter` named exports are consumed by `Hero.tsx` with matching props (`delay?`, `duration?`, `target`, `suffix?`, `className?`). `Hero`, `TrustBar` exports consumed by `(marketing)/page.tsx`. All imports use the `@/components/motion/*` and `@/components/sections/*` paths defined when the components are created.

**Scope check:** PR 2 produces a deployable change — the homepage's top two sections render with motion. Build is green, lint is green, no new routes. Plan ends cleanly at "git tag pr-2-hero-trust" with about 8 commits.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-13-sentinel-homepage-pr2-hero-trust.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration on a clean context per step.

**2. Inline Execution** — Execute tasks in this session using the executing-plans skill. Batch through with checkpoints at major milestones.

Which approach?
