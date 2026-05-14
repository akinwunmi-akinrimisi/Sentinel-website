/**
 * TypeScript types that mirror the Sanity schemas in `sanity/schemas/`.
 *
 * These describe what GROQ queries return after projection (see queries.ts),
 * NOT the raw document shapes inside Sanity. Image fields are projected to
 * `{ url, alt }` so consumers don't need to build URLs.
 */

import type { PortableTextBlock } from 'next-sanity'

export interface SanityImage {
  url: string
  alt: string
}

export interface CompanyStats {
  passRate: number
  professionalsCertified: number
  enterpriseClients: number
  auditsPassed: number
  averageWeeks: number
  availableSlots: number
  passRateSecurityPlus: number
  passRateCySAPlus: number
  passRateCASPPlus: number
  avgWeeksSecurityPlus: number
  avgWeeksCySAPlus: number
  avgWeeksCASPPlus: number
  asOfDate: string
}

export interface Testimonial {
  _id: string
  fullName: string
  title: string
  company: string
  industry: string
  industryAnonymized?: string
  quote: string
  portrait: SanityImage
  videoUrl?: string
  featured: boolean
  order: number
}

export interface OutcomeMetric {
  label: string
  value: string
}

export interface CaseStudy {
  _id: string
  slug: string
  clientIndustry: string
  clientIndustryAnonymized?: string
  complianceDriver:
    | 'HIPAA'
    | 'PCI-DSS'
    | 'CMMC'
    | 'SOC 2'
    | 'NIST CSF'
    | 'NERC CIP'
    | 'Other'
  teamSize: number
  weeksToCertification: number
  certificationsPassed: string[]
  buyerName: string
  buyerTitle: string
  buyerHeadshot: SanityImage
  buyerQuote: string
  challenge: PortableTextBlock[]
  solution: PortableTextBlock[]
  outcome: PortableTextBlock[]
  outcomeMetrics: OutcomeMetric[]
  clientLogo?: SanityImage
  publishedDate: string
  featured: boolean
}

export type ProgramSlug = 'security-plus' | 'cysa-plus' | 'casp-plus'

export interface ProgramPage {
  _id: string
  slug: ProgramSlug
  certName: string
  eyebrow: string
  oneliner: string
  priceUSD: number
  durationWeeks: number
  sessionsPerWeek: number
  whoNeedsIt: PortableTextBlock[]
  curriculumOutline: PortableTextBlock[]
  examObjectives: string[]
  homepageOrder: number
  seoTitle: string
  seoDescription: string
}

export interface IndustryPage {
  _id: string
  slug: string
  industryName: string
  complianceMandate: string
  complianceMandateFull: string
  trainingContext: PortableTextBlock[]
  featuredCaseStudy?: { _ref: string; slug: string }
  homepageOrder: number
  seoTitle: string
  seoDescription: string
}

export interface Faq {
  _id: string
  question: string
  answer: PortableTextBlock[]
  category: 'general' | 'programs' | 'pricing' | 'logistics' | 'compliance'
  featured: boolean
  order: number
}

export interface PressMention {
  _id: string
  outletName: string
  articleTitle: string
  url: string
  publishedDate: string
  logo: SanityImage
  showOnHero: boolean
  order: number
}

export interface ClientLogo {
  _id: string
  companyName: string
  anonymizedAs?: string
  logo?: SanityImage
  displayAs: 'logo' | 'industry-text'
  order: number
}

/**
 * Aggregate shape returned by the homepage loader (page.tsx Promise.all).
 * `null` values mean Sanity returned nothing or the fetch failed — consumers
 * should fall back to constants in fallbacks.ts.
 */
export interface HomepageData {
  companyStats: CompanyStats | null
  homepageTestimonials: Testimonial[]
  featuredCaseStudy: CaseStudy | null
  allPrograms: ProgramPage[]
  homepageIndustries: IndustryPage[]
  homepageFAQs: Faq[]
  heroPress: PressMention[]
  clientLogos: ClientLogo[]
}
