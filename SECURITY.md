# SECURITY.md — Security Checklist
# Review this before every commit. Complete before every deployment.
# This is not optional. Security is built in, not bolted on.

---

## HOW TO USE THIS FILE

- Work through each section during development, not after.
- Check off each item as you implement it, not just review it.
- If a check doesn't apply to this project, mark it N/A with a reason.
- Any unchecked item at deployment must have a documented exception.

---

## 🔐 ENVIRONMENT & SECRETS

- [ ] All API keys, tokens, and secrets stored in `.env.local` only
- [ ] `.env.local` is in `.gitignore` — verify with `git status`
- [ ] `.env.example` exists with all variable names but no values
- [ ] No secrets in `NEXT_PUBLIC_*` variables (these are exposed client-side)
      - ✅ OK in NEXT_PUBLIC: Stripe publishable key, GA4 ID, Sanity project ID, site URL
      - ❌ NEVER in NEXT_PUBLIC: Stripe secret key, Sanity API token, any private key
- [ ] Sanity API token is server-only (never passed to client components)
- [ ] Stripe secret key only used in `/api` routes and server actions
- [ ] No hardcoded credentials, connection strings, or tokens anywhere in source code
- [ ] Vercel environment variables configured separately for preview vs production

---

## 🌐 HTTP SECURITY HEADERS

Configure in `next.config.ts`. All headers below must be present:

- [ ] `X-Frame-Options: DENY` — prevents clickjacking
- [ ] `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` — disable unused browser features
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] `Content-Security-Policy` — configured (see template below)
- [ ] No `X-Powered-By` header (Next.js disables by default — verify)

**CSP Template (customize per project):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com;
  font-src 'self';
  connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.sanity.io;
  frame-src https://js.stripe.com https://cal.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

**Verify headers at:** https://securityheaders.com

---

## 📝 INPUT VALIDATION & SANITIZATION

- [ ] All form inputs validated client-side with Zod schema
- [ ] Same Zod schema re-validated server-side in API route (never trust client)
- [ ] Email fields validated with regex + Zod `.email()`
- [ ] Phone fields validated for expected format
- [ ] Text fields have `maxLength` enforced in Zod schema
- [ ] File uploads (if any): type whitelist, size limit, server-side validation
- [ ] No `eval()` anywhere in codebase
- [ ] No `dangerouslySetInnerHTML` without explicit DOMPurify sanitization
- [ ] URL parameters sanitized before use in queries or rendering
- [ ] Sanity GROQ queries use parameterized queries, never string concatenation

---

## 🔑 AUTHENTICATION & AUTHORIZATION

*(If this site has auth — skip section if fully public)*

- [ ] NextAuth.js v5 configured with secure session strategy (`database` preferred over `jwt` for sensitive apps)
- [ ] Session tokens expire appropriately (recommend 24h for sensitive, 7d for general)
- [ ] CSRF protection enabled (NextAuth handles this — verify it's not disabled)
- [ ] Protected routes use middleware (`middleware.ts`) not client-side redirects only
- [ ] Admin routes require role check on server, not just client
- [ ] Password reset tokens expire within 1 hour
- [ ] Brute force protection on login (rate limiting — see below)
- [ ] OAuth providers configured with correct callback URLs for each environment

---

## 🚦 RATE LIMITING

- [ ] Rate limiting applied to all public API routes
- [ ] Contact form: max 3 submissions per IP per hour
- [ ] Booking initiation: max 10 per IP per day
- [ ] Payment initiation: max 5 attempts per IP per hour
- [ ] Login endpoint (if auth): max 5 attempts per IP per 15 minutes
- [ ] Use `@upstash/ratelimit` with Vercel KV (free tier) or custom middleware

**Implementation pattern:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export const contactFormLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
})
```

---

## 💳 STRIPE SECURITY

- [ ] Stripe publishable key in `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Stripe secret key in `STRIPE_SECRET_KEY` (server only, never client)
- [ ] Webhook secret in `STRIPE_WEBHOOK_SECRET` (server only)
- [ ] Webhook handler validates signature with `stripe.webhooks.constructEvent()`
- [ ] Webhook handler returns 200 before processing (prevents timeout retries)
- [ ] Price/product IDs hardcoded or from env — never accepted from client request body
- [ ] Payment amounts never calculated client-side — always from Stripe price object
- [ ] Idempotency keys used for payment creation
- [ ] Webhook endpoint only accessible from Stripe IPs (Vercel: use edge middleware)

