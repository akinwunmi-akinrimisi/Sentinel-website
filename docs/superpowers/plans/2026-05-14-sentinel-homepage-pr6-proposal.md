# Sentinel Homepage — PR 6: Proposal Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the full proposal-request flow — Zod-validated form, secret-guarded API route with rate-limiting, Resend prospect + internal emails, Slack `#new-leads` notification, HubSpot Forms API submit, `/contact` page that hosts the form, `/thanks` page with print stylesheet, and the security headers in `next.config.ts` that the spec requires before this PR ships.

**Architecture:** A single source-of-truth Zod schema in `src/lib/proposal/schema.ts` is imported by both `ProposalForm.tsx` (client, react-hook-form resolver) and `src/app/api/proposal/route.ts` (server, re-validates the same shape). The API route is the only place that ever runs the integrations; it executes them in a fail-soft sequence — Resend, Slack, HubSpot — so the user response is never blocked by a third-party outage. Rate-limiting is sliding-window via Upstash (5 / min / IP). Security headers (CSP, HSTS, X-Frame-Options, etc.) are applied globally via the `headers()` function in `next.config.ts`.

**Tech Stack:** Next.js 16.2.6 server components + route handler · TypeScript 5.9 strict · Zod 4.x · React Hook Form 7.x · `@hookform/resolvers` · `resend` 6.x · `@react-email/components` (added in Task 1) · `@upstash/ratelimit` 2.x + `@vercel/kv` · `next-themes` already installed but unused here · Tailwind v4.

**Spec reference:** `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` §4.2 (proposal write path), §7 (error handling — fail-soft integrations), §10 (Security). `WEBSITE_CONTEXT.md` §7 (13 form fields + business-email rejection list), §9 (print stylesheet on thanks page). `SECURITY.md` (HTTP headers checklist) — applied in Task 2.

**Conventions:** `docs/CONVENTIONS.md` — shadcn `<Button>` inside forms (not the marketing `.btn-primary` class); raw `var()` for Sentinel-only tokens; one section/component per file; server components by default.

**Out of scope for PR 6 (deferred):**
- `/contact` page-level SEO copy beyond the eyebrow + h1 + sub from spec §4.2.
- Print-stylesheet typography polish on `/thanks` — the basic `@media print` rules ship, but visual proofing is PR 8 territory.
- GA4 event wiring inside the form. `events.ts` already exports `proposalFormStart` and `proposalFormSubmit`; the form calls them, but full GA4 verification (DebugView) is PR 8.
- CCPA consent banner — the form is a first-party first-purpose interaction and does not need consent gating; the banner gates GA4 separately in PR 8.
- HubSpot deal-pipeline integration beyond the Forms-API submit. The Forms API records the lead; pipeline progression is manual in HubSpot UI for launch.
- The `BookingDialog` Cal.com modal (PR 7).

---

## Prerequisites — User action before Task 1

PR 6 needs four new environment variables in `.env.local` (or `.env`). The build will succeed without them — every integration fails soft — but the form won't actually deliver emails / Slack / HubSpot until they're set.

```bash
# Required for full functionality. Leave blank to skip the integration (it'll log only).
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=training@sentinelinstitute.com
RESEND_TO_EMAIL=training@sentinelinstitute.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
HUBSPOT_PORTAL_ID=...
HUBSPOT_FORM_ID=...

# Vercel KV / Upstash (rate limiter). If unset, rate limiting is bypassed.
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

`.env.example` already documents all of these from PR 1 — no edit needed. The implementer should NOT auto-add these to `.env.local`; the user supplies them when they're ready to send real emails.

---

## File Structure for This PR

```
package.json                                       MODIFY: add @react-email/components dep
next.config.ts                                     MODIFY: add async headers() with full security suite

src/lib/proposal/
└── schema.ts                                      CREATE: shared Zod schema + types

src/lib/rate-limit.ts                              CREATE: Upstash sliding-window limiter (5/min/IP)

src/lib/email/
├── resend.ts                                      CREATE: Resend client + helper sendProposalEmails
└── templates.tsx                                  CREATE: ProspectConfirmationEmail + InternalNotificationEmail

src/app/api/proposal/
└── route.ts                                       CREATE: POST → Zod → rate-limit → Resend → Slack → HubSpot

src/components/forms/
└── ProposalForm.tsx                               CREATE: client component, RHF + zodResolver

src/app/(marketing)/contact/
└── page.tsx                                       CREATE: form host page

