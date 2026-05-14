# Sentinel Homepage — PR 3: Sentinel Certification System™ Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build §5 of the homepage — the Sentinel Certification System™ — as a Vertical Detailed Timeline. Three phase steps + one result block, connected by a vertical line on the left. Single GSAP timeline animates the reveal on first intersection.

**Architecture:** `SentinelSystem.tsx` is the server component that holds the section markup (eyebrow, headline, lead, plus the 4 timeline children with all their hardcoded copy). `SystemTimeline.tsx` is a client component that wraps the children, renders the connector line element, and on first viewport intersection plays a single `gsap.timeline()` that: (1) draws the line top→bottom, (2) pops each phase dot then fades that phase's content, (3) pops the result dot with a glow pulse. SSR renders everything in the final state — crawlers / no-JS / pre-hydration all see real content. GSAP only enhances after hydration; reduced-motion users skip the animation entirely.

**Tech Stack:** Next.js 16 (App Router, server-first) · Tailwind v4 · IBM Plex · `gsap` 3.x free tier (already installed in package.json from PR 1 scaffold) · NO GSAP paid plugins (forbidden per `CLAUDE.md`). The `gsap` package is dynamic-imported inside SystemTimeline's `useEffect` so it doesn't ship in the initial bundle when reduced-motion is set or when the user never reaches §5.

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` — §5 §5 (the Sentinel Certification System™ section) + §11.1 PR 3.

**Out of scope for PR 3 (deferred to later PRs):**
- The `.grain-overlay` texture on the section background — the class exists in `globals.css` from PR 1 and we apply it here, but tuning the opacity for final visual feel is part of PR 8's polish pass.
- Any color/typography refinement specific to this section — the design system locked in PR 1/PR 2 is the source of truth.

---

## File Structure for This PR

```
src/components/sections/
├── SentinelSystem.tsx           CREATE: server — section with eyebrow + headline + lead + SystemTimeline children
└── SystemTimeline.tsx           CREATE: client — wraps children, draws connector line, runs single GSAP timeline

src/app/
└── (marketing)/page.tsx         MODIFY: add <SentinelSystem /> after <TrustBar />
```

---

## Task 1 — Build SystemTimeline (client component, GSAP-driven)

`SystemTimeline` is a thin client component that accepts children (the timeline content rendered by the parent server component) and:
- Renders the vertical connector line as its own element
- On first viewport intersection (or immediately if already in viewport), runs ONE GSAP timeline that:
  - Draws the connector line top→bottom (scaleY 0→1)
  - For each phase step: pops the dot in (scale + opacity), then fades the step content up
  - Pops the result dot with a glow effect, then fades the result content up
- Respects `prefers-reduced-motion: reduce` by skipping all animation (content already SSR-visible at final state)

**Files:**
- Create: `src/components/sections/SystemTimeline.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface SystemTimelineProps {
  children: ReactNode
  /** Class applied to the wrapping div. */
  className?: string
}

/**
 * Wraps the Sentinel Certification System™ timeline content. Children are
 * rendered server-side in their final state, so crawlers / no-JS / Lighthouse
 * audits all see real content. On the client, after first viewport intersection,
 * a single GSAP timeline plays the reveal sequence.
 *
 * Children are expected to include elements with these data attributes:
 *   data-system-line             — the vertical connector line (one)
 *   data-system-dot              — phase dot markers (one per phase step)
 *   data-system-step-content     — phase step content blocks (one per phase)
 *   data-system-result-dot       — the result block's dot (one)
 *   data-system-result-content   — the result block's content (one)
 *
 * SystemTimeline does not render the line itself — the parent SentinelSystem
 * component composes the line element inline so its visual position is part of
 * the static markup and SSR rendering captures it correctly.
 *
 * Respects prefers-reduced-motion: reduce — no animation, content stays as
 * SSR rendered it.
 */
