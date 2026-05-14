# Sentinel Institute — Pre-Launch QA Checklist

This is the manual checklist Marcus + engineering walk before the production cutover. Everything that can't be automated lives here.

## 1. Environment audit (Vercel project → Settings → Environment Variables)

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://sentinelinstitute.com`
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_SANITY_DATASET` = `production`
- [ ] `SANITY_API_TOKEN` set (Editor scope)
- [ ] `SANITY_REVALIDATE_SECRET` set (32-char random)
- [ ] `RESEND_API_KEY` set
- [ ] `RESEND_FROM_EMAIL` = `training@sentinelinstitute.com`
- [ ] `RESEND_TO_EMAIL` = `training@sentinelinstitute.com`
- [ ] `SLACK_WEBHOOK_URL` set
- [ ] `HUBSPOT_PORTAL_ID` set
- [ ] `HUBSPOT_FORM_ID` set
- [ ] `KV_REST_API_URL` set (Vercel KV)
- [ ] `KV_REST_API_TOKEN` set
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` = `G-SX7492KRTM`
- [ ] `NEXT_PUBLIC_CAL_LINK` = `https://cal.com/sentinelinstitute/discovery`

## 2. Sanity Studio audit

- [ ] All 8 schemas seeded per `docs/seed-data-pr4.md`.
- [ ] Sanity webhook configured (Manage → API → Webhooks):
  - URL: `https://sentinelinstitute.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
  - Triggers: Create, Update, Delete
  - Filter: `_type in [...]`
  - Method: POST
  - Payload: Document

## 3. Visual responsive QA (Chrome DevTools or real devices)

Verify each section renders correctly at every breakpoint:

- [ ] 375 × 667 — iPhone SE / portrait
- [ ] 768 × 1024 — iPad / portrait
- [ ] 1280 × 800 — laptop
- [ ] 1920 × 1080 — desktop

Sections to walk through:

- [ ] Hero — stat pillar collapses below copy on mobile; press band wraps.
- [ ] TrustBar — client labels wrap; CompTIA badge stays inline.
- [ ] ProblemSection — single column max-w 40rem; numbered statements stack on narrow.
- [ ] ProgramsOverview — 3-col on desktop, 1-col on mobile.
- [ ] SentinelSystem — GSAP timeline plays on first scroll; reduced-motion skips animation.
- [ ] ResultsByProgram — grid columns reflow on mobile.
- [ ] CaseStudyFeature — quote stays max-w 40rem; metadata wraps.
- [ ] Testimonials — quotes max-w 48rem; avatar + attribution stays inline.
- [ ] IndustriesServed — 3×2 / 2×3 / 1-col grid.
- [ ] ProposalCTA — centered, slot count visible.
- [ ] FAQPreview — accordion fully clickable, content readable.

## 4. Functional QA

- [ ] Hero "Request a Training Proposal" → `/contact` form loads.
- [ ] Hero "Book a 20-Minute Discovery Call" → Cal.com modal opens, iframe loads.
- [ ] BookingDialog "Open in new tab" fallback works.
- [ ] /contact form rejects `gmail.com` business emails (inline error).
- [ ] /contact form rejects invalid US phone format.
- [ ] /contact form happy path: submit → redirect to `/thanks` within 5s.
  - [ ] Resend prospect email arrives in inbox within 60s.
  - [ ] Resend internal email arrives at `training@sentinelinstitute.com`.
  - [ ] Slack `#new-leads` notification fires (with no failedSteps).
  - [ ] HubSpot contact record appears in CRM with all 13 fields populated.
- [ ] /contact rate limit: submit 6× from same IP → 6th returns 429 with "Try again in N seconds".
- [ ] /contact honeypot: programmatically set `hp_field=spam` and POST → silent 200, no email sent.
- [ ] /thanks renders correctly. Print preview shows white bg, black text, CTAs hidden.
- [ ] /studio loads, schema list visible. (Editor login required.)
- [ ] /api/revalidate: wrong secret → 401. Right secret → 200 and homepage updates.

## 5. Accessibility QA

- [ ] All forms keyboard-navigable Tab → Enter.
- [ ] All form errors announced by screen reader (VoiceOver / NVDA).
- [ ] All images have alt text (next/image rendered).
- [ ] Color contrast ≥ AA on all text (Lighthouse).
- [ ] `prefers-reduced-motion: reduce` disables Hero parallax + SentinelSystem timeline.

## 6. GA4 verification (DebugView)

Open GA4 → Configure → DebugView. Open the site in a Chrome with the GA Debug extension enabled (or set `?gtm_debug=true`). Walk:

- [ ] `page_view` fires on `/`, `/contact`, `/thanks`, `/studio`.
- [ ] `cta_click` fires on every CTA button + link click (label matches `data-cta`).
- [ ] `proposal_form_start` fires on first focus of the form.
- [ ] `proposal_form_submit` fires on successful submission.
- [ ] `scroll_depth` fires at 25 / 50 / 75 / 100% as the user scrolls the homepage.
- [ ] CCPA banner appears on first visit. Clicking Decline does NOT send subsequent events. Clicking Accept does.

## 7. Security final pass

Run https://securityheaders.com against the Vercel preview URL — score should be at least A.

- [ ] Content-Security-Policy present
- [ ] Strict-Transport-Security present
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy present
- [ ] No `X-Powered-By: Next.js`

Run `pnpm audit` — zero high/critical.

## 8. Performance final pass

Run Lighthouse against the Vercel preview URL (Performance preset, mobile + desktop):

- [ ] Performance ≥ 90
- [ ] Accessibility = 100
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Initial JS bundle ≤ 120 KB gzipped

## 9. Production cutover

- [ ] Custom domain (sentinelinstitute.com) attached in Vercel.
- [ ] DNS propagated (`dig sentinelinstitute.com A` returns Vercel IPs).
- [ ] SSL cert active (Vercel auto-issues).
- [ ] Sitemap + robots.txt accessible at https://sentinelinstitute.com/sitemap.xml and /robots.txt.
- [ ] OG image renders correctly in the LinkedIn Post Inspector.
- [ ] Marcus signs off on copy + visual.
- [ ] Final `git push origin pr-8-launch` and merge to `main`.
- [ ] Vercel promotes the preview to production.
