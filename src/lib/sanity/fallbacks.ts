import type {
  CaseStudy,
  ClientLogo,
  CompanyStats,
  ComparisonRow,
  ComplianceClause,
  Faq,
  IndustryPage,
  PressMention,
  ProgramPage,
  RiskScenario,
  Testimonial,
} from './types'

/**
 * Resilience layer — these constants render if Sanity returns null/empty for
 * any of the homepage queries. They mirror the hardcoded PR 1–3 values so a
 * Sanity outage degrades the page to "what it looked like before PR 4."
 *
 * Update these when the brand truth changes (e.g., a new press mention is
 * permanently live in production). DO NOT use them as a long-term content
 * store — they exist for fault tolerance.
 */

export const FALLBACK_COMPANY_STATS: CompanyStats = {
  passRate: 96,
  professionalsCertified: 410,
  enterpriseClients: 63,
  auditsPassed: 38,
  averageWeeks: 9,
  availableSlots: 12,
  passRateSecurityPlus: 97,
  passRateCySAPlus: 95,
  passRateCASPPlus: 94,
  avgWeeksSecurityPlus: 8,
  avgWeeksCySAPlus: 10,
  avgWeeksCASPPlus: 12,
  asOfDate: '2026-05-01T00:00:00.000Z',
}

export const FALLBACK_HERO_PRESS: PressMention[] = [
  {
    _id: 'fallback-press-sc-magazine',
    outletName: 'SC Magazine',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.scmagazine.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'SC Magazine' },
    showOnHero: true,
    order: 0,
  },
  {
    _id: 'fallback-press-dark-reading',
    outletName: 'Dark Reading',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.darkreading.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'Dark Reading' },
    showOnHero: true,
    order: 1,
  },
  {
    _id: 'fallback-press-cyberscoop',
    outletName: 'CyberScoop',
    articleTitle: 'Sentinel Institute coverage',
    url: 'https://www.cyberscoop.com/',
    publishedDate: '2026-01-01T00:00:00.000Z',
    logo: { url: '', alt: 'CyberScoop' },
    showOnHero: true,
    order: 2,
  },
]

export const FALLBACK_CLIENT_LOGOS: ClientLogo[] = [
  { _id: 'fb-cl-1', companyName: 'Regional Bank, Midwest', anonymizedAs: 'Regional Bank, Midwest', displayAs: 'industry-text', order: 0 },
  { _id: 'fb-cl-2', companyName: 'Health System, Northeast', anonymizedAs: 'Health System, Northeast', displayAs: 'industry-text', order: 1 },
  { _id: 'fb-cl-3', companyName: 'Defense Contractor, Mid-Atlantic', anonymizedAs: 'Defense Contractor, Mid-Atlantic', displayAs: 'industry-text', order: 2 },
  { _id: 'fb-cl-4', companyName: 'Insurance Carrier, Southeast', anonymizedAs: 'Insurance Carrier, Southeast', displayAs: 'industry-text', order: 3 },
  { _id: 'fb-cl-5', companyName: 'Utility, Pacific Northwest', anonymizedAs: 'Utility, Pacific Northwest', displayAs: 'industry-text', order: 4 },
  { _id: 'fb-cl-6', companyName: 'Law Firm, AmLaw 200', anonymizedAs: 'Law Firm, AmLaw 200', displayAs: 'industry-text', order: 5 },
  { _id: 'fb-cl-7', companyName: 'Pharmaceutical, Top 25', anonymizedAs: 'Pharmaceutical, Top 25', displayAs: 'industry-text', order: 6 },
  { _id: 'fb-cl-8', companyName: 'Financial Services, Big Four', anonymizedAs: 'Financial Services, Big Four', displayAs: 'industry-text', order: 7 },
]

const SENTINEL_VS_SELF_STUDY: ComparisonRow[] = [
  { category: 'Schedule', sentinel: 'Live instructor-led cohort, 2–3 sessions per week, fixed start dates', selfStudy: 'Self-paced — completion timing on the learner, no fixed milestones' },
  { category: 'Live instruction', sentinel: 'Working sessions on real declassified breach scenarios with senior instructors', selfStudy: 'Video recordings and PDF study guides only — no live interaction' },
  { category: 'Practice incidents', sentinel: '12 end-to-end incident scenarios worked in pairs across the cohort', selfStudy: 'Multiple-choice exam prep questions only — no scenario work' },
  { category: 'Pass guarantee', sentinel: 'No-pass, re-train at no cost — built into every enterprise contract', selfStudy: "None — re-take fees are the learner’s responsibility" },
  { category: 'Compliance documentation', sentinel: 'Audit-ready training records + certificate package signed by Sentinel', selfStudy: 'Pearson VUE certificate copy only — no training audit trail' },
  { category: 'Cohort cap', sentinel: '12 learners maximum per cohort — instructor knows every team', selfStudy: 'N/A — individual study, no cohort' },
]

