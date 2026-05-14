# Sentinel Institute — Continuation Prompt (Post-`pr-8-launch`)

Paste the prompt below into a fresh Claude Code session opened in this project directory (`C:\Users\DELL\Documents\Antigravity\website-1`). Memory is fully populated for this project — the new session will recall the architecture, decisions, Next.js 16 quirks, a11y review checklist, and 8-PR history automatically.

---

## ▶ Prompt to paste

```
Sentinel Institute homepage build is complete. All 8 PRs are shipped and tagged locally — `pr-1-foundations` through `pr-8-launch`. Memory has the full project state; don't re-derive it. Pull only what you need.

Read these before doing anything else:
1. `docs/pre-launch-qa.md` — the 9-section launch runbook (env, Sanity seed, responsive, functional, a11y, GA4 DebugView, security headers, Lighthouse, Vercel cutover)
2. `git log --oneline -50` — see the 60+ commits across all 8 PRs
3. `git tag -l "pr-*"` — confirm all 8 tags exist locally

Build state to inherit (verify on a fresh `pnpm install && pnpm tsc --noEmit && pnpm lint && pnpm build`):
- All 9 routes build clean: /, /contact, /thanks, /studio/[[...tool]], /api/proposal, /api/revalidate, /robots.txt, /sitemap.xml, /_not-found
- `pnpm audit` zero high/critical
- All 6 SECURITY.md headers in `next.config.ts` (CSP, HSTS, XFO, XCTO, Referrer, Permissions)
- Honeypot + Upstash rate limiter (5/min/IP) on /api/proposal
- CCPA Consent Mode v2 default-deny + dismissable banner; GA4 mounted via @next/third-parties
- JSON-LD Organization schema on homepage
- Lighthouse CI config at `lighthouserc.json` + workflow at `.github/workflows/lighthouse.yml`

Outstanding operational work (not codeable from this session — needs the user):
1. Push to GitHub: project is on local `main` with no remote. `git remote add origin ...` + `git push -u origin main` + `git push --tags`.
2. Wire Vercel env vars per `docs/pre-launch-qa.md §1` (15 keys, especially KV_REST_API_URL/TOKEN for rate limiting + SANITY_REVALIDATE_SECRET for the webhook).
3. Seed Sanity content per `docs/seed-data-pr4.md` (8 doc types — companyStats singleton, 3 programs, 6 industries, ≥4 featured FAQs, ≥3 featured testimonials, ≥1 featured caseStudy, ≥3 hero press mentions, 8 clientLogos).
4. Configure the Sanity webhook in dashboard → POST to `https://sentinelinstitute.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`.
5. Add production + preview domains to Sanity CORS origins (Sanity dashboard → API).
6. Deploy Sanity Studio: `pnpm dlx sanity deploy` OR rely on the embedded `/studio` route on Vercel.
7. Run https://securityheaders.com against the Vercel preview URL — expect A or A+.
8. Run Lighthouse against the preview URL — Performance ≥ 90, Accessibility = 100, LCP < 2.5s, CLS < 0.1, INP < 200ms.
9. Verify GA4 events in DebugView per `docs/pre-launch-qa.md §6`.

Phase 2 work that's tracked but out of the original 8-PR scope:
- Stripe webhook handler for `invoice.paid` → onboarding email + Slack
- `/programs/{slug}`, `/results/{slug}`, `/industries/{slug}` detail pages (homepage links to them but they 404 today)
- Course JSON-LD schema on program pages + BreadcrumbList on inner pages
- Cal.com `discovery_call_booked` `postMessage` listener for the GA4 event
- Client portal (post-contract student access)
- Draft `product-marketing-context.md` from WEBSITE_CONTEXT.md §4

Don't pause to ask "should I continue?" The user uses single-letter approvals and prefers subagent dispatch with two-stage review on complex tasks. The `.env` file has a real `NEXT_PUBLIC_SANITY_PROJECT_ID` (8 chars) + `SANITY_API_TOKEN` (180 chars) — `.env.local` may still have empty overrides; if so, either delete those lines or move the values to `.env.local`. `.gitignore` covers `.env*`; never commit secrets.

Start by: reading `docs/pre-launch-qa.md`, running the three pnpm verification commands to inherit a known-good build state, then ask the user which of these tracks they want to drive:
  (a) ship to production — walk pre-launch-qa.md with them, draft any deploy scripts/Vercel config needed, then verify post-deploy
  (b) start Phase 2 — pick a deliverable (Stripe webhook is the most-bounded; program detail pages need a new design brainstorm)
  (c) polish — close out the small known gaps (BookingDialog GA4 postMessage hook, Course schema for the 3 programs even without detail pages yet, log error in ProposalForm catch block)

Use the writing-plans skill before any new build work, executed via subagent-driven-development per the established pattern.
```

---

## Why this prompt works

- **Skips redundant reading.** Memory already contains the collaboration style, stack deltas, shadcn bridge, motion SSR pattern, subagent usage notes, Next.js 16 quirks, form a11y checklist, and project state. The new session loads them automatically.
- **States the build is done** with the exact tag (`pr-8-launch`) and the route count (9), so the new session doesn't waste cycles wondering what's shipped.
- **Names the runbook.** `docs/pre-launch-qa.md` is the single source of truth for operational launch work — 9 numbered sections, ~80 manual checkboxes.
- **Lists user-side prereqs explicitly.** The new session won't try to push to a remote that doesn't exist or wire env vars from the agent side — those are user actions.
- **Offers three clear tracks.** Ship / Phase 2 / polish. The user picks; the session doesn't guess.
- **Preserves the autonomous-execution posture.** The original session ran 8 PRs end-to-end via subagent-driven dispatch with two-stage review. The prompt reiterates this so the new session matches the operating mode.

## Alternative — minimum-friction one-liner

If you just want to keep moving in a new context window without ceremony:

```
Read prompt.md and execute.
```

The new session will read this file, see the embedded full prompt, and execute it. Same result, one line of input.

---

## Quick-reference table of plan files (for the new session)

| PR | Plan | Tag |
|---|---|---|
| 4 | `docs/superpowers/plans/2026-05-14-sentinel-homepage-pr4-sanity.md` | `pr-4-sanity-foundations` |
| 5 | `docs/superpowers/plans/2026-05-14-sentinel-homepage-pr5-sections.md` | `pr-5-sections` |
| 6 | `docs/superpowers/plans/2026-05-14-sentinel-homepage-pr6-proposal.md` | `pr-6-proposal` |
| 7 | `docs/superpowers/plans/2026-05-14-sentinel-homepage-pr7-cta-faq-booking.md` | `pr-7-cta-faq-booking` |
| 8 | `docs/superpowers/plans/2026-05-14-sentinel-homepage-pr8-launch.md` | `pr-8-launch` |

(PR 1–3 plans are at `docs/superpowers/plans/2026-05-13-sentinel-homepage-pr{1,2,3}-*.md`.)

## Spec + reference docs (unchanged across the build)

- `docs/superpowers/specs/2026-05-13-sentinel-homepage-design.md` — the canonical brainstorm output
- `docs/CONVENTIONS.md` — button systems + token reference rules
- `docs/seed-data-pr4.md` — editorial seed checklist for Marcus
- `STACK_CORRECTIONS.md` — Tailwind v4 deltas (no `tailwind.config.ts`, tokens in `globals.css @theme`)
- `SECURITY.md` — security checklist (walked in PR 6 + PR 8)
- `WEBSITE_CONTEXT.md` — brand brief
