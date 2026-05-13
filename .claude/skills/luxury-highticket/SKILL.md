---
name: luxury-highticket
description: >
  Apply luxury, high-ticket website design patterns for premium products and services.
  Use this skill when building any website, page, component, or UI element
  for a high-ticket offer, premium service, executive-level audience, or luxury brand.
  Works alongside the official frontend-design skill to apply domain-specific luxury conventions.
  Triggers on: sales pages, landing pages, pricing sections, hero sections, testimonials,
  about pages, any component where "premium feel" or "high-ticket" context exists.
---

# Luxury High-Ticket Website Skill

This skill applies domain-specific luxury design and conversion principles on top of
the standard frontend-design aesthetic framework. The goal: every visitor must feel
the price before they see it.

## Core Principle

**Design communicates price.**

A high-ticket website does not look like a SaaS landing page. It does not use startup
conventions. It does not try to be accessible or democratic. It is designed for one
specific person — the qualified buyer — and it speaks exclusively to them.

If a page could be for anyone, it is for no one.

---

## Luxury Design Laws

### 1. Restraint Over Decoration
- Negative space is not empty — it is confident. Use it aggressively.
- Every element earns its place. If removing it changes nothing, remove it.
- One dominant typographic statement per section. Not three. One.
- Animation is used to reveal, not to entertain.

### 2. Typography Is the Brand
- Display font must be a strong serif or an unusual geometric — never system fonts.
- Body font must be highly readable at small sizes — elegant, not trendy.
- Type hierarchy must be dramatic: display headlines 2–4x larger than body.
- Line height on body: 1.6–1.8. On display: 0.9–1.1 for impact.
- Letter spacing on all-caps labels: 0.15–0.25em.
- Recommended display pairings for luxury context (choose based on WEBSITE_CONTEXT.md mood):
  - Editorial: Cormorant Garamond + DM Sans
  - Authority: Playfair Display + IBM Plex Sans
  - Modern Luxury: Freight Display + Neue Haas Grotesk (free alt: Outfit)
  - Understated Power: PP Editorial New (free alt: Libre Baskerville) + Inter (allowed here as body only)
  - Bespoke: Canela + Söhne (free alt: Lora + Plus Jakarta Sans)

### 3. Color Systems for High-Ticket
- Never use more than 3 colors in the primary palette: dominant, secondary, accent.
- Dominant should cover 70%+ of the page (deep neutral, near-black, or rich tone).
- Accent must be used sparingly — it signals value. Gold, champagne, electric blue,
  deep jade, or bone white are proven luxury signals.