**Webhook validation (mandatory pattern):**
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text() // Must be raw text, not JSON
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  // Process event...
  return new Response('OK', { status: 200 })
}
```

---

## 🗄 SANITY CMS SECURITY

- [ ] Sanity project ID and dataset safe as `NEXT_PUBLIC` (not sensitive)
- [ ] Sanity API token (write access) is server-only — never `NEXT_PUBLIC`
- [ ] Read-only token used for public content fetching where possible
- [ ] Sanity Studio access restricted to authenticated editors (configure CORS)
- [ ] GROQ queries use parameters, never raw string interpolation:
      ```typescript
      // ✅ Safe
      const query = `*[_type == "post" && slug.current == $slug]`
      const params = { slug: userInput }

      // ❌ Vulnerable
      const query = `*[_type == "post" && slug.current == "${userInput}"]`
      ```
- [ ] Sanity webhook secrets validated if using Sanity webhooks

---

## 📨 CONTACT FORM SECURITY

- [ ] Honeypot field added (invisible to users, catches bots)
- [ ] Rate limiting applied (see Rate Limiting section)
- [ ] Form submission requires server-side validation
- [ ] Email sending uses transactional email service (Resend, SendGrid) — not raw SMTP
- [ ] No user-supplied content rendered as HTML in notification emails
- [ ] Confirmation email sent to user is plain text or tightly controlled template
- [ ] Form endpoint not publicly documented (obscurity as minor extra layer)

---

## 🔍 DEPENDENCY SECURITY

- [ ] Run `pnpm audit` — zero high or critical vulnerabilities before deployment
- [ ] Dependencies pinned to exact versions in `package.json` for production stability
- [ ] Dependabot or Renovate enabled on the GitHub repo
- [ ] No abandoned packages (last published > 2 years ago without major reason)
- [ ] `node_modules` never committed (in `.gitignore`)
- [ ] Lock file (`pnpm-lock.yaml`) committed and reviewed on updates

---

## 🌍 CORS & API SECURITY

- [ ] API routes that should be internal only reject requests from unexpected origins
- [ ] CORS headers only set on routes that need cross-origin access
- [ ] Public API routes return minimal data — no internal IDs or server details
- [ ] Error responses never expose stack traces, file paths, or internal structure
- [ ] All API responses have proper `Content-Type` headers

---

## 📱 CLIENT-SIDE SECURITY

- [ ] No sensitive logic or calculations in client-side code
- [ ] localStorage / sessionStorage never stores tokens or sensitive PII
- [ ] External scripts loaded only from trusted domains with integrity check where possible
- [ ] Third-party scripts (GA4, Stripe.js, Cal.com) loaded via official methods only
- [ ] React hydration errors checked — they can indicate XSS vulnerabilities
- [ ] Framer Motion / GSAP animations don't expose route information or state

---

## 🚀 PRE-DEPLOYMENT FINAL CHECK

- [ ] All items above reviewed
- [ ] `pnpm audit` clean
- [ ] Security headers verified at securityheaders.com
- [ ] No `.env.local` in git history (`git log --all -- .env.local`)
- [ ] Stripe webhook tested with Stripe CLI
- [ ] Contact form tested with spam inputs
- [ ] Error pages (404, 500) don't expose server information
- [ ] Vercel preview URLs not indexed by search engines (Vercel default — verify)
- [ ] Production environment variables set in Vercel dashboard (not in code)
- [ ] Custom domain has SSL certificate active
- [ ] HSTS preload submitted if desired: https://hstspreload.org

---

## 📚 REFERENCES

- Next.js Security: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- Stripe Security: https://stripe.com/docs/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Sanity Security: https://www.sanity.io/docs/security
- Vercel Security: https://vercel.com/docs/security