src/app/thanks/
└── page.tsx                                       CREATE: thank-you page with @media print
```

---

## Task 1 — Install `@react-email/components`

The email templates use React Email's components (`<Html>`, `<Body>`, `<Container>`, etc.) for cross-client compatible HTML emails. Resend renders these to inline-styled HTML at send time.

- [ ] **Step 1: Add dependency**

```bash
pnpm add @react-email/components@latest
```

Expected: a single dep added to `package.json` and `pnpm-lock.yaml` updated.

- [ ] **Step 2: Verify install**

Run: `pnpm tsc --noEmit`

Expected: zero errors (new dep brings its own types).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(pr6): add @react-email/components dep"
```

---

## Task 2 — Security headers in `next.config.ts`

Per `SECURITY.md` — these MUST be in place before PR 6 ships. CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. The CSP allows the third-party origins the homepage needs: Stripe (PR 7+), Sanity CDN (PR 4 already), Google Tag Manager (PR 8 future), Cal.com (PR 7 future).

- [ ] **Step 1: Replace `next.config.ts`** with EXACTLY this content:

```ts
import type { NextConfig } from "next"

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.sanity.io",
  "frame-src https://js.stripe.com https://cal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to every route EXCEPT the Studio (which loads its own scripts/iframes
        // and is gated to authenticated editors anyway).
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(pr6): add SECURITY.md HTTP headers (CSP, HSTS, XFO, etc.)"
```

---

## Task 3 — Shared Zod schema for the proposal

Single source of truth used by client form (validation + resolver) and server route (re-validation). Includes the business-email rejection list per WEBSITE_CONTEXT §9.

**Files:**
- Create: `src/lib/proposal/schema.ts`

- [ ] **Step 1: Create `src/lib/proposal/schema.ts`** with EXACTLY this content:

```ts
import { z } from 'zod'

/**
 * Personal email domains rejected by business-email validation.
 * Per WEBSITE_CONTEXT.md §9.
 */
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'outlook.com',
  'me.com',
  'aol.com',
] as const

const COMPANY_SIZE = ['50-150', '150-500', '500-2000', '2000+'] as const
const INDUSTRY = [
  'Financial Services',
  'Healthcare',
  'Government & Defense',
  'Insurance',
  'Legal',
  'Utilities & Energy',
  'Pharmaceuticals',
  'Technology',
  'Other',
] as const
const TEAM_SIZE = ['5-10', '10-25', '25-50', '50+'] as const
const CERTIFICATIONS = ['Security+', 'CySA+', 'CASP+', 'Security Awareness', 'Not sure'] as const
const COMPLIANCE_DRIVER = [
  'HIPAA',
  'PCI-DSS',
  'CMMC Level 2 or 3',
  'SOC 2',
  'NIST CSF',
  'NERC CIP',
  'Board directive',
  'Internal audit finding',
  'Other',
] as const
const TIMELINE = ['Within 30 days', '1-3 months', '3-6 months', 'Planning ahead'] as const
const REFERRAL = ['Google', 'LinkedIn', 'Referral', 'Press', 'Event', 'Other'] as const

const usPhoneRegex = /^[\d\s().+-]{10,20}$/

export const proposalSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(80),
  businessEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .refine((email) => {
      const domain = email.split('@')[1] ?? ''
      return !(PERSONAL_EMAIL_DOMAINS as readonly string[]).includes(domain)
    }, 'Please use your company email address.'),
  phone: z
    .string()
    .trim()
    .regex(usPhoneRegex, 'Enter a valid US phone number'),
  company: z.string().trim().min(2, 'Company is required').max(120),
  jobTitle: z.string().trim().min(2, 'Job title is required').max(120),
  companySize: z.enum(COMPANY_SIZE),
  industry: z.enum(INDUSTRY),
  teamSize: z.enum(TEAM_SIZE),
  certifications: z
    .array(z.enum(CERTIFICATIONS))
    .min(1, 'Select at least one certification or "Not sure"'),
  complianceDriver: z.enum(COMPLIANCE_DRIVER),
  timeline: z.enum(TIMELINE),
  referralSource: z.enum(REFERRAL),
  notes: z.string().trim().max(2000).optional().default(''),
})

export type ProposalInput = z.infer<typeof proposalSchema>

export const PROPOSAL_OPTIONS = {
  companySize: COMPANY_SIZE,
  industry: INDUSTRY,
  teamSize: TEAM_SIZE,
  certifications: CERTIFICATIONS,
  complianceDriver: COMPLIANCE_DRIVER,
  timeline: TIMELINE,
  referralSource: REFERRAL,
} as const
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/proposal/schema.ts
git commit -m "feat(pr6): shared Zod schema for proposal form"
```

---

## Task 4 — Upstash rate limiter

Sliding-window limiter: 5 requests per minute per IP. Reads `KV_REST_API_URL` and `KV_REST_API_TOKEN`; if either is missing, the limiter no-ops (returns `{ success: true, remaining: Infinity }`) so dev works without a Vercel KV account.

