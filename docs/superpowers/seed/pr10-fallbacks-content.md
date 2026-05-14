# PR 10 — Fallback content for `src/lib/sanity/fallbacks.ts`

> **Purpose:** editorial content for the 3 new `programPage` fields (`outcomes`, `sampleLesson`, `comparisonSelfStudy`) plus the previously-empty `curriculumOutline`, for all 3 programs. Used by `fallbacks.ts` so the detail pages render polished content even before Marcus seeds Sanity. Marcus replaces these with real content via the Sanity dashboard.

> **Tone:** authoritative, specific, no marketing fluff. Reference real CVEs, real compliance citations, real attack patterns. Sentinel's voice: senior security practitioners writing for senior security practitioners.

---

## Common values (used in all 3 programs)

### `comparisonSelfStudy` rows

The rows are identical across all 3 programs because the Sentinel methodology is uniform — only the certification name changes. Use this exact array for all 3:

```ts
const SENTINEL_VS_SELF_STUDY: ComparisonRow[] = [
  {
    category: 'Schedule',
    sentinel: 'Live instructor-led cohort, 2–3 sessions per week, fixed start dates',
    selfStudy: 'Self-paced — completion timing on the learner, no fixed milestones',
  },
  {
    category: 'Live instruction',
    sentinel: 'Working sessions on real declassified breach scenarios with senior instructors',
    selfStudy: 'Video recordings and PDF study guides only — no live interaction',
  },
  {
    category: 'Practice incidents',
    sentinel: '12 end-to-end incident scenarios worked in pairs across the cohort',
    selfStudy: 'Multiple-choice exam prep questions only — no scenario work',
  },
  {
    category: 'Pass guarantee',
    sentinel: 'No-pass, re-train at no cost — built into every enterprise contract',
    selfStudy: 'None — re-take fees are the learner’s responsibility',
  },
  {
    category: 'Compliance documentation',
    sentinel: 'Audit-ready training records + certificate package signed by Sentinel',
    selfStudy: 'Pearson VUE certificate copy only — no training audit trail',
  },
  {
    category: 'Cohort cap',
    sentinel: '12 learners maximum per cohort — instructor knows every team',
    selfStudy: 'N/A — individual study, no cohort',
  },
]
```

---

## Security+ (`slug: 'security-plus'`)

### `outcomes`

```ts
outcomes: [
  'Implement core security controls (authentication, encryption, access management) without escalating to senior staff',
  'Triage common incident types (phishing, credential abuse, malware) against documented playbooks',
  'Produce audit-ready evidence for HIPAA, PCI-DSS, and SOC 2 control families',
  'Run vulnerability scans, interpret CVSS scores, and prioritize remediation against business risk',
  'Build risk registers and present findings to non-technical stakeholders',
]
```

### `curriculumOutline` (PortableText blocks — fills the currently empty array)

3 blocks: overview paragraph + bulleted module list.

```ts
curriculumOutline: [
  {
    _type: 'block',
    _key: 'sp-c-1',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: 'sp-c-1-s1',
        text: 'Eight weeks covering CompTIA Security+ (SY0-701) exam objectives with daily working sessions on real declassified breach scenarios. Every module ends with an audit-style evidence package the learner can show their compliance lead.',
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: 'sp-c-2',
    style: 'h3',
    markDefs: [],
    children: [
      { _type: 'span', _key: 'sp-c-2-s1', text: 'Module sequence', marks: [] },
    ],
  },
  {
    _type: 'block', _key: 'sp-c-3', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'sp-c-3-s1', text: 'Weeks 1–2 · Threats, attacks, and vulnerabilities (28% of exam)', marks: [] }],
  },
  {
    _type: 'block', _key: 'sp-c-4', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'sp-c-4-s1', text: 'Weeks 3–4 · Architecture and design (20% of exam)', marks: [] }],
  },
  {
    _type: 'block', _key: 'sp-c-5', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'sp-c-5-s1', text: 'Weeks 5–6 · Implementation: identity, cryptography, controls (25% of exam)', marks: [] }],
  },
  {
    _type: 'block', _key: 'sp-c-6', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'sp-c-6-s1', text: 'Weeks 7–8 · Operations and incident response + exam prep (27% of exam)', marks: [] }],
  },
]
```

### `sampleLesson`

```ts
sampleLesson: [
  {
    _type: 'block',
    _key: 'sp-l-1',
    style: 'h3',
    markDefs: [],
    children: [
      { _type: 'span', _key: 'sp-l-1-s1', text: 'Week 3 · Credential-stuffing forensics', marks: [] },
    ],
  },
  {
    _type: 'block',
    _key: 'sp-l-2',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: 'sp-l-2-s1',
        text: 'We move from theory to forensics. You triage a real PCAP from a credential-stuffing campaign against a regional healthcare provider — the same attack pattern behind the 2024 OCR settlement. Working in pairs, your team identifies failed authentication patterns, correlates them with successful logins from anomalous geographies, and traces lateral movement through the Active Directory audit trail.',
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: 'sp-l-3',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: 'sp-l-3-s1',
        text: 'By end of session, every learner can extract authentication events with Splunk SPL, write a Sigma rule that would have caught the campaign at the 5th failed attempt, and articulate the HIPAA Security Rule violation the breach exposed.',
        marks: [],
      },
    ],
  },
]
```

