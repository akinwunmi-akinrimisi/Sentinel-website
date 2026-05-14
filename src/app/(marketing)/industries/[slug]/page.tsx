import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { IndustryHero } from "@/components/industries/IndustryHero"
import { ComplianceClauses } from "@/components/industries/ComplianceClauses"
import { RiskScenarios } from "@/components/industries/RiskScenarios"
import { FeaturedCaseStudyCard } from "@/components/industries/FeaturedCaseStudyCard"
import { RecommendedPrograms } from "@/components/industries/RecommendedPrograms"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import {
  fetchAllIndustries,
  fetchIndustryBySlug,
  fetchAllPrograms,
  companyStatsQuery,
} from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats } from "@/lib/sanity/types"

export const revalidate = 3600

const ALLOWED_SLUGS = [
  "healthcare",
  "financial-services",
  "government-defense",
  "utilities",
  "insurance",
  "legal",
] as const

export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const industry = await fetchIndustryBySlug(slug)
  if (!industry) return { title: "Industry not found" }
  return {
    title: industry.seoTitle.replace(" | Sentinel Institute", ""),
    description: industry.seoDescription,
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

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [industry, allIndustries, allPrograms, companyStats] = await Promise.all([
    fetchIndustryBySlug(slug),
    fetchAllIndustries(),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!industry) notFound()

  const sequenceLabel = `Industry ${String(industry.homepageOrder + 1).padStart(2, "0")} / ${String(allIndustries.length).padStart(2, "0")}`

  return (
    <>
      {/* Section 1 — Hero (Variant A) */}
      <IndustryHero industry={industry} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Training context */}
      <section
        aria-labelledby="training-context-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Training context
            </p>
            <h2
              id="training-context-headline"
              className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              Why this industry has its own curriculum.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={industry.trainingContext} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Compliance clauses */}
      <ComplianceClauses clauses={industry.complianceClauses} />

      {/* Section 4 — Risk scenarios */}
      <RiskScenarios scenarios={industry.riskScenarios} />

      {/* Section 5 — Featured case study (conditional render) */}
      <FeaturedCaseStudyCard caseStudy={industry.featuredCaseStudy} />

      {/* Section 6 — Recommended programs */}
      <RecommendedPrograms slugs={industry.recommendedProgramSlugs} allPrograms={allPrograms} />

      {/* Section 7 — Final CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
