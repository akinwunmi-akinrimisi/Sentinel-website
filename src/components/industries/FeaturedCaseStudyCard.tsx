import Link from "next/link"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface FeaturedCaseStudyCardProps {
  caseStudy: CaseStudy | null | undefined
}

export function FeaturedCaseStudyCard({ caseStudy }: FeaturedCaseStudyCardProps) {
  if (!caseStudy) return null

  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry

  return (
    <section
      aria-labelledby="case-study-card-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Featured case study
          </p>
          <h2
            id="case-study-card-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            What this looks like in production.
          </h2>
        </div>

        <article className="card-dark max-w-[48rem] flex flex-col gap-6">
          <blockquote className="font-display text-[1.25rem] md:text-[1.5rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)]">
            {caseStudy.buyerQuote}
          </blockquote>

          <div className="flex items-center gap-4">
            <SanityAvatar
              image={caseStudy.buyerHeadshot}
              fullName={caseStudy.buyerName}
              size={48}
            />
            <div>
              <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {industry}
              </p>
            </div>
          </div>

          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] pt-4 border-t border-[var(--color-border)]">
            {caseStudy.complianceDriver} · Team of {caseStudy.teamSize} · {caseStudy.weeksToCertification} weeks · {caseStudy.certificationsPassed.join(", ")}
          </p>

          <Link
            href={`/results/${caseStudy.slug}`}
            className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2 mt-2"
            data-cta="industry-case-study-card"
            data-case-study={caseStudy.slug}
          >
            Read the full case
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </section>
  )
}