export const FALLBACK_PROGRAMS: ProgramPage[] = [
  {
    _id: 'fallback-program-security-plus',
    slug: 'security-plus',
    certName: 'CompTIA Security+',
    eyebrow: 'Foundational security operations.',
    oneliner:
      'For security analysts and SOC engineers establishing baseline competency across threats, identity, cryptography, and risk management.',
    priceUSD: 3500,
    durationWeeks: 8,
    sessionsPerWeek: 3,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'sp-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'sp-1-s1',
            text: 'New security hires and IT staff transitioning into security operations.',
            marks: [],
          },
        ],
      },
    ],
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
    ],
    examObjectives: ['Threats & Vulnerabilities', 'Architecture & Design', 'Implementation', 'Operations & Incident Response'],
    outcomes: [
      'Implement core security controls (authentication, encryption, access management) without escalating to senior staff',
      'Triage common incident types (phishing, credential abuse, malware) against documented playbooks',
      'Produce audit-ready evidence for HIPAA, PCI-DSS, and SOC 2 control families',
      'Run vulnerability scans, interpret CVSS scores, and prioritize remediation against business risk',
      'Build risk registers and present findings to non-technical stakeholders',
    ],
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
    ],
    comparisonSelfStudy: SENTINEL_VS_SELF_STUDY,
    homepageOrder: 0,
    seoTitle: 'CompTIA Security+ Certification Training | Sentinel Institute',
    seoDescription: "Sentinel Institute’s Security+ training program — 8-week instructor-led path with documented first-attempt pass rate.",
  },
  {
    _id: 'fallback-program-cysa-plus',
    slug: 'cysa-plus',
    certName: 'CompTIA CySA+',
    eyebrow: 'Threat detection & incident response.',
    oneliner:
      'For senior analysts moving into detection engineering, threat hunting, and incident response leadership.',
    priceUSD: 4500,
    durationWeeks: 10,
    sessionsPerWeek: 3,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'cs-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'cs-1-s1',
            text: 'Analysts with Security+ ready to take on detection and response responsibilities.',
            marks: [],
          },
        ],
      },
    ],
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
    ],
    examObjectives: ['Threat Management', 'Vulnerability Management', 'Cyber Incident Response', 'Security Architecture'],
    outcomes: [
      'Design SIEM detection rules from MITRE ATT&CK techniques across Splunk, Sentinel, and Elastic',
      'Lead containment and eradication during active incidents with documented chain of custody',
      'Hunt for indicators of compromise across endpoint, network, and identity telemetry',
      'Produce incident reports that satisfy CISO, legal, and regulatory disclosure requirements',
      'Tune false-positive rates without sacrificing detection coverage',
    ],
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
    ],
    comparisonSelfStudy: SENTINEL_VS_SELF_STUDY,
    homepageOrder: 1,
    seoTitle: 'CompTIA CySA+ Certification Training | Sentinel Institute',
    seoDescription: 'CySA+ training program — 10-week instructor-led path for senior security analysts.',
  },
  {
    _id: 'fallback-program-casp-plus',
    slug: 'casp-plus',
    certName: 'CompTIA CASP+',
    eyebrow: 'Enterprise security architecture.',
    oneliner:
      'For security architects and engineering leads owning enterprise-grade controls, risk strategy, and compliance posture.',
    priceUSD: 5500,
    durationWeeks: 12,
    sessionsPerWeek: 2,
    whoNeedsIt: [
      {
        _type: 'block',
        _key: 'cp-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'cp-1-s1',
            text: 'Security architects, engineering managers, and lead engineers owning architecture-level decisions.',
            marks: [],
          },
        ],
      },
    ],
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
    ],
    examObjectives: ['Security Architecture', 'Security Operations', 'Security Engineering & Cryptography', 'Governance, Risk & Compliance'],
    outcomes: [
      'Architect enterprise-grade controls that map to NIST CSF and ISO 27001 control objectives',
      'Lead risk-acceptance conversations with executive stakeholders using quantified impact framing',
      'Design secure cloud, hybrid, and on-premise topologies under regulatory constraints',
      'Build vendor-risk assessment programs that scale across hundreds of third parties',
      'Translate compliance mandates (CMMC, FedRAMP, SOX) into engineering requirements',
    ],
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
    ],
    comparisonSelfStudy: SENTINEL_VS_SELF_STUDY,
    homepageOrder: 2,
    seoTitle: 'CompTIA CASP+ Certification Training | Sentinel Institute',
    seoDescription: 'CASP+ training program — 12-week instructor-led path for senior security architects and engineering leads.',
  },
]

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    _id: 'fallback-testimonial-1',
    fullName: 'L. Marquez',
    title: 'VP of Information Security',
    company: 'Regional Bank, Midwest',
    industry: 'Financial Services',
    quote:
      'Our SOC team needed Security+ certified by audit. Sentinel ran the cohort, documented the pass rate, and gave us the artifact PCI examiners asked for.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 0,
  },
  {
    _id: 'fallback-testimonial-2',
    fullName: 'P. Okonkwo',
    title: 'Chief Information Security Officer',
    company: 'Health System, Northeast',
    industry: 'Healthcare',
    quote:
      'HIPAA Security Rule requires named, qualified staff. Sentinel certified 18 of our analysts in a single quarter — first attempt — with no remediation cohort needed.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 1,
  },
  {
    _id: 'fallback-testimonial-3',
    fullName: 'J. Chen',
    title: 'Director of Security Engineering',
    company: 'Defense Contractor, Mid-Atlantic',
    industry: 'Defense',
    quote:
      'CMMC Level 2 readiness was the goal; Sentinel delivered the training plan, the cohort, and the documented outcomes. The audit was uneventful — which is what we wanted.',
    portrait: { url: '', alt: '' },
    featured: true,
    order: 2,
  },
]