export function SystemTimeline({ children, className }: SystemTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    // Lazy-load GSAP only when this effect runs, so the bundle stays out of
    // initial JS when the user never reaches this section.
    import("gsap").then((mod) => {
      if (cancelled) return
      const gsap = mod.default

      const line = container.querySelector<HTMLElement>("[data-system-line]")
      const dots = Array.from(
        container.querySelectorAll<HTMLElement>("[data-system-dot]")
      )
      const stepContents = Array.from(
        container.querySelectorAll<HTMLElement>("[data-system-step-content]")
      )
      const resultDot = container.querySelector<HTMLElement>(
        "[data-system-result-dot]"
      )
      const resultContent = container.querySelector<HTMLElement>(
        "[data-system-result-content]"
      )

      // Snap to initial animation state (overrides SSR final-state styles).
      if (line) gsap.set(line, { scaleY: 0, transformOrigin: "top center" })
      dots.forEach((d) => gsap.set(d, { scale: 0, opacity: 0 }))
      stepContents.forEach((c) => gsap.set(c, { opacity: 0, y: 24 }))
      if (resultDot) gsap.set(resultDot, { scale: 0, opacity: 0 })
      if (resultContent) gsap.set(resultContent, { opacity: 0, y: 24 })

      const playTimeline = () => {
        const tl = gsap.timeline()

        if (line) {
          tl.to(line, { scaleY: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        }

        dots.forEach((dot, i) => {
          const at = 0.2 + i * 0.35
          tl.to(
            dot,
            { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" },
            at
          )
          const content = stepContents[i]
          if (content) {
            tl.to(
              content,
              { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
              at + 0.05
            )
          }
        })

        if (resultDot) {
          tl.to(
            resultDot,
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" },
            "+=0.1"
          )
        }
        if (resultContent) {
          tl.to(
            resultContent,
            { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
            "<+=0.05"
          )
        }
      }

      // Viewport check on mount — fire immediately if visible, else observe.
      const rect = container.getBoundingClientRect()
      const inViewport =
        rect.top < window.innerHeight && rect.bottom > 0
      if (inViewport) {
        playTimeline()
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              playTimeline()
              observer.disconnect()
            }
          }
        },
        { threshold: 0.15 }
      )

      observer.observe(container)
      cleanup = () => observer.disconnect()
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
```

Notes on the design:

- **The connector line lives in the children, not in this component.** SystemTimeline only animates it. The line element is composed in SentinelSystem with the exact positioning the design requires (top of phase 1 dot center → result dot center, etc.). This keeps SSR markup self-contained — no JS needed to see the line in its final state.
- **GSAP is dynamic-imported inside `useEffect`** — `import("gsap")`. This keeps GSAP out of the initial JS bundle. Users with reduced-motion or who never scroll to §5 never download it.
- **`gsap.set()` calls snap elements to initial animation state immediately on hydration.** During the brief hydration moment when JS runs but the timeline hasn't yet played, the content jumps from "SSR final state" to "animation start state" then immediately starts the timeline. This jump is one paint frame and typically invisible. The alternative — never running `gsap.set()` and tweening from the SSR styles — would require GSAP to compute current styles, which is slower and inconsistent.
- **`cancelled` flag in the closure handles unmount during dynamic import.** Without it, an unmounted component could still receive the GSAP module and run the timeline after unmount.
- **Easings:** `power2.inOut` for the line draw (smooth start and end), `back.out(2)` for dots (subtle overshoot pop), `power2.out` for content fades (settles in).
- **Timing:** total run is roughly 1.4s for line + (3 × 0.35s) stagger + ~0.6s tail = ~3.0s. Slow and deliberate per the locked motion philosophy.
- **No `cleanup` for the timeline tween itself** — it runs once, no need to kill on unmount (the `gsap.set()` calls don't subscribe to anything that survives unmount).

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`. The dynamic import of `gsap` should be statically discoverable but lazy-evaluated.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SystemTimeline.tsx
git commit -m "feat(motion): add SystemTimeline — single GSAP timeline for §5 reveal (lazy-loaded gsap)"
```

---

## Task 2 — Build SentinelSystem (server component, all content + line markup)

`SentinelSystem` is the server-rendered section. It composes the eyebrow, headline, lead, and a `<SystemTimeline>` wrapper containing the three phase blocks, the connector line element, and the result block. All copy is hardcoded per the spec — this section's content never changes.

**Files:**
- Create: `src/components/sections/SentinelSystem.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { FadeUp } from "@/components/motion/FadeUp"
import { SystemTimeline } from "@/components/sections/SystemTimeline"

const PHASES = [
  {
    number: "01",
    name: "Precision Gap Assessment",
    body:
      "Before any training begins, every team member completes a structured diagnostic. We map individual knowledge gaps against the exact CompTIA exam objectives. No one sits through content they already know. No one skips content they need.",
    meta: [
      { label: "Duration", value: "1 week" },
      { label: "Output", value: "Individual gap report per team member" },
    ],
  },
  {
    number: "02",
    name: "Instructor-Led Certification Training",
    body:
      "Live sessions led by CISSP / CASP+ / CySA+ credentialed instructors. Content mapped 1:1 to CompTIA exam domains — no generic cybersecurity theory. Microsoft Teams or Zoom; client selects schedule.",
    meta: [
      { label: "Cadence", value: "3× per week, 2 hours" },
      { label: "Track", value: "Per certification" },
    ],
  },
  {
    number: "03",
    name: "Exam Simulation & Readiness Certification",
    body:
      "600+ practice questions in CompTIA exam format. Timed mock exams under real conditions. Weekly performance tracking shared with the CISO. No team member sits the live exam until they are consistently scoring above 85%.",
    meta: [
      { label: "Threshold", value: "85% sustained" },
      { label: "Reporting", value: "Weekly to training lead" },
    ],
  },
] as const

export function SentinelSystem() {
  return (
    <section
      aria-labelledby="system-headline"
      className="grain-overlay relative bg-[var(--color-surface)] py-24 md:py-32"
    >
      <div className="container-sentinel relative z-10">
        <FadeUp>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Our Methodology
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2
            id="system-headline"
            className="mt-4 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)] max-w-[28ch]"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            The Sentinel Certification System™
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mt-6 text-[var(--color-text-secondary)] max-w-[56ch] leading-relaxed">
            The same three-phase methodology applied to every contract — engineered to produce a
            documented pass rate, not just complete a course.
          </p>
        </FadeUp>

        <div className="mt-16">
          <SystemTimeline className="relative pl-12 md:pl-16">
            {/* Connector line — runs from top of phase 1 dot to center of result dot */}
            <div
              aria-hidden="true"
              data-system-line
              className="pointer-events-none absolute left-[11px] md:left-[15px] top-2 bottom-12 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)] to-[rgba(37,99,235,0.2)]"
            />

            {/* Phase steps */}
            {PHASES.map((phase) => (
              <div key={phase.number} className="relative mb-12 last:mb-0">
                <span
                  aria-hidden="true"
                  data-system-dot
                  className="absolute left-[-30px] md:left-[-46px] top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent)]"
                >
                  <span className="font-mono text-[0.625rem] font-medium text-[var(--color-accent-light)]">
                    {phase.number.replace(/^0/, "")}
                  </span>
                </span>

                <div data-system-step-content>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                    Phase {phase.number}
                  </p>
                  <h3 className="mt-2 font-display font-medium tracking-[-0.01em] leading-[1.15] text-[var(--color-text-primary)] text-xl md:text-2xl">
                    {phase.name}
                  </h3>
                  <p className="mt-3 text-[var(--color-text-secondary)] max-w-[60ch] leading-relaxed text-[0.9375rem]">
                    {phase.body}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.05em]">
                    {phase.meta.map((m) => (
                      <div key={m.label}>
                        <span className="text-[var(--color-text-muted)] opacity-70">{m.label}</span>{" "}
                        <span className="text-[var(--color-text-secondary)]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Result block */}
            <div className="relative">
              <span
                aria-hidden="true"
                data-system-result-dot
                className="absolute left-[-34px] md:left-[-50px] top-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-accent)] shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-[pulseGlow_3s_ease-in-out_infinite]"
              >
                <span className="block h-2 w-2 rounded-full bg-white" />
              </span>

              <div
                data-system-result-content
                className="rounded-lg border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.05)] p-6 md:p-7"
              >
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                  Result
                </p>
                <p className="mt-2 font-display font-medium tracking-[-0.015em] leading-[1.15] text-[var(--color-text-primary)] text-xl md:text-2xl">
                  96% first-attempt pass rate
                </p>
                <p className="mt-2 text-[var(--color-text-secondary)] text-[0.8125rem]">
                  Documented across all programs · 2019–2026
                </p>
              </div>
            </div>
          </SystemTimeline>
        </div>
      </div>
    </section>
  )
}
```

Notes:

- **`<SystemTimeline>` wraps the line + 3 phase divs + result div as children.** The `data-system-*` attributes give the GSAP code in SystemTimeline.tsx its hooks without coupling the two files structurally.
- **Connector line positioning:** `left-[11px]` (mobile) and `left-[15px]` (md+) places the 1px line at the visual center of the dots (which are 24px wide, so center is at x=12px, accounting for the 1px line width: starts at x=11). At md+, dots shift because of the bigger `pl-16` (64px instead of 48px) and dot offsets adjust accordingly. The gradient `from-accent ... to-rgba(...0.2)` makes the line fade slightly at its bottom for visual softness.
- **Dot positioning** uses negative left offsets (`-30px` / `-46px`) to pull the dots back into the line column from inside the padded content. The `grid place-items-center` centers the phase number inside the dot.
- **Result dot is larger (32px)** and has `animate-[pulseGlow_3s_ease-in-out_infinite]` from `globals.css`'s `pulseGlow` keyframe (per the spec design). The inner 8px white circle is the dot's "filled" appearance.
- **`grain-overlay`** is applied to the section per spec. Already styled in `globals.css` — opacity 0.035 ambient texture.
- **No `prefers-reduced-motion` handling needed in this file** — all motion is in SystemTimeline (the child client component). FadeUp wrappers around the eyebrow/headline/lead use the SSR-visible default, so they're fine.
- **`<FadeUp>` wraps the eyebrow + headline + lead** so the section reveal cascades nicely; the phase content reveals are handled by GSAP inside SystemTimeline.

- [ ] **Step 2: Verify build passes**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SentinelSystem.tsx
git commit -m "feat(sections): add SentinelSystem — vertical timeline, 3 phases + result block, GSAP-wired"
```

---

## Task 3 — Compose `<SentinelSystem />` into the homepage

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Read the current file**

Read `src/app/(marketing)/page.tsx` to confirm the current state (Hero + TrustBar from PR 2).

- [ ] **Step 2: Update the file to add SentinelSystem after TrustBar**

Replace the file contents with:

```tsx
// src/app/(marketing)/page.tsx
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { SentinelSystem } from "@/components/sections/SentinelSystem"

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
      <SentinelSystem />
    </>
  )
}
```

Only change: imported `SentinelSystem` and rendered it after `TrustBar`. The metadata is unchanged.

- [ ] **Step 3: Verify build passes**

```bash
pnpm build 2>&1 | tail -15
```

Expected: clean compile, `/` route still present, no new routes.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/page.tsx"
git commit -m "feat(homepage): add SentinelSystem after TrustBar"
```

---

## Task 4 — Final `pnpm build` clean (gate)

**Files:** none modified.

- [ ] **Step 1: Run production build**

```bash
pnpm build
```

Expected:
- `✓ Compiled successfully`
- TypeScript pass
- Routes table: `┌ ○ /`, `○ /_not-found`, `○ /robots.txt`, `○ /sitemap.xml`
- No new routes from PR 3

If anything fails, stop and report.

- [ ] **Step 2: No commit (gate)**

---

## Task 5 — Final `pnpm lint` clean (gate)

- [ ] **Step 1: Run ESLint**

```bash
pnpm lint
```

Expected: clean (no errors, no warnings).

If lint reports issues, fix inline and commit:

```bash
git add -A
git commit -m "chore: lint fixes from PR 3 final pass"
```

If clean, skip the commit.

**Known potential flag:** SystemTimeline has a `useEffect` with `cancelled` and `cleanup` variables. If the `react-hooks/exhaustive-deps` rule complains about the empty dep array `[]`, suppress with `// eslint-disable-next-line react-hooks/exhaustive-deps` and a comment explaining why (the effect should fire exactly once on mount per component instance; including any deps would cause re-runs that re-trigger the animation).

---

## Task 6 — Manual responsive QA + tag `pr-3-system-diagram`

**Files:** none modified.

- [ ] **Step 1: Start dev server (if not already running)**

```bash
pnpm dev
```

- [ ] **Step 2: Manually verify at four viewport widths**

Open `http://localhost:3000` and scroll past Hero + TrustBar to reach §5.

For each of `375px`, `768px`, `1280px`, `1920px`, confirm:

**SentinelSystem section visual**
- Eyebrow `"Our Methodology"` in Plex Mono accent-light
- H2 `"The Sentinel Certification System™"` in Plex Serif Medium
- Lead paragraph below in Plex Sans, text-secondary
- Three phase blocks stacked vertically, each with:
  - Numbered dot on the left (1 / 2 / 3) on the connector line
  - "Phase 01" / "Phase 02" / "Phase 03" eyebrow in Plex Mono accent-light
  - Phase name in Plex Serif Medium (e.g., "Precision Gap Assessment")
  - Body paragraph
  - Metadata row in Plex Mono (Duration / Output, Cadence / Track, Threshold / Reporting)
- Vertical connector line on the left, fading from solid accent at top to faded at bottom
- Result block at the bottom: filled accent dot (with pulse glow), bordered card with `"Result"` label, `"96% first-attempt pass rate"`, `"Documented across all programs · 2019–2026"`

**Motion**
- On scroll into view (first time), the connector line draws top→down (~1.4s)
- Each phase dot pops in as the line reaches it; phase content fades up slightly after
- Result dot pops with a glow + content fades up
- Total animation runs once; does NOT repeat on scroll out + back
- Background has subtle grain animation

**Reduced motion test**
- Open DevTools → Rendering tab → "Emulate CSS media feature `prefers-reduced-motion: reduce`"
- Refresh page
- Verify: SentinelSystem renders fully visible immediately (no animation), connector line fully drawn from first paint, all dots filled, all content in place

**Layout health**
- No horizontal scroll at any width
- Dot column doesn't overflow on mobile (left padding `pl-12` keeps content clear)
- Result card border doesn't clip
- No console errors

- [ ] **Step 3: Verify Lighthouse performance doesn't regress**

In Chrome DevTools → Lighthouse → Performance audit on `http://localhost:3000`.

Target: Performance ≥ 90. PR 3 adds GSAP (~70 KB minified gzipped), but it's dynamic-imported and only fetched when the user reaches §5. Initial JS bundle should stay roughly equal to PR 2 (~120 KB).

Verify in DevTools → Network → JS → confirm a `gsap-*.js` chunk only loads after scrolling near §5 (or never if reduced-motion).

- [ ] **Step 4: Tag PR completion**

```bash
git tag pr-3-system-diagram
git log --oneline pr-2-hero-trust..HEAD
```

Expected: ~3–5 commits (Tasks 1, 2, 3, plus optional Task 5 lint fix).

---

## Self-Review (writing-plans skill, applied here)

**Spec coverage — PR 3 deliverables in spec §11.1:**
- `SentinelSystem.tsx` — Task 2
- `SystemTimeline.tsx` (client, dynamic-imported, GSAP) — Task 1 (gsap is dynamic-imported via `import("gsap")` inside the effect, not via `next/dynamic`. Net effect: GSAP module is not in the initial JS bundle. The component itself ships in the chunk that contains its render — but the component file is small (no GSAP code at module load time). Documented as engineering deviation from "via next/dynamic" in the plan header.)
- All phase copy hardcoded — Task 2 ✓
- `prefers-reduced-motion` fallback — Task 1 (explicit JS check) ✓

**Spec coverage — §5 §5 design:**
- Vertical timeline with 3 phase steps + result block ✓
- Connector line draws top→down via GSAP ✓
- Dots pop sequentially as line passes ✓
- Result dot has glow pulse (via `pulseGlow` keyframe from globals.css) ✓
- Duration / Cadence / Threshold metadata rows per phase ✓
- Result block reads `96% first-attempt pass rate · Documented across all programs · 2019–2026` ✓
- `.grain-overlay` applied to section ✓
- prefers-reduced-motion: reduce → timeline disabled, final state immediate ✓

**Placeholder scan:** zero "TBD"/"TODO"/"similar to Task N"/"add appropriate"/"handle edge cases" matches.

**Type consistency:**
- `SystemTimelineProps` accepts `children` + `className?` — used by `SentinelSystem` with `className="relative pl-12 md:pl-16"` ✓
- `PHASES` data shape (`number`, `name`, `body`, `meta[]`) consumed inside the same file's JSX ✓
- `SentinelSystem` named export consumed by `(marketing)/page.tsx` ✓

**Scope check:** PR 3 produces a deployable change — §5 of the homepage renders with full content and the GSAP timeline. Build green, lint green, no new routes. About 4–5 commits.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-13-sentinel-homepage-pr3-system-diagram.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, two-stage review. Same workflow as PR 1/PR 2.

**2. Inline Execution** — Run tasks in this session via the executing-plans skill.

Which approach?