- Common high-converting luxury palettes:
  - Near-black (#0D0D0D) + Champagne Gold (#C9A96E) + Ivory (#F5F0E8)
  - Deep Navy (#0A1628) + Silver (#B8BCC8) + White (#FAFAFA)
  - Forest (#1A2E1A) + Warm Cream (#F0EAD6) + Bronze (#8B6914)
  - Charcoal (#2C2C2C) + Blush (#E8C9BC) + Sand (#D4C5A9)

### 4. Photography & Visual Treatment
- If brand photos are provided: use them full-bleed, with subtle grain overlay.
- If no photos: use dramatic gradient backgrounds with geometric depth.
- Never use stock photo clichés (handshakes, people pointing at laptops, generic skylines).
- Apply CSS grain overlay to all hero sections:
  ```css
  .grain-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,..."); /* SVG noise pattern */
    opacity: 0.04;
    pointer-events: none;
  }
  ```

---

## Section-Specific Patterns

### Hero Section
- Headline: Maximum 8 words. No fluff. Outcome-focused or provocative question.
- Sub-headline: 1–2 sentences. Amplifies the headline. Specific, not vague.
- CTA: Single button. High contrast. No secondary option competing for attention.
- Social proof ticker: Press logos or "X clients served" — immediately below CTA.
- Animation: Headline word-by-word stagger reveal on load (Framer Motion).
- Never: Rotating carousels, generic stock heroes, countdown timers on hero.

### Pricing Section
- One offer. One price. No tiers unless genuinely differentiated.
- State the price clearly — hiding it signals lack of confidence.
- Anchor with ROI: "Your investment: £24,000. Typical client outcome: £180,000+ raised."
- Payment options presented as convenience, not accessibility.
- CTA below price: reinforce the outcome, not the price.

### Testimonials
- Never use star ratings for high-ticket — looks retail.
- Full name + title + company is mandatory. Initials only = no trust.
- Long-form quotes > short quotes. 3 sentences minimum.
- If video testimonials exist, show them. If not, use large portrait photo.
- Frame testimonials as case study results, not general praise:
  - ❌ "Working with them was amazing!"
  - ✅ "We closed our Series A in 11 weeks. The narrative framework they built was the difference."

### About / Founder Section
- Lead with credentials and results, not biography.
- One strong portrait — professional, not casual.
- Authority markers listed concisely (past roles, press, metrics).
- End with a human moment — makes premium brands trustworthy.

### FAQ Section
- Minimum 8 questions. Maximum 12.
- Address the elephant in the room: price, time commitment, risk.
- Last question should always address the guarantee/refund policy.
- Accordion pattern with smooth Framer Motion expand/collapse.

---

## Animation Patterns for Luxury

Apply these Framer Motion patterns consistently:

```typescript
// Standard reveal — use for most content blocks
const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

// Headline word stagger
const wordStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

// Luxury line reveal (text masked by sliding div)
const lineReveal = {
  hidden: { scaleX: 1, originX: 0 },
  visible: { scaleX: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } }
}

// Subtle parallax on scroll (GSAP free)
// Use gsap.to(element, { y: -30, scrollTrigger: { scrub: true } })
// Only for hero backgrounds and decorative elements
```

**Animation Rules:**
- Stagger delay between elements: 0.08s–0.12s (tight, not dramatic)
- Duration: 0.6s–0.9s. Never under 0.4s for luxury feel.
- Easing: Always custom cubic-bezier. Never `ease-in-out` default.
- `prefers-reduced-motion` respected via Framer Motion's `useReducedMotion()`

---

## Copy Conventions

This skill reinforces conversion copy patterns. Apply alongside conversion-engine skill.

**Headline formulas that convert at high-ticket:**
1. [Specific Outcome] Without [Common Sacrifice]: "Raise £5M Without Giving Up Your Board Seat"
2. [Bold Claim] for [Specific Person]: "The Advisory Firm Serious Founders Actually Use"
3. [Provocative Statement]: "Your Pitch Deck Isn't the Problem."
4. [Result] in [Timeframe]: "Series A Ready in 90 Days."

**Words that signal premium:**
- "Exclusive" / "By application only" / "Limited to X clients per quarter"
- "Bespoke" / "Tailored" / "Precision-built"
- "Elite" / "World-class" / "Best-in-class"
- "Architect" / "Engineer" / "Design" (as verbs)

**Words that erode premium positioning — never use:**
- "Affordable" / "Budget-friendly" / "Cost-effective"
- "Simple" / "Easy" / "Quick"
- "Journey" / "Transformation" / "Unlock"
- "Passionate about" / "Dedicated to" / "We believe in"

---

## Component Checklist

Before marking any section complete, verify:

- [ ] No generic fonts (Inter, Roboto, Arial as display)
- [ ] No purple gradients on white backgrounds
- [ ] No card grids that look like a SaaS dashboard
- [ ] No rounded avatars with star ratings for testimonials
- [ ] Typography hierarchy is dramatic (display vs. body contrast is strong)
- [ ] Primary CTA has highest visual weight on the page
- [ ] Grain or texture applied to at least 1 major section
- [ ] Negative space is generous — page breathes
- [ ] Animation is present but restrained
- [ ] Mobile version reviewed — luxury must translate to small screens
- [ ] Loading performance not sacrificed for aesthetics (see stack-config skill)
