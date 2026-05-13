---
name: stack-config
description: >
  Apply the correct technology stack configuration for every project in this system.
  Use this skill when: setting up a new project, installing dependencies, creating config files
  (next.config.ts, tailwind.config.ts, tsconfig.json), scaffolding the folder structure,
  configuring Sanity CMS, setting up Stripe, configuring Vercel, or installing shadcn/ui.
  Ensures every project uses identical, optimized stack configuration with no drift.
---

# Stack Configuration Skill

Every project in this system uses the same opinionated stack.
This skill ensures consistent, production-grade configuration from day one.

---

## Project Initialization

```bash
# 1. Create Next.js project
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# 2. Install core dependencies
pnpm add \
  framer-motion \
  gsap \
  zustand \
  @sanity/client \
  @sanity/image-url \
  next-sanity \
  stripe \
  @stripe/stripe-js \
  react-hook-form \
  @hookform/resolvers \
  zod \
  @upstash/ratelimit \
  @vercel/kv \
  resend \
  @next/third-parties \
  next-auth@beta \
  clsx \
  tailwind-merge \
  class-variance-authority \
  lucide-react

# 3. Install dev dependencies
pnpm add -D \
  @types/node \
  prettier \
  prettier-plugin-tailwindcss \
  eslint-config-prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser

# 4. Install shadcn/ui CLI
pnpm dlx shadcn@latest init

# 5. Install shadcn components (core set)
pnpm dlx shadcn@latest add \
  button \
  input \
  textarea \
  label \
  select \
  dialog \
  accordion \
  card \
  badge \
  separator \
  form \
  toast \
  sonner \
  sheet \
  navigation-menu \
  dropdown-menu

# 6. Initialize Sanity (in /sanity folder)
pnpm create sanity@latest -- \
  --project [PROJECT_ID_FROM_WEBSITE_CONTEXT] \
  --dataset production \
  --template clean \
  --output-path sanity

# 7. Initialize Stripe (via .env.local)
# Add keys from WEBSITE_CONTEXT.md to .env.local
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "sanity"]
}
```

---

## next.config.ts

```typescript
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.sanity.io",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com https://*.sanity.io https://www.google-analytics.com",
      "frame-src https://js.stripe.com https://cal.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')
  }
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async redirects() {
    return [
      // Add www → non-www or vice versa per project
    ]
  },
  experimental: {
    typedRoutes: true,
  },
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
}

export default nextConfig
```

---

## tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', ...fontFamily.serif],
        body: ['var(--font-body)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      colors: {
        // These tokens are populated from WEBSITE_CONTEXT.md
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
          950: 'var(--color-brand-950)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      letterSpacing: {
        'luxury': '0.15em',
        'wide-luxury': '0.25em',
      },
      lineHeight: {
        'display': '0.95',
        'tight-luxury': '1.1',
        'body-luxury': '1.75',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in-left': 'slideInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Self-hosted fonts — place font files in /public/fonts/ */
@font-face {
  font-family: 'DisplayFont'; /* Replace with actual font name from WEBSITE_CONTEXT */
  src: url('/fonts/display-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'BodyFont'; /* Replace with actual font name */
  src: url('/fonts/body-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  /* Typography */
  --font-display: 'DisplayFont', serif;
  --font-body: 'BodyFont', sans-serif;

  /* Brand colors — populate from WEBSITE_CONTEXT.md */
  --color-brand-950: #0D0D0D;
  --color-brand-900: #1A1A1A;
  --color-accent: #C9A96E;        /* Gold — replace per project */
  --color-accent-light: #E4C898;
  --color-accent-dark: #A07840;
  --color-surface: #FAFAF8;
  --color-surface-elevated: #FFFFFF;

  /* Spacing */
  --section-padding-y: clamp(5rem, 10vw, 10rem);
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-surface text-brand-950 font-body;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  /* Grain overlay — apply to sections needing texture */
  .grain-overlay {
    position: relative;
    overflow: hidden;
  }

  .grain-overlay::before {
    content: '';
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.035;
    pointer-events: none;
    z-index: 1;
    animation: grain 8s steps(10) infinite;
  }

  /* Luxury section wrapper */
  .section-luxury {
    padding-block: var(--section-padding-y);
  }

  /* Display text utility */
  .text-display {
    font-family: var(--font-display);
    line-height: var(--line-height-display, 0.95);
    letter-spacing: -0.02em;
  }

  /* Luxury label (all-caps eyebrow text) */
  .label-luxury {
    @apply text-xs font-body font-medium uppercase;
    letter-spacing: var(--spacing-luxury, 0.2em);
    color: var(--color-accent);
  }
}
```

---

## Sanity Configuration

```typescript
// sanity/sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

export default defineConfig({
  name: 'default',
  title: process.env.NEXT_PUBLIC_SITE_TITLE ?? 'Website CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [
      // Schemas imported from sanity/schemas/
    ],
  },
})

// lib/sanity/client.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source)
```

---

## Zustand Store Pattern

```typescript
// store/ui.ts — Global UI state
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  isBookingOpen: boolean
  isMenuOpen: boolean
  openBooking: () => void
  closeBooking: () => void
  toggleMenu: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isBookingOpen: false,
      isMenuOpen: false,
      openBooking: () => set({ isBookingOpen: true }),
      closeBooking: () => set({ isBookingOpen: false }),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    }),
    { name: 'ui-store' }
  )
)
```

---

## GA4 Analytics Setup

```typescript
// lib/analytics/events.ts
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

type GTagEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}

export function trackEvent({ action, category, label, value, ...rest }: GTagEvent) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  })
}

// Standard events — use these everywhere
export const analytics = {
  ctaClick: (label: string) => trackEvent({ action: 'cta_click', label }),
  bookingInitiated: () => trackEvent({ action: 'booking_initiated' }),
  bookingCompleted: () => trackEvent({ action: 'booking_completed' }),
  formStart: (formName: string) => trackEvent({ action: 'form_start', label: formName }),
  formSubmit: (formName: string) => trackEvent({ action: 'form_submit', label: formName }),
  paymentInitiated: (value: number) => trackEvent({ action: 'payment_initiated', value }),
  scrollDepth: (depth: number) => trackEvent({ action: 'scroll_depth', label: `${depth}%` }),
}

// app/layout.tsx — add GA4
import { GoogleAnalytics } from '@next/third-parties/google'

// <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!} />
```

---

## .env.example

```bash
# Application
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_TITLE=Brand Name

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_
STRIPE_SECRET_KEY=sk_live_
STRIPE_WEBHOOK_SECRET=whsec_
STRIPE_PRICE_ID_PRIMARY=price_

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-

# Rate Limiting (Upstash/Vercel KV)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Email (Resend)
RESEND_API_KEY=re_
RESEND_FROM_EMAIL=hello@yourdomain.com
RESEND_TO_EMAIL=your@email.com

# Booking
NEXT_PUBLIC_CAL_LINK=https://cal.com/yourname/strategy-call

# Auth (if applicable)
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://yourdomain.com
```