**Files:**
- Create: `src/lib/rate-limit.ts`

- [ ] **Step 1: Create `src/lib/rate-limit.ts`** with EXACTLY this content:

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

interface RateLimitResult {
  success: boolean
  remaining: number
  retryAfterSeconds: number
}

let limiter: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    // Local dev without KV — return null so callers no-op the check.
    return null
  }
  limiter = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'rl:proposal',
  })
  return limiter
}

/**
 * Rate-limits a request by `identifier` (typically the request IP). Returns
 * `{ success: true }` if the request is allowed, `{ success: false, retryAfterSeconds }`
 * if rejected. If Vercel KV credentials are not configured (local dev), the
 * limiter no-ops and every request is allowed — this is intentional, the
 * production environment is the only place rate limiting matters.
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const lim = getLimiter()
  if (!lim) {
    return { success: true, remaining: Number.POSITIVE_INFINITY, retryAfterSeconds: 0 }
  }

  const result = await lim.limit(identifier)
  const retryAfterSeconds = result.success
    ? 0
    : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))

  return {
    success: result.success,
    remaining: result.remaining,
    retryAfterSeconds,
  }
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts
git commit -m "feat(pr6): Upstash sliding-window rate limiter"
```

---

## Task 5 — Resend client wrapper

Wraps `resend.emails.send()` with a fail-soft contract: on success, returns the email ID; on failure, returns `null` and logs server-side. Never throws.

**Files:**
- Create: `src/lib/email/resend.ts`

- [ ] **Step 1: Create `src/lib/email/resend.ts`** with EXACTLY this content:

```ts
import { Resend } from 'resend'
import type { ReactElement } from 'react'

type SendArgs = {
  to: string
  subject: string
  react: ReactElement
  replyTo?: string
}

let client: Resend | null = null

function getClient(): Resend | null {
  if (client) return client
  if (!process.env.RESEND_API_KEY) return null
  client = new Resend(process.env.RESEND_API_KEY)
  return client
}

/**
 * Sends an email via Resend. Fail-soft: returns `null` if no API key, no
 * from-email, or send error. Never throws. The route handler logs failures
 * via a Slack alert; user response is unaffected.
 */
export async function sendEmail({ to, subject, react, replyTo }: SendArgs): Promise<string | null> {
  const resend = getClient()
  if (!resend) {
    console.warn('[resend] RESEND_API_KEY not set — skipping send')
    return null
  }
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    console.warn('[resend] RESEND_FROM_EMAIL not set — skipping send')
    return null
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(replyTo ? { replyTo } : {}),
    })
    return result.data?.id ?? null
  } catch (error) {
    console.error('[resend] send failed:', error)
    return null
  }
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/resend.ts
git commit -m "feat(pr6): Resend client wrapper with fail-soft contract"
```

---

## Task 6 — React Email templates

Two templates: prospect confirmation (response SLA + booking link) + internal notification (raw form payload for the training team).

**Files:**
- Create: `src/lib/email/templates.tsx`

- [ ] **Step 1: Create `src/lib/email/templates.tsx`** with EXACTLY this content:

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ProposalInput } from '@/lib/proposal/schema'

const styles = {
  body: { backgroundColor: '#FAFAFA', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0 },
  container: { maxWidth: '560px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' },
  eyebrow: { color: '#1D4ED8', fontFamily: 'Menlo, Consolas, monospace', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.18em', margin: '0 0 16px' },
  heading: { color: '#0A1628', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '28px', lineHeight: '1.2', margin: '0 0 24px' },
  body_text: { color: '#374151', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' },
  meta: { color: '#6B7280', fontFamily: 'Menlo, Consolas, monospace', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.15em', margin: '4px 0' },
  cta: { color: '#1D4ED8', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '15px', fontWeight: 600, textDecoration: 'none' },
  hr: { borderColor: '#E5E7EB', margin: '24px 0' },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sentinelinstitute.com'
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? 'https://cal.com/sentinelinstitute/discovery'

interface ProspectConfirmationProps {
  fullName: string
}

export function ProspectConfirmationEmail({ fullName }: ProspectConfirmationProps) {
  const firstName = fullName.split(/\s+/)[0] ?? fullName
  return (
    <Html>
      <Head />
      <Preview>We received your proposal request — Sentinel Institute</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>Sentinel Institute</Text>
          <Heading style={styles.heading}>Thanks, {firstName}. We&apos;ll be in touch within 1 business day.</Heading>
          <Text style={styles.body_text}>
            Your proposal request reached our training team. A senior advisor will review your
            requirements — team size, compliance driver, target timeline — and respond with a
            tailored proposal within one business day.
          </Text>
          <Text style={styles.body_text}>
            If you&apos;d prefer to talk through the program live, you can book a 20-minute
            discovery call directly on our calendar:
          </Text>
          <Text style={styles.body_text}>
            <Link href={CAL_LINK} style={styles.cta}>Book a discovery call →</Link>
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.meta}>Sentinel Institute · Chicago, IL · <Link href={SITE_URL} style={{ color: '#6B7280' }}>{SITE_URL.replace('https://', '')}</Link></Text>
        </Container>
      </Body>
    </Html>
  )
}

interface InternalNotificationProps {
  payload: ProposalInput
  ip: string
}

export function InternalNotificationEmail({ payload, ip }: InternalNotificationProps) {
  const certList = payload.certifications.join(', ')
  return (
    <Html>
      <Head />
      <Preview>New proposal request: {payload.company} · {payload.complianceDriver}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>New Proposal Request</Text>
          <Heading style={styles.heading}>{payload.company} · {payload.complianceDriver}</Heading>

          <Section>
            <Text style={styles.meta}>Buyer</Text>
            <Text style={styles.body_text}>
              {payload.fullName}, {payload.jobTitle}<br />
              <Link href={`mailto:${payload.businessEmail}`} style={styles.cta}>{payload.businessEmail}</Link><br />
              {payload.phone}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.meta}>Engagement</Text>
            <Text style={styles.body_text}>
              Industry: {payload.industry}<br />
              Company size: {payload.companySize}<br />
              Team to train: {payload.teamSize}<br />
              Certifications of interest: {certList}<br />
              Compliance driver: {payload.complianceDriver}<br />
              Target start: {payload.timeline}<br />
              Heard about us via: {payload.referralSource}
            </Text>
          </Section>

          {payload.notes ? (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Text style={styles.meta}>Notes</Text>
                <Text style={styles.body_text}>{payload.notes}</Text>
              </Section>
            </>
          ) : null}

          <Hr style={styles.hr} />
          <Text style={styles.meta}>Submitted from {ip}</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates.tsx
git commit -m "feat(pr6): React Email templates (prospect confirmation + internal notification)"
```

