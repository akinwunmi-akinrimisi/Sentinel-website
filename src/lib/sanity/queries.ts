import { groq } from 'next-sanity'
import { sanityClient } from './client'
import type {
  CaseStudy,
  ClientLogo,
  CompanyStats,
  Faq,
  HomepageData,
  IndustryPage,
  PressMention,
  ProgramPage,
  Testimonial,
} from './types'
import { FALLBACK_CASE_STUDY, FALLBACK_INDUSTRIES, FALLBACK_PROGRAMS } from './fallbacks'

/* -----------------------------------------------------------------------------
 * GROQ strings — centralized per spec §6.10
 * Image fields are projected to { url, alt } so consumers don't build URLs.
 * -------------------------------------------------------------------------- */

export const companyStatsQuery = groq`
  *[_type == "companyStats"][0]{
    passRate, professionalsCertified, enterpriseClients, auditsPassed,
    averageWeeks, availableSlots,
    passRateSecurityPlus, passRateCySAPlus, passRateCASPPlus,
    avgWeeksSecurityPlus, avgWeeksCySAPlus, avgWeeksCASPPlus,
    asOfDate
  }
`

export const homepageTestimonialsQuery = groq`
  *[_type == "testimonial" && featured == true] | order(order asc)[0..2]{
    _id, fullName, title, company, industry, industryAnonymized, quote,
    "portrait": { "url": portrait.asset->url, "alt": portrait.alt },
    videoUrl, featured, order
  }
`

export const featuredCaseStudyQuery = groq`
  *[_type == "caseStudy" && featured == true] | order(publishedDate desc)[0]{
    _id, "slug": slug.current,
    clientIndustry, clientIndustryAnonymized, complianceDriver,
    teamSize, weeksToCertification, certificationsPassed,
    buyerName, buyerTitle,
    "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
    buyerQuote, challenge, solution, outcome, outcomeMetrics,
    "clientLogo": clientLogo{ "url": asset->url, "alt": alt },
    publishedDate, featured
  }
`

export const allProgramsQuery = groq`
  *[_type == "programPage"] | order(homepageOrder asc){
    _id, "slug": slug.current, certName, eyebrow, oneliner,
    priceUSD, durationWeeks, sessionsPerWeek,
    whoNeedsIt, curriculumOutline, examObjectives,
    homepageOrder, seoTitle, seoDescription
  }
`

const PROGRAM_DETAIL_FIELDS = `
  _id, "slug": slug.current, certName, eyebrow, oneliner,
  priceUSD, durationWeeks, sessionsPerWeek,
  whoNeedsIt, curriculumOutline, examObjectives,
  outcomes, sampleLesson, comparisonSelfStudy,
  homepageOrder, seoTitle, seoDescription
`

export const allProgramDetailsQuery = groq`
  *[_type == "programPage"] | order(homepageOrder asc){ ${PROGRAM_DETAIL_FIELDS} }
`

export const programBySlugQuery = groq`
  *[_type == "programPage" && slug.current == $slug][0]{ ${PROGRAM_DETAIL_FIELDS} }
`

const INDUSTRY_DETAIL_FIELDS = `
  _id, "slug": slug.current, industryName,
  complianceMandate, complianceMandateFull, trainingContext,
  complianceClauses, riskScenarios, recommendedProgramSlugs,
  "featuredCaseStudy": featuredCaseStudy->{
    _id, "slug": slug.current,
    clientIndustry, clientIndustryAnonymized, complianceDriver,
    teamSize, weeksToCertification, certificationsPassed,
    buyerName, buyerTitle,
    "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
    buyerQuote, outcomeMetrics
  },
  homepageOrder, seoTitle, seoDescription
`

export const allIndustryDetailsQuery = groq`
  *[_type == "industryPage"] | order(homepageOrder asc){ ${INDUSTRY_DETAIL_FIELDS} }
`

export const industryBySlugQuery = groq`
  *[_type == "industryPage" && slug.current == $slug][0]{ ${INDUSTRY_DETAIL_FIELDS} }
`

const CASE_STUDY_DETAIL_FIELDS = `
  _id, "slug": slug.current,
  clientIndustry, clientIndustryAnonymized, complianceDriver,
  teamSize, weeksToCertification, certificationsPassed,
  buyerName, buyerTitle,
  "buyerHeadshot": { "url": buyerHeadshot.asset->url, "alt": buyerHeadshot.alt },
  buyerQuote, challenge, solution, outcome, outcomeMetrics,
  timeline, roi,
  "clientLogo": clientLogo{ "url": asset->url, "alt": alt },
  publishedDate, featured
`

export const allCaseStudiesQuery = groq`
  *[_type == "caseStudy"] | order(publishedDate desc){ ${CASE_STUDY_DETAIL_FIELDS} }
`

export const caseStudyBySlugQuery = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{ ${CASE_STUDY_DETAIL_FIELDS} }
`

export const homepageIndustriesQuery = groq`
  *[_type == "industryPage"] | order(homepageOrder asc)[0..5]{
    _id, "slug": slug.current, industryName,
    complianceMandate, complianceMandateFull, trainingContext,
    "featuredCaseStudy": featuredCaseStudy->{ "id": _id, "slug": slug.current },
    homepageOrder, seoTitle, seoDescription
  }
