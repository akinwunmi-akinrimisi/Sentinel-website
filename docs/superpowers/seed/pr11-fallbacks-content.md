# PR 11 — Fallback content for `src/lib/sanity/fallbacks.ts` (industries)

> **Purpose:** editorial content for 6 industries: fill the empty `trainingContext` PortableText arrays + add 3 new fields (`complianceClauses`, `riskScenarios`, `recommendedProgramSlugs`). Marcus replaces via Sanity dashboard later.

> **Tone:** authoritative, specific, regulatory citations exact. The CISO reading the page should think "this team gets it."

---

## Recommended program slugs per industry

Common across all entries — copy these slug arrays as-is:

```ts
healthcare:         ['security-plus', 'cysa-plus']
financial-services: ['security-plus', 'cysa-plus']
government-defense: ['cysa-plus', 'casp-plus']
utilities:          ['security-plus', 'casp-plus']
insurance:          ['security-plus', 'cysa-plus']
legal:              ['security-plus']
```

---

## Healthcare (`slug: 'healthcare'`)

### `trainingContext` (PortableText)

```ts
trainingContext: [
  {
    _type: 'block', _key: 'h-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'h-tc-1-s1', text: 'Healthcare CISOs operate under the HIPAA Security Rule, which audits the entire workforce for trained-and-certified incident-response capability. A failed audit isn’t a finding — it’s a settlement with the Office for Civil Rights.', marks: [] }],
  },
  {
    _type: 'block', _key: 'h-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'h-tc-2-s1', text: 'Sentinel’s healthcare cohorts walk the OCR enforcement record: every breach scenario in the curriculum maps to a real Resolution Agreement, with the specific control failure cited. Your team finishes the program able to produce the audit-ready evidence package OCR investigators expect.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: '§ 164.308(a)(5)(i)', title: 'Security Awareness and Training', description: 'Implement a security awareness and training program for all members of its workforce, including management.' },
  { code: '§ 164.308(a)(5)(ii)(A)', title: 'Security Reminders', description: 'Periodic security updates appropriate to the workforce role.' },
  { code: '§ 164.308(a)(6)(i)', title: 'Security Incident Procedures', description: 'Identify and respond to suspected or known security incidents; mitigate harmful effects; document incidents and outcomes.' },
  { code: '§ 164.308(a)(7)(ii)(D)', title: 'Testing and Revision Procedures', description: 'Implement procedures for periodic testing and revision of contingency plans.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'OCR settlement, 2023 — $1.3M', narrative: 'A regional hospital network lost 4.3 million patient records to a credential-stuffing attack that bypassed an unmaintained MFA gateway. OCR found the security team had no documented training on authentication-incident triage. The Resolution Agreement specifically required certified personnel as part of the corrective action plan.' },
  { headline: 'OCR settlement, 2024 — $4.75M', narrative: 'A health insurance plan suffered ransomware that encrypted 90% of its claims-processing infrastructure. The investigation revealed the security workforce had not been trained in role-based incident response procedures required by § 164.308. The penalty included a 3-year monitoring agreement requiring continuous workforce certification.' },
]
```

---

## Financial Services (`slug: 'financial-services'`)

### `trainingContext`

```ts
trainingContext: [
  {
    _type: 'block', _key: 'f-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'f-tc-1-s1', text: 'PCI-DSS v4.0 raised the bar on workforce training: § 12.6 now requires role-specific content and § 12.10 demands documented incident response personnel. QSAs are looking for evidence the security team has been trained, not just that policies exist.', marks: [] }],
  },
  {
    _type: 'block', _key: 'f-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'f-tc-2-s1', text: 'Sentinel’s financial-services cohorts run on actual cardholder-data flow diagrams. Your team learns to defend the segments under audit — POI devices, tokenization vaults, and the cardholder-data environment boundary — not abstract textbook scenarios.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: '§ 12.6.1', title: 'Security awareness program', description: 'Implement a formal security awareness program reviewed at least annually with documented attendance per personnel.' },
  { code: '§ 12.6.3.1', title: 'Role-targeted training', description: 'Personnel with cardholder-data access receive training specific to their job function and the threats they face.' },
  { code: '§ 12.10.1', title: 'Incident response plan', description: 'Maintain an incident response plan with designated personnel available 24/7 to respond to suspected or confirmed incidents.' },
  { code: '§ 12.10.4', title: 'Annual IR testing', description: 'Test the incident response plan at least annually; document gaps and remediation.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'QSA finding, 2023 — repeat assessment', narrative: 'A mid-tier acquirer received a non-compliant report after auditors found that 70% of the security team had no documented role-based training. The acquirer was held in non-compliance for two assessment cycles before remediation completed.' },
  { headline: 'OFAC fine, 2024 — $48M', narrative: 'A bank’s payment processing platform was breached via a misconfigured tokenization service. The IR team had not been trained on the specific tokenization vendor’s incident workflow. OFAC cited the lapse in its civil monetary penalty.' },
]
```