---

## Task 7 — `/api/proposal` route handler

POST handler. Flow: parse JSON → Zod re-validate → resolve IP → rate-limit → Resend prospect + internal in parallel → Slack webhook (fire-and-forget) → HubSpot Forms API (fire-and-forget). All third-party failures degrade to a logged Slack alert; the user response is always 200 if validation + rate limit pass.

**Files:**
- Create: `src/app/api/proposal/route.ts`

- [ ] **Step 1: Create `src/app/api/proposal/route.ts`** with EXACTLY this content:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { proposalSchema } from '@/lib/proposal/schema'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email/resend'
import {
  InternalNotificationEmail,
  ProspectConfirmationEmail,
} from '@/lib/email/templates'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

async function notifySlack(payload: {
  company: string
  buyer: string
  email: string
  industry: string
  complianceDriver: string
  teamSize: string
  timeline: string
  failedSteps?: string[]
}) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const failed = payload.failedSteps?.length ? ` ⚠️ failed: ${payload.failedSteps.join(', ')}` : ''
  const text =
    `🟢 *New proposal* — ${payload.company} (${payload.industry})\n` +
    `${payload.buyer} · ${payload.email}\n` +
    `Driver: ${payload.complianceDriver} · Team: ${payload.teamSize} · Start: ${payload.timeline}` +
    failed
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    console.error('[slack] webhook failed:', error)
  }
}

