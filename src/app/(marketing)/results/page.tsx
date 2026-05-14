import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { ResultsCard } from "@/components/results/ResultsCard"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllCaseStudies, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Results",
  description:
    "Case studies from Sentinel Institute enterprise certification cohorts — documented outcomes from teams under live compliance audits.",
}

async function fetchCompanyStats(): Promise<CompanyStats> {
  try {
    const data = await sanityClient.fetch<CompanyStats | null>(
      companyStatsQuery,
      {},
      { next: { tags: ["companyStats"] } },
    )
    return data ?? FALLBACK_COMPANY_STATS
  } catch {
    return FALLBACK_COMPANY_STATS
  }
}

export default async function ResultsIndexPage() {
  const [allCaseStudies, companyStats] = await Promise.all([
    fetchAllCaseStudies(),
    fetchCompanyStats(),
  ])

  return (
    <>
      <section
        aria-labelledby="results-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Results · {String(allCaseStudies.length).padStart(2, "0")}
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="results-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Outcomes that hold up under audit.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every Sentinel case study is a documented outcome from a real enterprise security cohort under live regulatory scrutiny. Names anonymized where contractually required; metrics are exact.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="results-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="results-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      <section
        aria-labelledby="results-list-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Case studies
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="results-list-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                The work, in our clients’ words.
              </h2>
            </FadeUp>
          </div>
          <ul className="space-y-6 max-w-[72rem]">
            {allCaseStudies.map((cs, i) => (
              <FadeUp key={cs._id} delay={0.2 + i * 0.1}>
                <li>
                  <ResultsCard caseStudy={cs} />
                </li>
              </FadeUp>
            ))}
          </ul>
        </div>
      </section>

      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