export const FALLBACK_CASE_STUDY: CaseStudy = {
  _id: 'fallback-case-study-1',
  slug: 'healthcare-hipaa-security-plus',
  clientIndustry: 'Healthcare',
  clientIndustryAnonymized: 'Health System, Northeast',
  complianceDriver: 'HIPAA',
  teamSize: 18,
  weeksToCertification: 9,
  certificationsPassed: ['Security+', 'CySA+'],
  buyerName: 'P. Okonkwo',
  buyerTitle: 'Chief Information Security Officer',
  buyerHeadshot: { url: '', alt: '' },
  buyerQuote:
    'Sentinel gave us a documented pass rate the auditors accepted on the first review. That was the entire point.',
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
  ],
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
  ],
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
  ],
  outcomeMetrics: [
    { label: 'First-attempt pass rate', value: '94%' },
    { label: 'Audit findings related to staff cert', value: '0' },
    { label: 'Weeks from kickoff to passed exam', value: '9' },
  ],
  timeline: [
    { date: '2025-11', headline: 'OCR finding issued', description: 'HIPAA § 164.308(a)(5) workforce training deficiency cited; 90-day remediation window starts.' },
    { date: '2025-12', headline: 'Sentinel contract signed', description: 'Two-track cohort designed around the specific deficiencies in the OCR finding; first cohort week scheduled.' },
    { date: '2026-01', headline: 'Cohort midpoint check-in', description: 'Practice exam results confirm pass-readiness across both tracks; OCR response team briefed on training progress.' },
    { date: '2026-02', headline: 'Final certifications passed', description: '17 of 18 personnel certified on first attempt; the remaining team member re-trains at no cost under guarantee.' },
    { date: '2026-03', headline: 'OCR closes corrective action', description: 'OCR accepts the response package without escalation. Cohort transitions to quarterly refresh cadence.' },
  ],
  roi: 'Avoided a Resolution Agreement pathway with a probable settlement range of $1.5M–$4.5M (based on 2023–2024 OCR enforcement precedent for comparable findings). Total Sentinel program cost: under $80K. Net risk-adjusted ROI: 18×–55× depending on settlement multiplier assumed.',
  publishedDate: '2026-04-01T00:00:00.000Z',
  featured: true,
}