async function submitToHubSpot(payload: Record<string, unknown>): Promise<boolean> {
  const portalId = process.env.HUBSPOT_PORTAL_ID
  const formId = process.env.HUBSPOT_FORM_ID
  if (!portalId || !formId) return false
  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: Object.entries(payload).map(([name, value]) => ({
            name,
            value: Array.isArray(value) ? value.join(', ') : String(value ?? ''),
          })),
          context: { pageUri: process.env.NEXT_PUBLIC_SITE_URL ?? '', pageName: 'Request a Proposal' },
        }),
      }
    )
    return res.ok
  } catch (error) {
    console.error('[hubspot] submit failed:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  // 1. Parse body
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  // 2. Re-validate against the same schema the client used
  const parsed = proposalSchema.safeParse(json)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      {
        field: firstIssue?.path.join('.') ?? null,
        message: firstIssue?.message ?? 'Invalid input',
      },
      { status: 422 }
    )
  }

  const payload = parsed.data

  // 3. Rate limit by IP
  const ip = getClientIp(req)
  const rl = await rateLimit(ip)
  if (!rl.success) {
    return NextResponse.json(
      {
        message: `You've submitted recently. Try again in ${rl.retryAfterSeconds} seconds.`,
        retryAfter: rl.retryAfterSeconds,
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    )
  }

  // 4. Fan out the integrations
  const internalTo = process.env.RESEND_TO_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? ''
  const [prospectResult, internalResult] = await Promise.all([
    sendEmail({
      to: payload.businessEmail,
      subject: 'We received your proposal request — Sentinel Institute',
      react: ProspectConfirmationEmail({ fullName: payload.fullName }),
    }),
    internalTo
      ? sendEmail({
          to: internalTo,
          subject: `New proposal — ${payload.company} (${payload.complianceDriver})`,
          react: InternalNotificationEmail({ payload, ip }),
          replyTo: payload.businessEmail,
        })
      : Promise.resolve(null),
  ])

  const hubspotOk = await submitToHubSpot({
    firstname: payload.fullName.split(/\s+/)[0] ?? '',
    lastname: payload.fullName.split(/\s+/).slice(1).join(' '),
    email: payload.businessEmail,
    phone: payload.phone,
    company: payload.company,
    jobtitle: payload.jobTitle,
    company_size: payload.companySize,
    industry: payload.industry,
    team_size: payload.teamSize,
    certifications_of_interest: payload.certifications,
    compliance_driver: payload.complianceDriver,
    timeline: payload.timeline,
    referral_source: payload.referralSource,
    notes: payload.notes,
  })

  const failedSteps: string[] = []
  if (prospectResult === null && process.env.RESEND_API_KEY) failedSteps.push('prospect-email')
  if (internalResult === null && internalTo && process.env.RESEND_API_KEY) failedSteps.push('internal-email')
  if (!hubspotOk && process.env.HUBSPOT_PORTAL_ID) failedSteps.push('hubspot')

  // Slack is fire-and-forget; even if it throws internally it's swallowed.
  await notifySlack({
    company: payload.company,
    buyer: payload.fullName,
    email: payload.businessEmail,
    industry: payload.industry,
    complianceDriver: payload.complianceDriver,
    teamSize: payload.teamSize,
    timeline: payload.timeline,
    failedSteps,
  })

  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
```

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/proposal/route.ts
git commit -m "feat(pr6): POST /api/proposal — Zod validate, rate-limit, Resend, Slack, HubSpot"
```

---

## Task 8 — `ProposalForm.tsx`

Client component. React Hook Form + `zodResolver(proposalSchema)`. Renders all 13 fields using shadcn primitives (`Input`, `Select`, `Textarea`, `Label`, `Button`). Uses native checkboxes (a `<fieldset>` of `<label><input type="checkbox">`) for the multi-select. Fires `analytics.proposalFormStart` on first focus and `analytics.proposalFormSubmit` on success, then redirects to `/thanks`.

**Files:**
- Create: `src/components/forms/ProposalForm.tsx`

- [ ] **Step 1: Create `src/components/forms/ProposalForm.tsx`** with EXACTLY this content:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { proposalSchema, PROPOSAL_OPTIONS, type ProposalInput } from "@/lib/proposal/schema"
import { analytics } from "@/lib/analytics/events"

type FormError = { field?: string | null; message: string } | null

export function ProposalForm() {
  const router = useRouter()
  const startFiredRef = useRef(false)
  const [serverError, setServerError] = useState<FormError>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProposalInput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      fullName: "",
      businessEmail: "",
      phone: "",
      company: "",
      jobTitle: "",
      certifications: [],
      notes: "",
    },
    mode: "onBlur",
  })

  // Fire `proposal_form_start` on first focus of any field.
  useEffect(() => {
    if (typeof window === "undefined") return
    function handler() {
      if (startFiredRef.current) return
      const active = document.activeElement
      if (active && active.closest("form[data-form='proposal']")) {
        startFiredRef.current = true
        analytics.proposalFormStart()
      }
    }
    document.addEventListener("focusin", handler)
    return () => document.removeEventListener("focusin", handler)
  }, [])

  const certs = watch("certifications") ?? []

  function toggleCert(value: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...certs, value]))
      : certs.filter((c) => c !== value)
    setValue("certifications", next as ProposalInput["certifications"], { shouldValidate: true })
  }

  async function onSubmit(data: ProposalInput) {
    setServerError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { field?: string; message?: string }
        setServerError({ field: body.field, message: body.message ?? "Submission failed. Please try again." })
        return
      }
      analytics.proposalFormSubmit()
      router.push("/thanks")
    } catch {
      setServerError({ message: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-form="proposal"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-[42rem]"
    >
      <Field label="Full name" error={errors.fullName?.message}>
        <Input {...register("fullName")} autoComplete="name" />
      </Field>

      <Field label="Business email" error={errors.businessEmail?.message}>
        <Input type="email" {...register("businessEmail")} autoComplete="email" />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <Input type="tel" {...register("phone")} autoComplete="tel" placeholder="+1 (312) 555-0194" />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Company" error={errors.company?.message}>
          <Input {...register("company")} autoComplete="organization" />
        </Field>

        <Field label="Job title" error={errors.jobTitle?.message}>
          <Input {...register("jobTitle")} autoComplete="organization-title" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlledSelect
          name="companySize"
          label="Company size"
          control={control}
          options={PROPOSAL_OPTIONS.companySize}
          error={errors.companySize?.message}
        />
        <ControlledSelect
          name="industry"
          label="Industry"
          control={control}
          options={PROPOSAL_OPTIONS.industry}
          error={errors.industry?.message}
        />
      </div>

      <ControlledSelect
        name="teamSize"
        label="Team size to train"
        control={control}
        options={PROPOSAL_OPTIONS.teamSize}
        error={errors.teamSize?.message}
      />

      <Field label="Certifications of interest" error={errors.certifications?.message}>
        <fieldset className="flex flex-wrap gap-x-5 gap-y-3">
          {PROPOSAL_OPTIONS.certifications.map((cert) => (
            <label key={cert} className="inline-flex items-center gap-2 text-[var(--color-text-primary)] cursor-pointer">
              <input
                type="checkbox"
                value={cert}
                checked={certs.includes(cert)}
                onChange={(e) => toggleCert(cert, e.target.checked)}
                className="h-4 w-4"
              />
              <span>{cert}</span>
            </label>
          ))}
        </fieldset>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlledSelect
          name="complianceDriver"
          label="Compliance driver"
          control={control}
          options={PROPOSAL_OPTIONS.complianceDriver}
          error={errors.complianceDriver?.message}
        />
        <ControlledSelect
          name="timeline"
          label="Target start"
          control={control}
          options={PROPOSAL_OPTIONS.timeline}
          error={errors.timeline?.message}
        />
      </div>

      <ControlledSelect
        name="referralSource"
        label="How did you hear about us?"
        control={control}
        options={PROPOSAL_OPTIONS.referralSource}
        error={errors.referralSource?.message}
      />

      <Field label="Additional notes (optional)" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={4} placeholder="Specific compliance requirements, timing constraints, etc." />
      </Field>

      {serverError ? (
        <p role="alert" className="text-sm text-red-400">
          {serverError.message}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Submitting…" : "Request proposal"}
      </Button>

      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        Response within 1 business day  ·  No-pass, re-train guarantee
      </p>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}

interface ControlledSelectProps<TName extends keyof ProposalInput> {
  name: TName
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  options: readonly string[]
  error?: string
}

function ControlledSelect<TName extends keyof ProposalInput>({
  name,
  label,
  control,
  options,
  error,
}: ControlledSelectProps<TName>) {
  return (
    <Field label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={(field.value as string) ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  )
}
```

**Note on the `any` type:** the `control: any` annotation on `ControlledSelect` is a deliberate ESLint escape hatch for react-hook-form's generic Control type, which is invariant over the form shape and frequently fights with destructured generics. The rest of the file is fully typed.

- [ ] **Step 2: Verify**

Run: `pnpm tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/ProposalForm.tsx
git commit -m "feat(pr6): ProposalForm client component (RHF + zodResolver, 13 fields)"
```

---

## Task 9 — `/contact` page (form host)

Single-page form host. Narrow editorial header — eyebrow `Request a Training Proposal`, h1 `Tell us about your team.`, sub paraphrased from WEBSITE_CONTEXT §7 SLA — then `<ProposalForm />`.

**Files:**
- Create: `src/app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Create `src/app/(marketing)/contact/page.tsx`** with EXACTLY this content:

```tsx
import type { Metadata } from "next"
import { ProposalForm } from "@/components/forms/ProposalForm"

export const metadata: Metadata = {
  title: "Request a Training Proposal — Sentinel Institute",
  description: "Tell us about your team. We respond to all proposals within 1 business day.",
}

export default function ContactPage() {
  return (
    <section className="py-20 md:py-28 bg-[var(--color-surface)]">
      <div className="container-sentinel">
        <div className="max-w-[42rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Request a Training Proposal
          </p>
          <h1
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            Tell us about your team.
          </h1>
          <p className="mt-6 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
            A senior advisor reviews every request. We respond within one business day with a
            tailored proposal — cohort plan, pricing, and compliance documentation.
          </p>
        </div>
        <ProposalForm />
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
git add "src/app/(marketing)/contact/page.tsx"
git commit -m "feat(pr6): /contact page hosting the proposal form"
```

---

## Task 10 — `/thanks` page

Confirmation page with `@media print` rules per WEBSITE_CONTEXT §9. Buyers print this for internal approval routing.

**Files:**
- Create: `src/app/thanks/page.tsx`

- [ ] **Step 1: Create `src/app/thanks/page.tsx`** with EXACTLY this content:

```tsx
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Proposal Received — Sentinel Institute",
  description: "Your proposal request has been received. We respond within 1 business day.",
  robots: "noindex,nofollow",
}

export default function ThanksPage() {
  return (
    <section className="py-20 md:py-32 bg-[var(--color-surface)] print:bg-white">
      <style
        // Print-specific overrides — keeps the screen palette but switches to ink-friendly print colors.
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: black !important; }
              a { color: black !important; text-decoration: underline; }
              .no-print { display: none !important; }
            }
          `,
        }}
      />
      <div className="container-sentinel">
        <div className="max-w-[42rem] mx-auto">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] print:text-black font-medium">
            Confirmation · Proposal Received
          </p>
          <h1
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)] print:text-black"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            We received your request.
          </h1>
          <p className="mt-6 text-[var(--color-text-secondary)] print:text-black max-w-[44ch] leading-relaxed">
            A senior advisor will review your requirements and respond within one business day
            with a tailored proposal. You&apos;ll also receive a confirmation email shortly with a
            direct link to book a discovery call.
          </p>

          <div className="mt-10 pt-8 border-t border-[var(--color-border)] print:border-black/30">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] print:text-black mb-3">
              Next steps
            </p>
            <ol className="space-y-3 text-[var(--color-text-secondary)] print:text-black list-decimal pl-5">
              <li>Check your inbox for our confirmation email (within 60 seconds).</li>
              <li>Optionally book a 20-minute discovery call from the email.</li>
              <li>We&apos;ll send your tailored proposal within 1 business day.</li>
            </ol>
          </div>

          <div className="mt-12 flex flex-wrap gap-4 no-print">
            <Link href="/" className="btn-secondary" data-cta="thanks-home">
              Back to home
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-cta="thanks-book"
            >
              Book a discovery call
              <span aria-hidden="true">→</span>
            </a>
          </div>
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
git add src/app/thanks/page.tsx
git commit -m "feat(pr6): /thanks page with print stylesheet"
```

---

## Task 11 — Final verification + SECURITY.md walkthrough + tag

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`. Expected: zero errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`. Expected: zero errors.

- [ ] **Step 3: Build**

Run: `pnpm build`. Expected: clean exit. Routes should now include:
- `/` (static + ISR 1h)
- `/contact` (server-rendered, includes the client form)
- `/thanks`
- `/api/proposal` (dynamic)
- `/api/revalidate` (dynamic)
- `/studio/[[...tool]]` (dynamic)
- `/robots.txt`, `/sitemap.xml`

- [ ] **Step 4: SECURITY.md walkthrough**

Read `SECURITY.md`. Verify each of these PR 6-relevant checkboxes:

- Environment & Secrets:
  - All secrets in `.env.local` (or `.env`). ✓
  - `.env*` gitignored. Verify with `git check-ignore -v .env .env.local`. ✓
  - No secrets in `NEXT_PUBLIC_*` vars (verify `RESEND_API_KEY`, `SLACK_WEBHOOK_URL`, etc. all server-only). ✓
- HTTP Security Headers (Task 2):
  - CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy. ✓
- Input Validation:
  - Client + server Zod (`proposalSchema`). ✓
  - Email: Zod `.email()` + business-domain refine. ✓
  - Phone: regex. ✓
  - Text: maxLength on every field. ✓
  - No `eval`, no `dangerouslySetInnerHTML` in form / api (one controlled use in `/thanks` for print CSS — verify the CSS is static, no user input). ✓
- Rate Limiting:
  - 5/min/IP via Upstash. ✓
- Error Handling:
  - 422 for Zod fail with `{ field, message }`. ✓
  - 429 for rate-limit with `Retry-After` header. ✓
  - 200 for success even if third-party fails (Slack alert tracks failures). ✓

Report any SECURITY.md item that's NOT covered by PR 6 and would block a production launch.

- [ ] **Step 5: Manual smoke test (optional, requires env)**

If `RESEND_API_KEY` is set in `.env.local`:
- Start `pnpm dev`. Open http://localhost:3000/contact.
- Fill the form with a valid business email (e.g., `you@yourdomain.com`).
- Submit. Expect:
  - Redirect to `/thanks`.
  - Prospect confirmation email in your inbox within 60 seconds.
  - Internal notification email at `RESEND_TO_EMAIL`.
  - Slack message in `#new-leads` if `SLACK_WEBHOOK_URL` is set.
  - HubSpot contact record if `HUBSPOT_PORTAL_ID` + `HUBSPOT_FORM_ID` are set.
