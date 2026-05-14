import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText } from "next-sanity"
import { FadeUp } from "@/components/motion/FadeUp"
import { ProgramHero } from "@/components/programs/ProgramHero"
import { programProseComponents } from "@/components/programs/ProgramProse"
import { SentinelVsSelfStudy } from "@/components/programs/SentinelVsSelfStudy"
import { RelatedPrograms } from "@/components/programs/RelatedPrograms"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { fetchAllPrograms, fetchProgramBySlug, companyStatsQuery } from "@/lib/sanity/queries"
import { sanityClient } from "@/lib/sanity/client"
import { FALLBACK_COMPANY_STATS } from "@/lib/sanity/fallbacks"
import type { CompanyStats, ProgramPage, ProgramSlug } from "@/lib/sanity/types"

export const revalidate = 3600

const ALLOWED_SLUGS: ProgramSlug[] = ["security-plus", "cysa-plus", "casp-plus"]

export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await fetchProgramBySlug(slug)
  if (!program) return { title: "Program not found" }
  return {
    title: program.seoTitle.replace(" | Sentinel Institute", ""),
    description: program.seoDescription,
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

function buildCourseJsonLd(program: ProgramPage): Record<string, unknown> {
  const totalHours = program.sessionsPerWeek * program.durationWeeks * 2
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.certName,
    description: program.oneliner,
    provider: {
      "@type": "Organization",
      name: "Sentinel Institute",
      sameAs: "https://sentinelinstitute.com",
    },
    offers: {
      "@type": "Offer",
      price: program.priceUSD,
      priceCurrency: "USD",
      category: "Enterprise training",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${totalHours}H`,
    },
  }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [program, allPrograms, companyStats] = await Promise.all([
    fetchProgramBySlug(slug),
    fetchAllPrograms(),
    fetchCompanyStats(),
  ])

  if (!program) notFound()

  const sequenceLabel = `Program ${String(program.homepageOrder + 1).padStart(2, "0")} / ${String(allPrograms.length).padStart(2, "0")}`
  const jsonLd = buildCourseJsonLd(program)

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Section 1 — Hero (Variant A) */}
      <ProgramHero program={program} sequenceLabel={sequenceLabel} />

      {/* Section 2 — Who needs it */}
      <section
        aria-labelledby="who-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Who needs this
            </p>
            <h2 id="who-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
              Built for the team you actually have.
            </h2>
          </FadeUp>
          <div className="mt-8">
            <PortableText value={program.whoNeedsIt} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 3 — Curriculum outline */}
      <section
        aria-labelledby="curriculum-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Curriculum outline
          </p>
          <h2 id="curriculum-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            What gets taught, week by week.
          </h2>
          <div className="mt-8">
            <PortableText value={program.curriculumOutline} components={programProseComponents} />
          </div>
        </div>
      </section>

      {/* Section 4 — Exam objectives */}
      <section
        aria-labelledby="objectives-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel">
          <div className="max-w-[48rem] mb-10">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Exam objectives
            </p>
            <h2 id="objectives-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
              Every domain the CompTIA exam covers.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.examObjectives.map((obj, i) => (
              <li key={obj} className="card-dark flex items-start gap-4">
                <span className="font-mono text-[0.875rem] text-[var(--color-accent-light)] mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1rem] font-medium text-[var(--color-text-primary)]">
                  {obj}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 5 — Outcomes */}
      <section
        aria-labelledby="outcomes-headline"
        className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            After completion
          </p>
          <h2 id="outcomes-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            What your team can do.
          </h2>
          <ol className="mt-10 space-y-6">
            {program.outcomes.map((outcome, i) => (
              <li key={outcome} className="flex gap-5">
                <span className="font-mono text-[0.875rem] text-[var(--color-accent-light)] pt-1 shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1rem] text-[var(--color-text-primary)] leading-relaxed">
                  {outcome}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 6 — Sample lesson */}
      <section
        aria-labelledby="lesson-headline"
        className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      >
        <div className="container-sentinel max-w-[48rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            From a real lesson
          </p>
          <h2 id="lesson-headline" className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            See what a working session feels like.
          </h2>
          <div className="mt-8 border-l-2 border-[var(--color-accent-light)] pl-6 py-2">
            <PortableText value={program.sampleLesson} components={programProseComponents} />
          </div>
          <p className="mt-6 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            → Full curriculum runs in the live program. Request a proposal to schedule.
          </p>
        </div>
      </section>

      {/* Section 7 — Sentinel vs Self-study */}
      <SentinelVsSelfStudy rows={program.comparisonSelfStudy} />

      {/* Section 8 — Related programs */}
      <RelatedPrograms current={program} all={allPrograms} />

      {/* Section 9 — Final CTA band */}
      <ProposalCTA availableSlots={companyStats.availableSlots} />
    </>
  )
}