export const FALLBACK_INDUSTRIES: IndustryPage[] = [
  {
    _id: 'fallback-industry-healthcare',
    slug: 'healthcare',
    industryName: 'Healthcare',
    complianceMandate: 'HIPAA Security Rule § 164.308',
    complianceMandateFull:
      'HIPAA Security Rule § 164.308 requires covered entities to designate, train, and maintain workforce members in security awareness and incident response procedures appropriate to their role.',
    trainingContext: [
      {
        _type: 'block', _key: 'h-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'h-tc-1-s1', text: "Healthcare CISOs operate under the HIPAA Security Rule, which audits the entire workforce for trained-and-certified incident-response capability. A failed audit isn’t a finding — it’s a settlement with the Office for Civil Rights.", marks: [] }],
      },
      {
        _type: 'block', _key: 'h-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'h-tc-2-s1', text: "Sentinel’s healthcare cohorts walk the OCR enforcement record: every breach scenario in the curriculum maps to a real Resolution Agreement, with the specific control failure cited. Your team finishes the program able to produce the audit-ready evidence package OCR investigators expect.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: '§ 164.308(a)(5)(i)', title: 'Security Awareness and Training', description: 'Implement a security awareness and training program for all members of its workforce, including management.' },
      { code: '§ 164.308(a)(5)(ii)(A)', title: 'Security Reminders', description: 'Periodic security updates appropriate to the workforce role.' },
      { code: '§ 164.308(a)(6)(i)', title: 'Security Incident Procedures', description: 'Identify and respond to suspected or known security incidents; mitigate harmful effects; document incidents and outcomes.' },
      { code: '§ 164.308(a)(7)(ii)(D)', title: 'Testing and Revision Procedures', description: 'Implement procedures for periodic testing and revision of contingency plans.' },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'OCR settlement, 2023 — $1.3M', narrative: 'A regional hospital network lost 4.3 million patient records to a credential-stuffing attack that bypassed an unmaintained MFA gateway. OCR found the security team had no documented training on authentication-incident triage. The Resolution Agreement specifically required certified personnel as part of the corrective action plan.' },
      { headline: 'OCR settlement, 2024 — $4.75M', narrative: 'A health insurance plan suffered ransomware that encrypted 90% of its claims-processing infrastructure. The investigation revealed the security workforce had not been trained in role-based incident response procedures required by § 164.308. The penalty included a 3-year monitoring agreement requiring continuous workforce certification.' },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['security-plus', 'cysa-plus'],
    homepageOrder: 0,
    seoTitle: 'HIPAA Security Training for Healthcare Teams | Sentinel Institute',
    seoDescription: 'CompTIA Security+, CySA+, and CASP+ training tailored to HIPAA Security Rule § 164.308 workforce requirements.',
  },
  {
    _id: 'fallback-industry-financial-services',
    slug: 'financial-services',
    industryName: 'Financial Services',
    complianceMandate: 'PCI-DSS v4.0 §§ 12.6 and 12.10',
    complianceMandateFull:
      'PCI-DSS v4.0 §§ 12.6 and 12.10 require formal security awareness, named incident response personnel, and documented training for all staff with cardholder-data access.',
    trainingContext: [
      {
        _type: 'block', _key: 'f-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'f-tc-1-s1', text: 'PCI-DSS v4.0 raised the bar on workforce training: § 12.6 now requires role-specific content and § 12.10 demands documented incident response personnel. QSAs are looking for evidence the security team has been trained, not just that policies exist.', marks: [] }],
      },
      {
        _type: 'block', _key: 'f-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'f-tc-2-s1', text: "Sentinel’s financial-services cohorts run on actual cardholder-data flow diagrams. Your team learns to defend the segments under audit — POI devices, tokenization vaults, and the cardholder-data environment boundary — not abstract textbook scenarios.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: '§ 12.6.1', title: 'Security awareness program', description: 'Implement a formal security awareness program reviewed at least annually with documented attendance per personnel.' },
      { code: '§ 12.6.3.1', title: 'Role-targeted training', description: 'Personnel with cardholder-data access receive training specific to their job function and the threats they face.' },
      { code: '§ 12.10.1', title: 'Incident response plan', description: 'Maintain an incident response plan with designated personnel available 24/7 to respond to suspected or confirmed incidents.' },
      { code: '§ 12.10.4', title: 'Annual IR testing', description: 'Test the incident response plan at least annually; document gaps and remediation.' },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'QSA finding, 2023 — repeat assessment', narrative: 'A mid-tier acquirer received a non-compliant report after auditors found that 70% of the security team had no documented role-based training. The acquirer was held in non-compliance for two assessment cycles before remediation completed.' },
      { headline: 'OFAC fine, 2024 — $48M', narrative: "A bank’s payment processing platform was breached via a misconfigured tokenization service. The IR team had not been trained on the specific tokenization vendor’s incident workflow. OFAC cited the lapse in its civil monetary penalty." },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['security-plus', 'cysa-plus'],
    homepageOrder: 1,
    seoTitle: 'PCI-DSS Security Training for Banks & Payments | Sentinel Institute',
    seoDescription: 'Certification training that satisfies PCI-DSS v4.0 § 12.6 and 12.10 awareness and incident-response mandates.',
  },
  {
    _id: 'fallback-industry-defense',
    slug: 'government-defense',
    industryName: 'Defense Contractors',
    complianceMandate: 'CMMC Level 2 / NIST SP 800-171',
    complianceMandateFull:
      'CMMC Level 2 and NIST SP 800-171 require contractors handling Controlled Unclassified Information to certify named, qualified security personnel across detection, response, and risk-management functions.',
    trainingContext: [
      {
        _type: 'block', _key: 'd-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'd-tc-1-s1', text: "CMMC Level 2 is enforcement, not aspiration: contractors handling Controlled Unclassified Information must certify named, qualified security personnel before primes will issue subcontracts. The DoD CIO’s 2024 guidance made the standard binding on every solicitation involving CUI.", marks: [] }],
      },
      {
        _type: 'block', _key: 'd-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'd-tc-2-s1', text: "Sentinel’s defense cohorts work the NIST SP 800-171 control families end-to-end with current C3PAO assessor expectations. Your team finishes with the artifacts a CMMC assessor needs: training records, role assignments, and incident-response evidence keyed to specific controls.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: 'AT.L2-3.2.1', title: 'Security awareness training', description: 'Provide basic security awareness training to all system users including managers and senior executives.' },
      { code: 'AT.L2-3.2.2', title: 'Role-based security training', description: 'Ensure that personnel are trained to carry out assigned information security-related duties and responsibilities.' },
      { code: 'IR.L2-3.6.1', title: 'Incident handling', description: 'Establish an operational incident-handling capability including preparation, detection, analysis, containment, recovery, and user response.' },
      { code: 'IR.L2-3.6.3', title: 'Incident response testing', description: 'Test the organizational incident response capability.' },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'Subcontract revocation, 2024', narrative: 'A defense contractor lost a $14M subcontract after a prime audit found their security team had no current certifications mapped to the NIST 800-171 AT control family. The prime required full certification within 90 days or contract termination.' },
      { headline: 'False Claims Act exposure, 2024 — $9M settlement', narrative: 'A federal contractor self-disclosed after discovering they had submitted CMMC self-attestations without actually meeting the training requirements. The DOJ settled the False Claims Act case at $9M with a 5-year compliance monitor.' },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['cysa-plus', 'casp-plus'],
    homepageOrder: 2,
    seoTitle: 'CMMC Level 2 Training for Defense Contractors | Sentinel Institute',
    seoDescription: 'Certification cohorts mapped to CMMC Level 2 / NIST SP 800-171 personnel requirements.',
  },
  {
    _id: 'fallback-industry-utilities',
    slug: 'utilities',
    industryName: 'Utilities',
    complianceMandate: 'NERC CIP-004 Personnel Training',
    complianceMandateFull:
      'NERC CIP-004 mandates that bulk electric system operators implement role-based cyber-security training, with documented evidence per employee, for all personnel with electronic access to critical assets.',
    trainingContext: [
      {
        _type: 'block', _key: 'u-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'u-tc-1-s1', text: 'NERC CIP-004 is one of the strictest workforce-training standards in any regulated industry. Bulk electric system operators must document evidence of role-based training per employee, refreshed at defined intervals, with named accountability for every cyber asset access.', marks: [] }],
      },
      {
        _type: 'block', _key: 'u-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'u-tc-2-s1', text: "Sentinel’s utility cohorts include OT-aware curriculum: SCADA, ICS, and field-asset attack scenarios alongside the enterprise certification path. Your team learns to defend the operational technology that traditional security training doesn’t cover.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: 'CIP-004-7 R2', title: 'Cyber security training program', description: 'Implement training that addresses cyber security policies, access controls, the visitor control program, electronic interconnections, handling of BES Cyber System Information, and incident response.' },
      { code: 'CIP-004-7 R3', title: 'Cyber security training', description: 'Each individual with authorized electronic or unescorted physical access shall complete the training before being granted access.' },
      { code: 'CIP-008-6 R1', title: 'Cyber security incident response plan', description: 'Maintain a documented cyber security incident response plan that addresses identification, classification, response, and reporting of cyber security incidents.' },
      { code: 'CIP-008-6 R2', title: 'IR plan testing', description: 'Test the cyber security incident response plan at least once every 15 months.' },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'NERC penalty, 2023 — $1.6M', narrative: 'A regional transmission operator was fined after auditors discovered 23% of personnel with BES Cyber System access had not completed CIP-004-required training within the 15-month interval. The penalty was assessed per missed training cycle.' },
      { headline: 'CIP enforcement action, 2024', narrative: 'A utility experienced a credential-phishing incident that triggered NERC CIP-008 reporting. The post-incident review found the security team had not been trained on the specific incident-classification matrix required by R1. NERC issued a self-report-with-mitigation determination — but the workforce-training gap became a 3-year compliance plan.' },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['security-plus', 'casp-plus'],
    homepageOrder: 3,
    seoTitle: 'NERC CIP-004 Cybersecurity Training | Sentinel Institute',
    seoDescription: 'Role-based certification training that satisfies NERC CIP-004 personnel-training requirements for utilities.',
  },
  {
    _id: 'fallback-industry-insurance',
    slug: 'insurance',
    industryName: 'Insurance',
    complianceMandate: 'NAIC Data Security Model Law §§ 4 and 6',
    complianceMandateFull:
      'The NAIC Insurance Data Security Model Law §§ 4 and 6 require licensees to maintain a written information security program with designated, qualified security personnel and ongoing training programs.',
    trainingContext: [
      {
        _type: 'block', _key: 'i-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'i-tc-1-s1', text: 'The NAIC Insurance Data Security Model Law has been adopted in 25+ states with more pending. Licensees must maintain a written information security program staffed by qualified personnel — and the qualification standard increasingly means industry-recognized certification.', marks: [] }],
      },
      {
        _type: 'block', _key: 'i-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'i-tc-2-s1', text: "Sentinel’s insurance cohorts work through actuarial-grade incident scenarios: data exfiltration affecting protected health information, fraud-ring detection on claims platforms, and the regulatory notification timelines that follow.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: '§ 4(B)(2)', title: 'Designated person', description: 'Designate one or more employees, an affiliate, or an outside vendor to be responsible for the information security program.' },
      { code: '§ 4(C)(2)', title: 'Risk assessment requirements', description: 'Assess the sufficiency of policies, procedures, information systems, and other safeguards to manage identified risks.' },
      { code: '§ 4(D)', title: 'Information security personnel', description: 'Train and continuously educate information security personnel to address relevant security risks.' },
      { code: '§ 6(A)', title: 'Cybersecurity event notification', description: 'Notify the Commissioner as promptly as possible but no later than 72 hours from determination that a cybersecurity event has occurred.' },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'NY DFS enforcement, 2023 — $7.5M', narrative: "A title insurance subsidiary was fined under New York’s 23 NYCRR 500 (the NAIC Model Law’s NY implementation) after a breach exposed millions of records. DFS specifically cited inadequate workforce training as one of three primary control failures." },
      { headline: 'NAIC examination finding, 2024', narrative: "A multi-state health insurer received an adverse examination report after auditors found the IT security team’s qualifications did not match the program scope. The examination required a remediation plan with named certified personnel within 6 months." },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['security-plus', 'cysa-plus'],
    homepageOrder: 4,
    seoTitle: 'NAIC Data Security Training for Insurers | Sentinel Institute',
    seoDescription: 'Certification programs that satisfy NAIC Insurance Data Security Model Law training and personnel mandates.',
  },
  {
    _id: 'fallback-industry-legal',
    slug: 'legal',
    industryName: 'Legal',
    complianceMandate: 'ABA Model Rule 1.6(c)',
    complianceMandateFull:
      'ABA Model Rule 1.6(c) requires lawyers to make reasonable efforts to prevent unauthorized disclosure of client information, including by training non-lawyer staff who handle client data.',
    trainingContext: [
      {
        _type: 'block', _key: 'l-tc-1', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'l-tc-1-s1', text: 'ABA Model Rule 1.6(c) and the duty of competence (Rule 1.1, Comment 8) together require attorneys to make reasonable efforts to prevent unauthorized client-data disclosure — including by training non-lawyer staff. State bars increasingly tie disciplinary action to documented training gaps.', marks: [] }],
      },
      {
        _type: 'block', _key: 'l-tc-2', style: 'normal', markDefs: [],
        children: [{ _type: 'span', _key: 'l-tc-2-s1', text: "Sentinel’s legal cohorts focus on the threat models law firms actually face: business email compromise targeting wire transfers, ransomware against case-management platforms, and discovery-process data spills. The curriculum aligns to ABA TechReport recommendations.", marks: [] }],
      },
    ],
    complianceClauses: [
      { code: 'MR 1.6(c)', title: 'Confidentiality of client information', description: 'A lawyer shall make reasonable efforts to prevent the inadvertent or unauthorized disclosure of, or unauthorized access to, information relating to the representation of a client.' },
      { code: 'MR 1.1 cmt 8', title: 'Duty of competence — technology', description: 'A lawyer should keep abreast of changes in the law and its practice, including the benefits and risks associated with relevant technology.' },
      { code: 'MR 5.3(b)', title: 'Supervision of non-lawyer assistants', description: "A lawyer having direct supervisory authority over the non-lawyer shall make reasonable efforts to ensure that the person’s conduct is compatible with the professional obligations of the lawyer." },
    ] as ComplianceClause[],
    riskScenarios: [
      { headline: 'State bar disciplinary action, 2023', narrative: "A mid-sized firm partner received a formal reprimand after a paralegal misdirected privileged discovery materials. The bar opinion cited inadequate training on data-handling procedures as the basis for the partner’s supervisory failure under Rule 5.3." },
      { headline: 'Malpractice carrier non-renewal, 2024', narrative: "A 40-lawyer firm lost its cyber liability coverage after the carrier’s audit found no documented workforce training program. The firm’s rates tripled when it found a replacement carrier — a direct cost of the training gap." },
    ] as RiskScenario[],
    recommendedProgramSlugs: ['security-plus'],
    homepageOrder: 5,
    seoTitle: 'Security Training for Law Firms | Sentinel Institute',
    seoDescription: 'Cybersecurity certification training calibrated to ABA Model Rule 1.6(c) confidentiality obligations.',
  },
]

export const FALLBACK_FAQS: Faq[] = [
  {
    _id: 'fallback-faq-1',
    question: 'Do you offer a pass guarantee?',
    answer: [
      {
        _type: 'block',
        _key: 'faq1-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq1-1-s1',
            text: 'Yes. Every Sentinel Institute contract includes a no-pass, re-train clause: any participant who does not pass on the first attempt is re-enrolled in the next cohort at no additional cost.',
            marks: [],
          },
        ],
      },
    ],
    category: 'general',
    featured: true,
    order: 0,
  },
  {
    _id: 'fallback-faq-2',
    question: 'How long does a typical cohort take?',
    answer: [
      {
        _type: 'block',
        _key: 'faq2-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq2-1-s1',
            text: 'Security+ runs 8 weeks, CySA+ runs 10 weeks, and CASP+ runs 12 weeks. We hold three 2-hour live sessions per week, recorded for asynchronous access if a participant misses a session.',
            marks: [],
          },
        ],
      },
    ],
    category: 'logistics',
    featured: true,
    order: 1,
  },
  {
    _id: 'fallback-faq-3',
    question: 'What does pricing look like for a 25-person cohort?',
    answer: [
      {
        _type: 'block',
        _key: 'faq3-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq3-1-s1',
            text: 'Per-seat pricing scales down with cohort size and certification track. A 25-person Security+ cohort lands in the high five figures; we send a tailored proposal within one business day of your request.',
            marks: [],
          },
        ],
      },
    ],
    category: 'pricing',
    featured: true,
    order: 2,
  },
  {
    _id: 'fallback-faq-4',
    question: 'Will this satisfy our compliance auditor?',
    answer: [
      {
        _type: 'block',
        _key: 'faq4-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'faq4-1-s1',
            text: 'We provide named, dated certification artifacts mapped to the specific compliance framework you are audited against — HIPAA, PCI-DSS, CMMC, SOC 2, NIST CSF, NERC CIP. Auditors have accepted our documentation on every engagement to date.',
            marks: [],
          },
        ],
      },
    ],
    category: 'compliance',
    featured: true,
    order: 3,
  },
]