- Also test rejection paths:
  - `you@gmail.com` → inline "Please use your company email address."
  - Empty phone → inline "Enter a valid US phone number"
  - Submit twice in 60s from the same IP → 429 with "You've submitted recently…"

If env is not set, skip this step.

- [ ] **Step 6: Tag PR 6 locally**

```bash
git tag pr-6-proposal
```

Do not push.

- [ ] **Step 7: Brief**

Summarize:
- PR 6 complete: shared schema, rate-limit, Resend wrapper, two email templates, full API route, ProposalForm, /contact, /thanks, security headers in next.config.
- Local tag `pr-6-proposal` set.
- Next: PR 7 (§10 CTA + §11 FAQ + Cal.com modal).

---

## Self-Review (Spec Coverage)

| Spec §11.1 PR 6 bullet | Covered by | Status |
|---|---|---|
| `ProposalForm.tsx` with full Zod schema (all WEBSITE_CONTEXT §7 fields) | Tasks 3 + 8 | ✅ |
| `/contact` single-page form host | Task 9 | ✅ |
| `src/app/api/proposal/route.ts`: Zod re-validate → rate-limit → Resend prospect + internal → Slack → HubSpot | Task 7 | ✅ |
| `src/lib/rate-limit.ts` (Upstash) | Task 4 | ✅ |
| `src/lib/email/resend.ts` + React Email templates | Tasks 5 + 6 | ✅ |
| `/thanks` page with print stylesheet | Task 10 | ✅ |
| SECURITY.md checklist before merge | Task 11 step 4 + Task 2 (headers) | ✅ |
| webapp-testing skill runs full happy path | Task 11 step 5 (manual; depends on env) | ⚠️ Conditional |

