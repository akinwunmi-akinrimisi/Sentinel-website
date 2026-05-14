# PR 12 — Fallback content for `src/lib/sanity/fallbacks.ts` (case study)

> **Purpose:** fill the empty `challenge`/`solution`/`outcome` PortableText arrays in `FALLBACK_CASE_STUDY` + add 2 new fields (`timeline`, `roi`) introduced in PR 12. Marcus replaces via Sanity dashboard later.

> **Tone:** declassified-style incident narrative. Specific compliance citation. Numbers tied to outcomes.

> **Case study context:** Healthcare CISO at a Northeast hospital network, 18-person security team, 9 weeks, passed Security+ + CySA+. Started after an OCR audit finding on workforce training.

---

## `challenge` (PortableText)

```ts
challenge: [
  {
    _type: 'block', _key: 'cs-ch-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ch-1-s1', text: 'In Q4 2025, an OCR-initiated compliance review flagged the network’s security operations team for HIPAA § 164.308(a)(5) workforce training gaps. The finding gave the CISO 90 days to demonstrate documented, role-based training for every member with electronic PHI access — or face a formal Resolution Agreement that would have followed a similar pattern to the $4.75M settlement against a peer institution earlier that year.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-ch-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ch-2-s1', text: 'Existing workforce evidence consisted of generic security-awareness videos with completion records. None mapped to specific Security Rule clauses. None demonstrated incident-response capability under audit scrutiny. The team had no formal certification path, no cohort accountability, and no documented training designed for the role definitions OCR investigators inspect.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-ch-3', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ch-3-s1', text: 'The CISO needed: industry-recognized certifications mapped to OCR’s expected control families, a documented first-attempt pass rate, and an evidence package the OCR response team could submit without re-mediation rounds.', marks: [] }],
  },
]
```

## `solution` (PortableText)

```ts
solution: [
  {
    _type: 'block', _key: 'cs-so-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-so-1-s1', text: 'Sentinel deployed a custom two-track cohort: 12 personnel on Security+ (foundational), 6 personnel on CySA+ (detection engineering + incident response). Live instruction ran 3 sessions per week for 9 weeks. Every module ended with a HIPAA-mapped artifact — incident response runbook entries, control-family attestations, and tabletop debriefs — added to the audit response evidence package as it was being assembled.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-so-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-so-2-s1', text: 'Two Sentinel instructors paired with the in-house security director to design the working sessions around the OCR finding’s specific deficiencies: weekly authentication-incident triage, monthly evidence-preservation tabletops, and a documented chain-of-custody workflow keyed to the audit response.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-so-3', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-so-3-s1', text: 'Sentinel’s no-pass, re-train guarantee was named in the contract. The CISO presented the contract to the OCR response team as evidence of the remediation commitment alongside the training plan itself.', marks: [] }],
  },
]
```

## `outcome` (PortableText)

```ts
outcome: [
  {
    _type: 'block', _key: 'cs-ou-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ou-1-s1', text: '17 of 18 personnel passed their target certification on the first attempt (94%). The one re-take cohort member passed at the next sitting at no additional cost under Sentinel’s guarantee. Total elapsed time from contract signature to last certification: 9 weeks.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-ou-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ou-2-s1', text: 'The OCR response submission included the certification roster, the audit-mapped training artifacts, and the Sentinel contract. OCR closed the corrective action plan without escalation to a Resolution Agreement. The CISO received an internal commendation from the General Counsel’s office for converting a worst-case enforcement pathway into a documented organizational capability.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-ou-3', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-ou-3-s1', text: 'The cohort continues as a quarterly refresh: tabletop exercises and re-attestations run by the same in-house director with Sentinel methodology. The 0-audit-findings outcome has held through two subsequent surveillance reviews.', marks: [] }],
  },
]
```

## `timeline` (new schema field)

```ts
timeline: [
  { date: '2025-11', headline: 'OCR finding issued', description: 'HIPAA § 164.308(a)(5) workforce training deficiency cited; 90-day remediation window starts.' },
  { date: '2025-12', headline: 'Sentinel contract signed', description: 'Two-track cohort designed around the specific deficiencies in the OCR finding; first cohort week scheduled.' },
  { date: '2026-01', headline: 'Cohort midpoint check-in', description: 'Practice exam results confirm pass-readiness across both tracks; OCR response team briefed on training progress.' },
  { date: '2026-02', headline: 'Final certifications passed', description: '17 of 18 personnel certified on first attempt; the remaining team member re-trains at no cost under guarantee.' },
  { date: '2026-03', headline: 'OCR closes corrective action', description: 'OCR accepts the response package without escalation. Cohort transitions to quarterly refresh cadence.' },
]
```

## `roi` (new schema field)

```ts
roi: 'Avoided a Resolution Agreement pathway with a probable settlement range of $1.5M–$4.5M (based on 2023–2024 OCR enforcement precedent for comparable findings). Total Sentinel program cost: under $80K. Net risk-adjusted ROI: 18×–55× depending on settlement multiplier assumed.'
```
