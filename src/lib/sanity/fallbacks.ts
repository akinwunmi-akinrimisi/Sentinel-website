import type {
  CaseStudy,
  ClientLogo,
  CompanyStats,
  ComparisonRow,
  Faq,
  IndustryPage,
  PressMention,
  ProgramPage,
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
  { category: 'Pass guarantee', sentinel: 'No-pass, re-train at no cost — built into every enterprise contract', selfStudy: 'None — re-take fees are the learner’s responsibility' },
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
    seoDescription: 'Sentinel Institute’s Security+ training program — 8-week instructor-led path with documented first-attempt pass rate.',
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
  challenge: [],
  solution: [],
  outcome: [],
  outcomeMetrics: [
    { label: 'First-attempt pass rate', value: '94%' },
    { label: 'Audit findings related to staff cert', value: '0' },
    { label: 'Weeks from kickoff to passed exam', value: '9' },
  ],
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
    trainingContext: [],
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
    trainingContext: [],
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
    trainingContext: [],
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
    trainingContext: [],
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
    trainingContext: [],
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
    trainingContext: [],
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
