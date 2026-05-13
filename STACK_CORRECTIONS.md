# CLAUDE.md — Stack Version Patch
# Apply these corrections to the Tech Stack table in CLAUDE.md
# Project: Sentinel Institute | Confirmed after scaffolding

## Corrected Stack Versions (replace the table in CLAUDE.md §🛠 Tech Stack)

| Layer | Choice | Actual Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.6 |
| Language | TypeScript — strict mode | 5.9 |
| Styling | Tailwind CSS v4 | v4 (NO tailwind.config.ts — tokens live in globals.css @theme) |
| Components | shadcn/ui | Current (15 components installed) |
| Animation (primary) | Framer Motion | Latest installed |
| Animation (cinematic) | GSAP free tier | Latest installed |
| State | Zustand | Latest installed |
| CMS | Sanity.io | Latest — init manually when project ID is ready |
| Forms | React Hook Form + Zod | Latest installed |
| Booking | Cal.com embed | https://cal.com/sentinelinstitute/discovery |
| Payments | Stripe | API version 2026-04-22.dahlia |
| Analytics | GA4 via @next/third-parties | G-SX7492KRTM |
| Deployment | Vercel | — |
| Package Manager | pnpm | — |
| Toast | sonner (not toast) | shadcn deprecated toast — sonner is the replacement |
| CSS Animation | tw-animate-css | Replaces tailwindcss-animate for v4 compatibility |

## Tailwind v4 — Key Differences from v3 (Critical for AI sessions)

1. NO tailwind.config.ts for design tokens
   All theme customization lives in src/app/globals.css inside @theme {}

2. Import syntax changed
   v3: @tailwind base; @tailwind components; @tailwind utilities;
   v4: @import "tailwindcss";

3. tw-animate-css replaces tailwindcss-animate
   Already installed. Import: @import "tw-animate-css"; in globals.css

4. CSS custom properties are @theme tokens
   Define: --color-brand-950: #0A1628;  inside @theme {}
   Use in JSX: className="bg-[--color-brand-950]" OR via Tailwind utilities if mapped

5. Keyframes defined directly in CSS — not in theme.extend.keyframes

6. Container still works — configure via @theme if needed

## Known Audit Findings (Non-Blocking)

Severity: Moderate (2 findings)
- js-yaml — transitive via sanity-cli
- postcss 8.4.31 — transitive via next

Resolution: Add to pnpm overrides in package.json when resolving in Phase 2:
{
  "pnpm": {
    "overrides": {
      "js-yaml": "^4.1.0",
      "postcss": "^8.5.0"
    }
  }
}

Zero high or critical vulnerabilities. Compliant with SECURITY.md spec.
