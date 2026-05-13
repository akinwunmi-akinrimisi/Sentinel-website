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
