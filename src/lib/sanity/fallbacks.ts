import type {
  ClientLogo,
  CompanyStats,
  PressMention,
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
