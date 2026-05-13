---
name: security-guard
description: >
  Automatically apply security best practices during every build, file creation, and code review.
  Triggers on: any API route creation, any form component, any authentication logic, any
  environment variable usage, any Stripe or payment integration, any Sanity CMS integration,
  any contact form, any user input handling, any webhook endpoint, any middleware creation,
  or any request to "review security" or "check for vulnerabilities."
  Security is applied during development — not as an afterthought. This skill activates
  proactively, not only when explicitly requested.
---

# Security Guard Skill

Security is a first-class feature of every build in this system.
This skill applies security patterns automatically whenever relevant code is written.
Never wait to be asked to "add security." Apply it as you build.

---

## Automatic Security Checks

When creating or modifying ANY of the following, apply the relevant section below:

| File Type | Apply Section |
|---|---|
| `app/api/**/route.ts` | API Route Security |
| Any form component | Input Validation |
| `.env` or env var usage | Environment Security |
| Stripe-related files | Payment Security |
| Sanity client/queries | CMS Security |
| `middleware.ts` | Middleware Security |
| Auth-related files | Authentication Security |
| `next.config.ts` | HTTP Headers |

---

## API Route Security — Apply to Every Route

Every API route must include:

```typescript
// 1. Method validation
if (req.method !== 'POST') {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

// 2. Rate limiting (import from lib/rate-limit.ts)
const identifier = req.headers.get('x-forwarded-for') ?? 'anonymous'
const { success } = await limiter.limit(identifier)
if (!success) {
  return Response.json({ error: 'Too many requests' }, { status: 429 })
}

// 3. Input validation (Zod)
const result = schema.safeParse(await req.json())
if (!result.success) {
  return Response.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 })
}

// 4. Try/catch with sanitized error response
try {
  // ... logic
} catch (error) {
  console.error('[API Error]', error) // server log only
  return Response.json({ error: 'Internal server error' }, { status: 500 })
  // Never: return error.message to client
}
```

---

## Input Validation — Apply to Every Form

Every form must have a matching Zod schema validated BOTH client and server:

```typescript
// lib/schemas/contact.ts — shared between client and server
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone').optional(),
  company: z.string().max(200).optional(),
  message: z.string().min(10, 'Please provide more detail').max(2000),
  // Honeypot — must be empty
  website: z.string().max(0, 'Bot detected').optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
```

**Honeypot field (add to every form):**
```tsx
{/* Hidden from users via CSS — bots fill it in */}
<input
  type="text"
  name="website"
  autoComplete="off"
  tabIndex={-1}
  className="absolute opacity-0 pointer-events-none h-0 w-0"
  {...register('website')}
/>
```

---

## Environment Security — Apply When Using Env Vars

```typescript
// ✅ Correct — server-only vars
const stripeKey = process.env.STRIPE_SECRET_KEY // throws at runtime if missing

// ✅ For required vars: fail fast at startup
function getRequiredEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

// ✅ Public vars (safe for client)
const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

// ❌ Never
const key = 'sk_live_XXXXXXXXXXXX' // Hardcoded secret
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN // Sanity token in NEXT_PUBLIC
```

**Environment variable audit — run on every new var added:**
- Does it contain a secret? → Must NOT be `NEXT_PUBLIC_`
- Is it needed client-side? → Must be `NEXT_PUBLIC_`
- Is it required for the app to function? → Add to `getRequiredEnvVar()` check
- Update `.env.example` immediately

---

## Payment Security — Apply to Every Stripe Integration

```typescript
// ✅ Webhook validation — mandatory
export async function POST(req: Request) {
  const body = await req.text() // Raw text — do not parse as JSON first
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return Response.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  // Return 200 immediately, process async
  void processWebhookEvent(event)
  return Response.json({ received: true })
}

// ✅ Price IDs — never accept from client
// Client sends: { priceId: 'price_XXX' } ← DANGEROUS
// Server uses: process.env.STRIPE_PRICE_ID_PRIMARY ← SAFE

// ✅ Idempotency
const session = await stripe.checkout.sessions.create({
  // ...
}, {
  idempotencyKey: `checkout_${userId}_${Date.now()}`
})
```

---

## CMS Security — Apply to Every Sanity Usage

```typescript
// lib/sanity/client.ts

// ✅ Public read client (safe for client components)
export const publicClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
  // No token — public data only
})

// ✅ Write client — SERVER ONLY
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!, // Server only
})

// ✅ Parameterized GROQ queries
export async function getPostBySlug(slug: string) {
  return publicClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug } // ← parameterized, not interpolated
  )
}
```

---

## HTTP Security Headers — Apply in next.config.ts

```typescript
// next.config.ts
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

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ]
  }
}
```

---

## Rate Limiting Setup

Create this file once per project and import it in every API route:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

// Different limits for different endpoints
export const contactLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'contact',
})

export const bookingLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 d'),
  analytics: true,
  prefix: 'booking',
})

export const paymentLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'payment',
})

// Usage in route:
// const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
// const { success } = await contactLimiter.limit(ip)
// if (!success) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
```

---

## Security Anti-Patterns — Never Do These

```typescript
// ❌ Exposing error details to client
catch (error) {
  return Response.json({ error: error.message }) // Exposes internals
}

// ❌ Trusting client-supplied price
const { amount } = await req.json()
await stripe.paymentIntents.create({ amount }) // Client sets the price!

// ❌ Unparameterized GROQ
const query = `*[slug == "${req.query.slug}"]` // GROQ injection

// ❌ Secret in NEXT_PUBLIC
const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN // Exposed in browser

// ❌ Missing auth check on protected route
export async function GET(req: Request) {
  const data = await getPrivateData() // No session check
  return Response.json(data)
}

// ❌ dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // XSS risk
```

---

## Security Review Checklist (Run Before Every Commit)

- [ ] No secrets in code — grep: `grep -r "sk_live\|secret_key\|api_key" src/`
- [ ] All API routes have rate limiting
- [ ] All API routes have Zod validation
- [ ] All API routes have try/catch with sanitized errors
- [ ] Stripe webhook verifies signature
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `any` types that could bypass validation
- [ ] `.env.local` not staged — `git status`
- [ ] Security headers in `next.config.ts`
- [ ] `pnpm audit` — zero high/critical
