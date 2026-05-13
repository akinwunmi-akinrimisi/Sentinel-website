declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

type GTagEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}

export function trackEvent({ action, category, label, value, ...rest }: GTagEvent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  })
}

// Per WEBSITE_CONTEXT.md §7 — Sentinel-specific GA4 events
export const analytics = {
  ctaClick: (label: string) => trackEvent({ action: 'cta_click', label }),
  proposalFormStart: () => trackEvent({ action: 'proposal_form_start' }),
  proposalFormSubmit: () => trackEvent({ action: 'proposal_form_submit' }),
  discoveryCallBooked: () => trackEvent({ action: 'discovery_call_booked' }),
  programPageView: (programName: 'security_plus' | 'cysa_plus' | 'casp_plus') =>
    trackEvent({ action: 'program_page_view', program_name: programName }),
  industryPageView: (industryName: string) =>
    trackEvent({ action: 'industry_page_view', industry_name: industryName }),
  caseStudyViewed: (caseStudyId: string) =>
    trackEvent({ action: 'case_study_viewed', case_study_id: caseStudyId }),
  scrollDepth: (depth: 25 | 50 | 75 | 100) =>
    trackEvent({ action: 'scroll_depth', label: `${depth}%` }),
}