---

## CySA+ (`slug: 'cysa-plus'`)

### `outcomes`

```ts
outcomes: [
  'Design SIEM detection rules from MITRE ATT&CK techniques across Splunk, Sentinel, and Elastic',
  'Lead containment and eradication during active incidents with documented chain of custody',
  'Hunt for indicators of compromise across endpoint, network, and identity telemetry',
  'Produce incident reports that satisfy CISO, legal, and regulatory disclosure requirements',
  'Tune false-positive rates without sacrificing detection coverage',
]
```

### `curriculumOutline`

```ts
curriculumOutline: [
  {
    _type: 'block', _key: 'cs-c-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-c-1-s1', text: 'Ten weeks covering CompTIA CySA+ (CS0-003) for analysts moving into detection engineering and incident response leadership. Every module includes a live SOC simulation where the cohort defends against an attacker scenario.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-c-2', style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-c-2-s1', text: 'Module sequence', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-c-3', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cs-c-3-s1', text: 'Weeks 1–3 · Threat management, intelligence sources, and MITRE ATT&CK mapping (20%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-c-4', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cs-c-4-s1', text: 'Weeks 4–5 · Vulnerability management lifecycle and prioritization (18%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-c-5', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cs-c-5-s1', text: 'Weeks 6–8 · Cyber incident response: containment, eradication, evidence handling (33%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-c-6', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cs-c-6-s1', text: 'Weeks 9–10 · Security architecture and tool optimization + exam prep (29%)', marks: [] }],
  },
]
```

### `sampleLesson`

```ts
sampleLesson: [
  {
    _type: 'block', _key: 'cs-l-1', style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-l-1-s1', text: 'Week 7 · Detection rule engineering against a real ransomware playbook', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-l-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-l-2-s1', text: 'We take the LockBit 3.0 affiliate playbook (declassified after the 2023 FBI takedown) and walk every TTP through your SIEM. Your team builds the detection ladder: encrypted volume creation, vssadmin shadow-copy deletion, lateral movement via WMI, and command-and-control beaconing patterns.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cs-l-3', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cs-l-3-s1', text: 'By end of session, every learner has authored three production-ready Sigma rules with documented false-positive thresholds, written an incident-response playbook entry for the affiliate group, and presented their detection logic to the cohort as if briefing a CISO.', marks: [] }],
  },
]
```

---

## CASP+ (`slug: 'casp-plus'`)

### `outcomes`

```ts
outcomes: [
  'Architect enterprise-grade controls that map to NIST CSF and ISO 27001 control objectives',
  'Lead risk-acceptance conversations with executive stakeholders using quantified impact framing',
  'Design secure cloud, hybrid, and on-premise topologies under regulatory constraints',
  'Build vendor-risk assessment programs that scale across hundreds of third parties',
  'Translate compliance mandates (CMMC, FedRAMP, SOX) into engineering requirements',
]
```

### `curriculumOutline`

```ts
curriculumOutline: [
  {
    _type: 'block', _key: 'cp-c-1', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cp-c-1-s1', text: 'Twelve weeks covering CompTIA CASP+ (CAS-004) for senior practitioners moving into security architecture and engineering leadership. Every module ends with an architectural design review against a real enterprise constraint set.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-c-2', style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 'cp-c-2-s1', text: 'Module sequence', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-c-3', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cp-c-3-s1', text: 'Weeks 1–3 · Risk management, governance, and compliance frameworks (22%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-c-4', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cp-c-4-s1', text: 'Weeks 4–6 · Enterprise security architecture: cloud, hybrid, on-prem (29%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-c-5', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cp-c-5-s1', text: 'Weeks 7–9 · Security engineering and cryptography at scale (25%)', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-c-6', style: 'normal', markDefs: [], listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: 'cp-c-6-s1', text: 'Weeks 10–12 · Security operations leadership, incident command + exam prep (24%)', marks: [] }],
  },
]
```

### `sampleLesson`

```ts
sampleLesson: [
  {
    _type: 'block', _key: 'cp-l-1', style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 'cp-l-1-s1', text: 'Week 5 · Architecting a CMMC Level 2 environment from a constrained migration', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-l-2', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cp-l-2-s1', text: 'You inherit a defense contractor mid-migration: legacy Windows estate, GovCloud tenancy in progress, CUI scattered across three SharePoint sites, no enclave boundary. The contract milestone is 90 days away. Your team designs the target architecture — boundary definition, conditional access posture, audit logging pipeline, and incident response runbook — and defends it against a panel review.', marks: [] }],
  },
  {
    _type: 'block', _key: 'cp-l-3', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'cp-l-3-s1', text: 'By end of session, every learner has produced an architectural decision record, mapped each control to NIST SP 800-171 requirements, and identified the three highest-risk migration milestones with mitigation plans.', marks: [] }],
  },
]
```
