import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { IndustryGrid } from "@/components/sections/IndustryGrid"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllIndustries, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Industries Served",
  description:
    "Sentinel Institute trains corporate security teams in healthcare, financial services, defense, utilities, insurance, and legal — calibrated to each industry's compliance mandate.",
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

export default async function IndustriesIndexPage() {
  const [allIndustries, companyStats] = await Promise.all([
    fetchAllIndustries(),
    fetchCompanyStats(),
  ])

  return (
    <>
      {/* Section 1 — Hero band */}
      <section
        aria-labelledby="industries-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Industries · 06
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="industries-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Six industries. One certification track per compliance mandate.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every industry Sentinel serves has a regulator. Every regulator audits the same thing: whether your security workforce can prove they&rsquo;re trained for the role. Pick your sector — the curriculum maps to the standard.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="industries-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="industries-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 2 — Industry grid */}
      <section
        aria-labelledby="industries-grid-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Choose your sector
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="industries-grid-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                Built for the regulator who audits you.
              </h2>
            </FadeUp>
          </div>
          <IndustryGrid industries={allIndustries} baseDelay={0.2} />
        </div>
      </section>

      {/* Section 3 — CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
