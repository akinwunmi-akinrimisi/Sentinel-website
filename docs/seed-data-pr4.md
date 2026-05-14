# Sentinel Institute — Editorial Seed Checklist (PR 4 deliverable)

This is the list of documents Marcus + editorial seed in Sanity Studio
(http://localhost:3000/studio in dev, or production studio URL) after PR 4
ships. Until these are seeded, the homepage falls back to constants in
`src/lib/sanity/fallbacks.ts` and visitors see the PR 3 hardcoded numbers.

Order matters for documents with references — seed in this order.

## 1. Company Stats (singleton — exactly 1 doc)

Sidebar → **Company Stats**. Fill every field; `asOfDate` is today.

- passRate · 96
- professionalsCertified · 410
- enterpriseClients · 63
- auditsPassed · 38
- averageWeeks · 9
- availableSlots · 12  (update weekly)
- passRateSecurityPlus · 97
- passRateCySAPlus · 95
- passRateCASPPlus · 94
- avgWeeksSecurityPlus · 8
- avgWeeksCySAPlus · 10
- avgWeeksCASPPlus · 12

## 2. Press Mentions (≥ 3 with showOnHero = true)

Sidebar → **Press mention** → New. Create at least these three (Marcus
provides article URLs):

- SC Magazine — showOnHero true, order 0
- Dark Reading — showOnHero true, order 1
- CyberScoop — showOnHero true, order 2

For each: outlet name, article title, HTTPS URL, published date, logo upload
(prefer SVG ≤ 50 KB), alt text required.

## 3. Client Logos (8 industry-text entries minimum)

Sidebar → **Client logo** → New. Use `displayAs: industry-text` for every
anonymized client. Eight to seed for the trust bar:

1. Regional Bank, Midwest
2. Health System, Northeast
3. Defense Contractor, Mid-Atlantic
4. Insurance Carrier, Southeast
5. Utility, Pacific Northwest
6. Law Firm, AmLaw 200
7. Pharmaceutical, Top 25
8. Financial Services, Big Four

Each row: companyName (internal — actual client name), anonymizedAs (the
public string above), displayAs = industry-text, order (0–7).

## 4. Programs (exactly 3 docs — Security+, CySA+, CASP+)

Sidebar → **Program page** → New, three times. Slugs must be exactly
`security-plus`, `cysa-plus`, `casp-plus`.

- Security+ — homepageOrder 0, copy from `WEBSITE_CONTEXT.md` §4
- CySA+    — homepageOrder 1
- CASP+    — homepageOrder 2

Each: certName, eyebrow, one-liner, priceUSD, durationWeeks, sessionsPerWeek,
Portable Text "whoNeedsIt", Portable Text "curriculumOutline", string array
"examObjectives", SEO title (≤ 70 ch), SEO description (≤ 160 ch).

## 5. Industries (6 docs — first cohort)

Sidebar → **Industry page** → New. Six to seed for the homepage:

1. Healthcare — HIPAA Security Rule § 164.308
2. Financial Services — PCI-DSS v4.0 §§ 12.6 and 12.10
3. Defense Contractors — CMMC Level 2 / NIST SP 800-171
4. Utilities — NERC CIP-004 Personnel Training
5. Insurance — NAIC Cybersecurity Insurance Data Security Model Law §§ 4 and 6
6. Legal — ABA Model Rules of Professional Conduct 1.6(c)

Each: industryName, complianceMandate (short citation), complianceMandateFull
(2–3 sentences), trainingContext (Portable Text), homepageOrder (0–5),
SEO title, SEO description. featuredCaseStudy reference is optional — link
once case studies are seeded in step 7.

## 6. FAQs (≥ 4 with featured = true)

Sidebar → **Faq** → New. Seed at least four with `featured: true` for the
homepage preview. Categories: general / programs / pricing / logistics /
compliance.

## 7. Testimonials (≥ 3 with featured = true)

Sidebar → **Testimonial** → New. Seed at least three with `featured: true`,
each with portrait image, alt text, ≤ 5-line quote, industryAnonymized if
the client requires it. Order 0–2.

## 8. Case Studies (≥ 1 with featured = true)

Sidebar → **Case study** → New. Seed at least one with `featured: true`
matching one of the seeded industries.

---

## After seeding

1. Hit `POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>` with body
   `{"_type":"companyStats"}` — refreshes the homepage immediately.
2. Or configure the Sanity webhook (Manage → API → Webhooks):
   - URL: `https://sentinelinstitute.com/api/revalidate?secret=<secret>`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["companyStats","testimonial","caseStudy","programPage","industryPage","faq","pressMention","clientLogo"]`
   - HTTP method: POST
   - Payload: select "Document"

The homepage will now reflect Sanity content; fallbacks only fire if Sanity
becomes unreachable.