| Spec §4.2 write-path detail | Task | Status |
|---|---|---|
| Zod validates locally, field-level inline errors | Task 8 | ✅ |
| POST `/api/proposal` Zod-shaped payload | Task 8 | ✅ |
| Upstash rate-limit 5/min/IP → 429 friendly | Tasks 4 + 7 | ✅ |
| Re-validate same Zod schema → 422 with field+message | Task 7 | ✅ |
| Reject personal email domains | Task 3 | ✅ |
| Resend prospect confirmation email | Tasks 5 + 6 + 7 | ✅ |
| Resend training@ notification email | Tasks 5 + 6 + 7 | ✅ |
| Slack webhook → #new-leads | Task 7 (notifySlack) | ✅ |
| HubSpot Forms API submit | Task 7 (submitToHubSpot) | ✅ |
| 200 OK { success: true } | Task 7 | ✅ |
| `sonner` toast + redirect to /thanks | Task 8 — redirect via `router.push("/thanks")`; toast deferred to PR 8 polish (not blocking) | ⚠️ Partial |
| GA4 `proposal_form_submit` | Task 8 (analytics call) | ✅ |

| Spec §7 fail-soft contract | Task | Status |
|---|---|---|
| Resend fail → log only, respond 200, Slack `[email-failed]` alert | Task 7 (failedSteps array + notifySlack) | ✅ |
| HubSpot fail → log + Slack `[hubspot-failed]` alert, never block | Task 7 | ✅ |
| Slack fail → swallow, log only | Task 7 (notifySlack catch) | ✅ |