`

export const homepageFAQsQuery = groq`
  *[_type == "faq" && featured == true] | order(order asc)[0..3]{
    _id, question, answer, category, featured, order
  }
`

export const heroPressQuery = groq`
  *[_type == "pressMention" && showOnHero == true] | order(order asc){
    _id, outletName, articleTitle, url, publishedDate,
    "logo": { "url": logo.asset->url, "alt": logo.alt },
    showOnHero, order
  }
`

export const clientLogosQuery = groq`
  *[_type == "clientLogo"] | order(order asc){
    _id, companyName, anonymizedAs,
    "logo": logo{ "url": asset->url, "alt": alt },
    displayAs, order
  }
`

/* -----------------------------------------------------------------------------
 * Aggregate homepage fetcher
 * -------------------------------------------------------------------------- */

async function safeFetch<T>(query: string, fallback: T): Promise<T> {
  try {
    const data = await sanityClient.fetch<T>(query, {}, { next: { tags: ['homepage'] } })
    return data ?? fallback
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] query failed:', query.slice(0, 80), error)
    }
    return fallback
  }
}

/**
 * Fetches every dataset the homepage needs in parallel. Each query has its own
 * try/catch via `safeFetch` so a partial Sanity outage degrades to whichever
 * sections lost data — the rest still render. The page.tsx wrapper falls back
 * to constants from `fallbacks.ts` when individual queries return null/empty.
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  const [
    companyStats,
    homepageTestimonials,
    featuredCaseStudy,
    allPrograms,
    homepageIndustries,
    homepageFAQs,
    heroPress,
    clientLogos,
  ] = await Promise.all([
    safeFetch<CompanyStats | null>(companyStatsQuery, null),
    safeFetch<Testimonial[]>(homepageTestimonialsQuery, []),
    safeFetch<CaseStudy | null>(featuredCaseStudyQuery, null),
    safeFetch<ProgramPage[]>(allProgramsQuery, []),
    safeFetch<IndustryPage[]>(homepageIndustriesQuery, []),
    safeFetch<Faq[]>(homepageFAQsQuery, []),
    safeFetch<PressMention[]>(heroPressQuery, []),
    safeFetch<ClientLogo[]>(clientLogosQuery, []),
  ])

  return {
    companyStats,
    homepageTestimonials,
    featuredCaseStudy,
    allPrograms,
    homepageIndustries,
    homepageFAQs,
    heroPress,
    clientLogos,
  }
}

/**
 * Returns all 3 programs with full detail fields. Used by the /programs index
 * page and by RelatedPrograms on detail pages. Falls back to seed constants if
 * Sanity is unreachable or empty.
 */
export async function fetchAllPrograms(): Promise<ProgramPage[]> {
  const data = await safeFetch<ProgramPage[]>(allProgramDetailsQuery, [])
  return data.length > 0 ? data : FALLBACK_PROGRAMS
}

/**
 * Returns a single program by slug, or null if the slug is unknown.
 * Tries Sanity first, then falls back to the matching seed constant.
 */
export async function fetchProgramBySlug(slug: string): Promise<ProgramPage | null> {
  try {
    const data = await sanityClient.fetch<ProgramPage | null>(
      programBySlugQuery,
      { slug },
      { next: { tags: ['programPage', `programPage:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchProgramBySlug failed:', slug, error)
    }
  }
  return FALLBACK_PROGRAMS.find((p) => p.slug === slug) ?? null
}

/**
 * Returns all 6 industries with full detail fields. Used by /industries index
 * + detail pages. Uses the length-check fallback pattern from PR 10's
 * fetchAllPrograms — Sanity returning [] still falls back to seed constants.
 */
export async function fetchAllIndustries(): Promise<IndustryPage[]> {
  const data = await safeFetch<IndustryPage[]>(allIndustryDetailsQuery, [])
  return data.length > 0 ? data : FALLBACK_INDUSTRIES
}

/**
 * Returns a single industry by slug, or null if the slug is unknown.
 * Tries Sanity first, falls back to the matching seed constant.
 */
export async function fetchIndustryBySlug(slug: string): Promise<IndustryPage | null> {
  try {
    const data = await sanityClient.fetch<IndustryPage | null>(
      industryBySlugQuery,
      { slug },
      { next: { tags: ['industryPage', `industryPage:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchIndustryBySlug failed:', slug, error)
    }
  }
  return FALLBACK_INDUSTRIES.find((p) => p.slug === slug) ?? null
}

/**
 * Returns all case studies ordered by publishedDate desc. Falls back to the
 * seed constant if Sanity is unreachable or returns an empty array.
 */
export async function fetchAllCaseStudies(): Promise<CaseStudy[]> {
  const data = await safeFetch<CaseStudy[]>(allCaseStudiesQuery, [])
  return data.length > 0 ? data : [FALLBACK_CASE_STUDY]
}

/**
 * Returns a single case study by slug, or null if the slug is unknown.
 * Tries Sanity first, falls back to the matching seed constant.
 */
export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const data = await sanityClient.fetch<CaseStudy | null>(
      caseStudyBySlugQuery,
      { slug },
      { next: { tags: ['caseStudy', `caseStudy:${slug}`] } },
    )
    if (data) return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sanity] fetchCaseStudyBySlug failed:', slug, error)
    }
  }
  return FALLBACK_CASE_STUDY.slug === slug ? FALLBACK_CASE_STUDY : null
}
