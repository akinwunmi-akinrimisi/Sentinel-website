import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import { ResultsHero } from "@/components/results/ResultsHero"
import { CaseStudyTimeline } from "@/components/results/CaseStudyTimeline"
import { CaseStudyROI } from "@/components/results/CaseStudyROI"
import { RecommendedPrograms } from "@/components/industries/RecommendedPrograms"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import {
  fetchAllCaseStudies,
  fetchCaseStudyBySlug,
  fetchAllPrograms,
  companyStatsQuery,
} from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats, ProgramSlug } from "@/lib/sanity/types"

export const revalidate = 3600

/** Lookup table: cert name (as stored in caseStudy.certificationsPassed) → program slug. */
const CERT_TO_SLUG: Record<string, ProgramSlug> = {
  "Security+": "security-plus",
  "CySA+": "cysa-plus",
  "CASP+": "casp-plus",
}

function certNamesToSlugs(certNames: string[]): ProgramSlug[] {
  return certNames
    .map((name) => CERT_TO_SLUG[name])
    .filter((slug): slug is ProgramSlug => Boolean(slug))
}

export async function generateStaticParams() {
  const all = await fetchAllCaseStudies()
  return all.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cs = await fetchCaseStudyBySlug(slug)
  if (!cs) return { title: "Case study not found" }
  const industry = cs.clientIndustryAnonymized ?? cs.clientIndustry
  return {
    title: `${industry} — ${cs.complianceDriver}`,
    description: `${cs.buyerName}, ${cs.buyerTitle} led a ${cs.teamSize}-person team through ${cs.certificationsPassed.join(" + ")} certification in ${cs.weeksToCertification} weeks.`,
  }
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

export default async function ResultsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [caseStudy, allCaseStudies, allPrograms, companyStats] = await Promise.all([
    fetchCaseStudyBySlug(slug),
    fetchAllCaseStudies(),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!caseStudy) notFound()

  const index = allCaseStudies.findIndex((cs) => cs.slug === caseStudy.slug)
  const sequenceLabel = `Case ${String(Math.max(index, 0) + 1).padStart(2, "0")} / ${String(allCaseStudies.length).padStart(2, "0")}`
  const recommendedSlugs = certNamesToSlugs(caseStudy.certificationsPassed)
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry

  return (
    <>
      {/* Section 1 — Hero (Variant A) */}
      <ResultsHero caseStudy={caseStudy} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Challenge */}
      <section
        aria-labelledby="challenge-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              The challenge
            </p>
            <h2
              id="challenge-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              What the team walked in carrying.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={caseStudy.challenge} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Solution */}
      <section
        aria-labelledby="solution-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            The solution
          </p>
          <h2
            id="solution-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            How Sentinel structured the response.
          </h2>
          <div className="mt-8">
            <PortableText value={caseStudy.solution} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 4 — Outcome */}
      <section
        aria-labelledby="outcome-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            The outcome
          </p>
          <h2
            id="outcome-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            What landed at the end of the cohort.
          </h2>
          <div className="mt-8">
            <PortableText value={caseStudy.outcome} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 5 — Outcome metrics */}
      <section
        aria-labelledby="metrics-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-10">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Outcome metrics
            </p>
            <h2
              id="metrics-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              The numbers the auditors saw.
            </h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudy.outcomeMetrics.map((metric, i) => (
              <div key={`${metric.label}-${i}`} className="card-dark">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {metric.label}
                </dt>
                <dd className="mt-3 font-display text-[2.25rem] md:text-[2.75rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)] leading-none">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Section 6 — Timeline */}
      <CaseStudyTimeline milestones={caseStudy.timeline} />

      {/* Section 7 — ROI */}
      <CaseStudyROI text={caseStudy.roi} />

      {/* Section 8 — Buyer testimonial */}
      <section
        aria-labelledby="testimonial-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p id="testimonial-headline" className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            In their words
          </p>
          <blockquote className="mt-8 font-display text-[1.5rem] md:text-[1.875rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)]">
            {caseStudy.buyerQuote}
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <SanityAvatar image={caseStudy.buyerHeadshot} fullName={caseStudy.buyerName} size={56} />
            <div>
              <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {industry}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 — Recommended programs */}
      <RecommendedPrograms slugs={recommendedSlugs} allPrograms={allPrograms} />

      {/* Section 10 — Final CTA */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