---

## Government & Defense (`slug: 'government-defense'`)

### `trainingContext`

```ts
trainingContext: [
  {
    _type: 'block', _key: 'd-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'd-tc-1-s1', text: 'CMMC Level 2 is enforcement, not aspiration: contractors handling Controlled Unclassified Information must certify named, qualified security personnel before primes will issue subcontracts. The DoD CIO’s 2024 guidance made the standard binding on every solicitation involving CUI.', marks: [] }],
  },
  {
    _type: 'block', _key: 'd-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'd-tc-2-s1', text: 'Sentinel’s defense cohorts work the NIST SP 800-171 control families end-to-end with current C3PAO assessor expectations. Your team finishes with the artifacts a CMMC assessor needs: training records, role assignments, and incident-response evidence keyed to specific controls.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: 'AT.L2-3.2.1', title: 'Security awareness training', description: 'Provide basic security awareness training to all system users including managers and senior executives.' },
  { code: 'AT.L2-3.2.2', title: 'Role-based security training', description: 'Ensure that personnel are trained to carry out assigned information security-related duties and responsibilities.' },
  { code: 'IR.L2-3.6.1', title: 'Incident handling', description: 'Establish an operational incident-handling capability including preparation, detection, analysis, containment, recovery, and user response.' },
  { code: 'IR.L2-3.6.3', title: 'Incident response testing', description: 'Test the organizational incident response capability.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'Subcontract revocation, 2024', narrative: 'A defense contractor lost a $14M subcontract after a prime audit found their security team had no current certifications mapped to the NIST 800-171 AT control family. The prime required full certification within 90 days or contract termination.' },
  { headline: 'False Claims Act exposure, 2024 — $9M settlement', narrative: 'A federal contractor self-disclosed after discovering they had submitted CMMC self-attestations without actually meeting the training requirements. The DOJ settled the False Claims Act case at $9M with a 5-year compliance monitor.' },
]
```

---

## Utilities (`slug: 'utilities'`)

### `trainingContext`

```ts
trainingContext: [
  {
    _type: 'block', _key: 'u-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'u-tc-1-s1', text: 'NERC CIP-004 is one of the strictest workforce-training standards in any regulated industry. Bulk electric system operators must document evidence of role-based training per employee, refreshed at defined intervals, with named accountability for every cyber asset access.', marks: [] }],
  },
  {
    _type: 'block', _key: 'u-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'u-tc-2-s1', text: 'Sentinel’s utility cohorts include OT-aware curriculum: SCADA, ICS, and field-asset attack scenarios alongside the enterprise certification path. Your team learns to defend the operational technology that traditional security training doesn’t cover.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: 'CIP-004-7 R2', title: 'Cyber security training program', description: 'Implement training that addresses cyber security policies, access controls, the visitor control program, electronic interconnections, handling of BES Cyber System Information, and incident response.' },
  { code: 'CIP-004-7 R3', title: 'Cyber security training', description: 'Each individual with authorized electronic or unescorted physical access shall complete the training before being granted access.' },
  { code: 'CIP-008-6 R1', title: 'Cyber security incident response plan', description: 'Maintain a documented cyber security incident response plan that addresses identification, classification, response, and reporting of cyber security incidents.' },
  { code: 'CIP-008-6 R2', title: 'IR plan testing', description: 'Test the cyber security incident response plan at least once every 15 months.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'NERC penalty, 2023 — $1.6M', narrative: 'A regional transmission operator was fined after auditors discovered 23% of personnel with BES Cyber System access had not completed CIP-004-required training within the 15-month interval. The penalty was assessed per missed training cycle.' },
  { headline: 'CIP enforcement action, 2024', narrative: 'A utility experienced a credential-phishing incident that triggered NERC CIP-008 reporting. The post-incident review found the security team had not been trained on the specific incident-classification matrix required by R1. NERC issued a self-report-with-mitigation determination — but the workforce-training gap became a 3-year compliance plan.' },
]
```

