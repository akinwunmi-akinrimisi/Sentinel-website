import type { Metadata } from "next"
import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import { ProgramGrid } from "@/components/sections/ProgramGrid"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllPrograms, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats, ProgramCardData } from "@/lib/sanity/types"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Enterprise Cybersecurity Certification Programs",
  description:
    "Sentinel Institute trains corporate security teams on CompTIA Security+, CySA+, and CASP+ with a 96% first-attempt pass rate and a no-pass, re-train guarantee.",
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

export default async function ProgramsIndexPage() {
  const [allPrograms, companyStats] = await Promise.all([
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  const cardData: ProgramCardData[] = allPrograms.map((p) => ({
    slug: p.slug,
    certName: p.certName,
    eyebrow: p.eyebrow,
    oneliner: p.oneliner,
    priceUSD: p.priceUSD,
    durationWeeks: p.durationWeeks,
    sessionsPerWeek: p.sessionsPerWeek,
    whoNeedsItSummary:
      p.whoNeedsIt?.[0]?.children?.[0]?.text ?? "",
  }))

  return (
    <>
      {/* Section 1 — Hero band */}
      <section
        aria-labelledby="programs-index-headline"
        className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Programs · 03
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h1
              id="programs-index-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Three certifications. One methodology.
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              Every Sentinel program runs the same 8–12 week methodology — live instruction, working sessions on declassified incidents, and the same first-attempt pass guarantee. Choose the certification that matches where your team is today.
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="programs-index-primary">
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="programs-index-secondary" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 2 — Program grid */}
      <section
        aria-labelledby="programs-grid-headline"
        className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-12">
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Choose your path
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2
                id="programs-grid-headline"
                className="mt-5 font-display text-[1.75rem] md:text-[2.25rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
              >
                Three paths, one outcome.
              </h2>
            </FadeUp>
          </div>
          <ProgramGrid programs={cardData} baseDelay={0.2} />
        </div>
      </section>

      {/* Section 3 — CTA band (reuse ProposalCTA from homepage) */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
