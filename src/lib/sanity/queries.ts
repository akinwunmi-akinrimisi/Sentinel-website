import { groq } from 'next-sanity'

export const allTestimonialsQuery = groq`
  *[_type == "testimonial"] | order(_createdAt desc) {
    _id, fullName, title, company, industry, quote,
    "portraitUrl": portrait.asset->url, videoUrl
  }
`

export const allCaseStudiesQuery = groq`
  *[_type == "caseStudy"] | order(publishedDate desc) {
    _id, slug, clientIndustry, complianceDriver, challenge,
    solution, outcome, buyerQuote, "logoUrl": clientLogo.asset->url,
    publishedDate
  }
`

export const companyStatsQuery = groq`
  *[_type == "companyStats"][0]{
    passRate, clientsServed, professionalsCertified,
    auditsPassed, averageWeeks
  }
`