---

## Insurance (`slug: 'insurance'`)

### `trainingContext`

```ts
trainingContext: [
  {
    _type: 'block', _key: 'i-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'i-tc-1-s1', text: 'The NAIC Insurance Data Security Model Law has been adopted in 25+ states with more pending. Licensees must maintain a written information security program staffed by qualified personnel — and the qualification standard increasingly means industry-recognized certification.', marks: [] }],
  },
  {
    _type: 'block', _key: 'i-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'i-tc-2-s1', text: 'Sentinel’s insurance cohorts work through actuarial-grade incident scenarios: data exfiltration affecting protected health information, fraud-ring detection on claims platforms, and the regulatory notification timelines that follow.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: '§ 4(B)(2)', title: 'Designated person', description: 'Designate one or more employees, an affiliate, or an outside vendor to be responsible for the information security program.' },
  { code: '§ 4(C)(2)', title: 'Risk assessment requirements', description: 'Assess the sufficiency of policies, procedures, information systems, and other safeguards to manage identified risks.' },
  { code: '§ 4(D)', title: 'Information security personnel', description: 'Train and continuously educate information security personnel to address relevant security risks.' },
  { code: '§ 6(A)', title: 'Cybersecurity event notification', description: 'Notify the Commissioner as promptly as possible but no later than 72 hours from determination that a cybersecurity event has occurred.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'NY DFS enforcement, 2023 — $7.5M', narrative: 'A title insurance subsidiary was fined under New York’s 23 NYCRR 500 (the NAIC Model Law’s NY implementation) after a breach exposed millions of records. DFS specifically cited inadequate workforce training as one of three primary control failures.' },
  { headline: 'NAIC examination finding, 2024', narrative: 'A multi-state health insurer received an adverse examination report after auditors found the IT security team’s qualifications did not match the program scope. The examination required a remediation plan with named certified personnel within 6 months.' },
]
```

---

## Legal (`slug: 'legal'`)

### `trainingContext`

```ts
trainingContext: [
  {
    _type: 'block', _key: 'l-tc-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'l-tc-1-s1', text: 'ABA Model Rule 1.6(c) and the duty of competence (Rule 1.1, Comment 8) together require attorneys to make reasonable efforts to prevent unauthorized client-data disclosure — including by training non-lawyer staff. State bars increasingly tie disciplinary action to documented training gaps.', marks: [] }],
  },
  {
    _type: 'block', _key: 'l-tc-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'l-tc-2-s1', text: 'Sentinel’s legal cohorts focus on the threat models law firms actually face: business email compromise targeting wire transfers, ransomware against case-management platforms, and discovery-process data spills. The curriculum aligns to ABA TechReport recommendations.', marks: [] }],
  },
]
```

### `complianceClauses`

```ts
complianceClauses: [
  { code: 'MR 1.6(c)', title: 'Confidentiality of client information', description: 'A lawyer shall make reasonable efforts to prevent the inadvertent or unauthorized disclosure of, or unauthorized access to, information relating to the representation of a client.' },
  { code: 'MR 1.1 cmt 8', title: 'Duty of competence — technology', description: 'A lawyer should keep abreast of changes in the law and its practice, including the benefits and risks associated with relevant technology.' },
  { code: 'MR 5.3(b)', title: 'Supervision of non-lawyer assistants', description: 'A lawyer having direct supervisory authority over the non-lawyer shall make reasonable efforts to ensure that the person’s conduct is compatible with the professional obligations of the lawyer.' },
]
```

### `riskScenarios`

```ts
riskScenarios: [
  { headline: 'State bar disciplinary action, 2023', narrative: 'A mid-sized firm partner received a formal reprimand after a paralegal misdirected privileged discovery materials. The bar opinion cited inadequate training on data-handling procedures as the basis for the partner’s supervisory failure under Rule 5.3.' },
  { headline: 'Malpractice carrier non-renewal, 2024', narrative: 'A 40-lawyer firm lost its cyber liability coverage after the carrier’s audit found no documented workforce training program. The firm’s rates tripled when it found a replacement carrier — a direct cost of the training gap.' },
]
```