| Spec §10 Security applicable to PR 6 | Task | Status |
|---|---|---|
| Secrets server-only (RESEND_API_KEY, SLACK_WEBHOOK_URL, HUBSPOT_*) | Tasks 5 + 7 (no NEXT_PUBLIC_ prefix anywhere) | ✅ |
| CSP + HSTS + XFO + X-Content-Type-Options + Referrer-Policy + Permissions-Policy | Task 2 | ✅ |
| Form inputs validated client + server | Tasks 3 + 8 (client RHF resolver) + Task 7 (server re-validate) | ✅ |
| Rate limit 5/min/IP | Tasks 4 + 7 | ✅ |
| No `dangerouslySetInnerHTML` without explicit sanitization | Task 10 (one use; static CSS string, no user input — annotated) | ✅ |

**Placeholder scan:** Grepped this plan for `TBD`, `TODO`, `fill in`, `implement later`, `add appropriate`, `similar to Task` — no hits. Every code step is complete code or an exact command.

**Type consistency:** `ProposalInput` (Task 3) is referenced verbatim in Tasks 6, 7, and 8. `PROPOSAL_OPTIONS` (Task 3) is destructured in Task 8's `ControlledSelect` calls. `proposalSchema` (Task 3) is used in both Task 7 (`safeParse`) and Task 8 (`zodResolver`). The `Resend.emails.send()` shape in Task 5 matches `resend@^6.x` API. The `next/cache` and `next/server` imports follow the patterns established in PR 4 Tasks 11 + 14.
