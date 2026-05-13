# CLAUDE.md — Master Build Orchestration
# High-Ticket Luxury Website System

> This file is the single source of truth for every website built in this system.
> Read it fully before touching any code. No exceptions.

---

## 🎯 Project Identity

This system builds **high-ticket sales websites** for premium products and services.
Every site produced must:

- Feel like it was designed by a senior creative director at a luxury agency
- Read like it was written by a world-class conversion copywriter
- Perform like it was engineered by a senior Next.js developer
- Be secured like it was reviewed by a professional security auditor

There is no "good enough." Every pixel, every word, every animation is intentional.
The visitor must feel the price before they see it.

---

## 📋 First Step — Always

Before writing a single line of code, read:

```
WEBSITE_CONTEXT.md        ← Brand, offer, audience, sections, integrations
product-marketing-context.md  ← Positioning, copy angles, funnel logic
```

These two files are the brief. Everything you build must serve them.
If either file is incomplete, stop and ask the user to complete it before proceeding.

---

## 🧠 Build Philosophy

### The Standard
- **No AI slop.** No Inter font. No purple gradients. No card-grid layouts. No generic hero copy.
- **Luxury/refined or editorial/magazine** aesthetic unless WEBSITE_CONTEXT.md specifies otherwise.
- Every component must feel like it belongs on a Bottega Veneta, LVMH, or McKinsey website.
- Design is not decoration. Every visual decision serves conversion.

### The Methodology — Superpowers (Obra)
Follow the Superpowers workflow for every build:

1. `/brainstorm` — Confirm understanding of WEBSITE_CONTEXT.md. Surface ambiguities.
2. `/write-plan` — Break the build into 2–5 minute tasks with exact file paths.
3. `/execute-plan` — Execute via subagents per task, with spec compliance checks.
4. Security review before any commit (see SECURITY.md).
5. `webapp-testing` skill for browser QA before marking complete.

Never start coding without a plan. Never merge without a review.

---

## 🛠 Tech Stack — Mandatory, Non-Negotiable

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | TypeScript strict mode |
| Language | TypeScript | No `any`. Strict null checks on. |
| Styling | Tailwind CSS v3+ | Custom design tokens in `tailwind.config.ts` |
| Components | shadcn/ui | Free, MIT licensed. Install via CLI. |
| Animation (primary) | Framer Motion | Free. Use for all component/page transitions. |
| Animation (cinematic) | GSAP free tier | Only for complex scroll-based sequences. No paid plugins. |
| State | Zustand | Lightweight global state only. |
| CMS | Sanity.io | Free tier. Schema defined per project in `/sanity`. |
| Auth (if needed) | NextAuth.js v5 | Free. |
| Forms | React Hook Form + Zod | Validation always server-side confirmed. |
| Booking | Cal.com embed | Free open-source. |
| Payments | Stripe | Test mode during dev. Webhook validation mandatory. |
| Analytics | GA4 | Via `@next/third-parties`. No other tracking without consent. |
| Deployment | Vercel | Edge runtime where applicable. |
| Package Manager | pnpm | Faster, stricter. |

### Forbidden Choices
- ❌ `create-react-app` or Vite (use Next.js only)
- ❌ CSS-in-JS (styled-components, emotion) — use Tailwind
- ❌ jQuery or any non-modern library
- ❌ `any` TypeScript type
- ❌ GSAP paid plugins (ScrollTrigger Club, MorphSVG, etc.)
- ❌ Hardcoded API keys or secrets anywhere in code
- ❌ `console.log` left in production code

---

## 🧩 Installed Skills — What Each One Does

Skills activate automatically when Claude detects a matching task.
Install all of them before starting any project via the commands in `README_INSTALL.md`.

| Skill | Source | Triggers On |
|---|---|---|
| `frontend-design` | `anthropics/skills` | Any UI component or page build |
| `luxury-highticket` | `.claude/skills/` (custom) | Any luxury/sales page context |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Any UI code review or audit |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Any React/Next.js component |
| `composition-patterns` | `vercel-labs/agent-skills` | Any reusable component design |
| `security-guard` | `.claude/skills/` (custom) | Every file creation and every API route |
| `stack-config` | `.claude/skills/` (custom) | Project setup, config files, installs |
| `conversion-engine` | `.claude/skills/` (custom) | Any copy, CTA, section, or funnel element |
| `webapp-testing` | `anthropics/skills` | Pre-commit QA, flow testing |
| `superpowers` | `obra/superpowers` | Project planning and execution |
| `marketingskills` | `coreyhaines31/marketingskills` | Copy, SEO, CRO, email sequences |

---

## 📐 Code Standards

### TypeScript
```typescript
// ✅ Always
interface Props {
  title: string
  description?: string
  onSubmit: (data: FormData) => Promise<void>
}

// ❌ Never
const Component = (props: any) => {}
```

### File & Folder Naming
- Components: `PascalCase.tsx` (e.g., `HeroSection.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatPrice.ts`)
- Hooks: `use` prefix (e.g., `useScrollProgress.ts`)
- Constants: `UPPER_SNAKE_CASE`
- Folders: `kebab-case`

### Component Rules
- Every component has its own file
- Props interface defined above component, never inline
- Server Components by default; add `"use client"` only when needed
- No prop drilling beyond 2 levels — use Zustand or Context
- All images use `next/image` with explicit width/height
- All links use `next/link`

### Import Order (enforced)
```typescript
// 1. React/Next.js
import { useState } from 'react'
import Image from 'next/image'

// 2. Third-party
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

// 3. Internal — absolute paths
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'

// 4. Types
import type { Product } from '@/types'

// 5. Styles (if any)
import styles from './Component.module.css'
```

### Error Handling
- All API routes return typed error responses
- `try/catch` on every async operation
- User-facing errors are friendly, never expose internals
- Log errors server-side only

---

## 🗂 Project Structure

```
/
├── CLAUDE.md                    ← You are here
├── WEBSITE_CONTEXT.md           ← Fill per project
├── product-marketing-context.md ← Fill per project
├── SECURITY.md                  ← Read before every commit
├── .claude/
│   └── skills/                  ← Custom skills
├── src/
│   ├── app/                     ← Next.js App Router pages
│   │   ├── (marketing)/         ← Public-facing pages
│   │   ├── api/                 ← API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui components
│   │   ├── sections/            ← Page sections (Hero, Pricing, etc.)
│   │   ├── forms/               ← Form components
│   │   └── layout/              ← Header, Footer, Nav
│   ├── lib/
│   │   ├── sanity/              ← Sanity client & queries
│   │   ├── stripe/              ← Stripe helpers
│   │   ├── analytics/           ← GA4 event helpers
│   │   └── utils.ts             ← Shared utilities
│   ├── store/                   ← Zustand stores
│   ├── types/                   ← Global TypeScript types
│   ├── hooks/                   ← Custom React hooks
│   └── styles/
│       └── globals.css          ← Tailwind base + custom vars
├── sanity/
│   ├── schemas/                 ← Content schemas
│   └── sanity.config.ts
├── public/
│   ├── fonts/                   ← Self-hosted fonts only
│   └── images/
├── .env.local                   ← Never commit this
├── .env.example                 ← Commit this (no values)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔒 Security — First-Class, Not an Afterthought

Security is applied during build, not reviewed after.
Read `SECURITY.md` before every commit.
The `security-guard` skill activates automatically on every API route and auth-related component.

**Non-negotiable rules:**
- All environment variables via `.env.local`. Never hardcoded.
- Stripe webhooks validated via `stripe.webhooks.constructEvent()`
- Sanity API tokens never exposed client-side
- All form inputs validated: client (Zod) + server (API route)
- Rate limiting on all public API routes
- Security headers set in `next.config.ts`
- `Content-Security-Policy` header configured
- No `dangerouslySetInnerHTML` without explicit sanitization

---

## ⚡ Performance Targets

Every page must meet these before deployment:

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID / INP | < 200ms |
| Bundle size (initial JS) | < 150kb gzipped |

**How to hit them:**
- `next/image` for all images with lazy loading
- Self-host fonts in `/public/fonts` — no Google Fonts CDN
- Dynamic imports (`next/dynamic`) for heavy components
- Sanity images via CDN with auto-format
- No barrel imports (`import * from`)
- Edge runtime for lightweight API routes

---

## 🚀 Deployment — Vercel

### Environment Variables Required Per Project
```
# Next.js
NEXT_PUBLIC_SITE_URL=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# GA4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=

# Cal.com (if booking enabled)
NEXT_PUBLIC_CAL_LINK=
```

### Vercel Configuration
- Framework preset: Next.js
- Root directory: `/` (or as configured)
- Build command: `pnpm build`
- Output: `.next`
- Node version: 20.x
- Enable: Vercel Analytics, Speed Insights (free tier)

---

## 🎨 Design System Defaults

These are the starting defaults. Override in `WEBSITE_CONTEXT.md`.

```typescript
// tailwind.config.ts — extend with project-specific tokens
const config = {
  theme: {
    extend: {
      fontFamily: {
        // Set from WEBSITE_CONTEXT.md — no defaults
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        // Set from WEBSITE_CONTEXT.md
        brand: { /* populated per project */ },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      }
    }
  }
}
```

### Animation Philosophy
- **Framer Motion**: Page transitions, component reveals, hover states, scroll animations
- **GSAP free**: Complex timeline sequences, text reveals, parallax cinematics
- **CSS only**: Simple hover effects, loading states
- **Rule**: Animations must feel intentional and premium. Slow and deliberate > fast and frantic.
- **Performance**: `will-change` only when needed. `prefers-reduced-motion` always respected.

---

## 📊 GA4 Event Tracking — Standard Events

Wire these on every site automatically:

```typescript
// Events to track on every site
'page_view'           // Automatic via @next/third-parties
'cta_click'           // Every CTA button
'form_start'          // Form focused
'form_submit'         // Form submitted
'booking_initiated'   // Cal.com modal opened
'booking_completed'   // Cal.com confirmation
'payment_initiated'   // Stripe checkout opened
'payment_completed'   // Stripe success webhook
'scroll_depth'        // 25%, 50%, 75%, 100%
```

---

## ✅ Pre-Launch Checklist

Before any site goes live, verify:

- [ ] All WEBSITE_CONTEXT.md fields implemented
- [ ] Lighthouse score ≥ 90 on all pages
- [ ] SECURITY.md checklist completed
- [ ] All forms tested (valid + invalid inputs)
- [ ] Booking flow tested end-to-end
- [ ] Stripe test payment completed
- [ ] GA4 events verified in DebugView
- [ ] Mobile responsive (375px, 768px, 1280px, 1920px)
- [ ] All images have alt text
- [ ] No console errors or warnings
- [ ] `.env.example` updated with all required keys
- [ ] Vercel preview deployment tested
- [ ] Custom domain configured with SSL
- [ ] Sitemap and robots.txt present
- [ ] OG image set for social sharing
