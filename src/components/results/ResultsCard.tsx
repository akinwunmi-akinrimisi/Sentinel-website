import Link from "next/link"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface ResultsCardProps {
  caseStudy: CaseStudy
}

export function ResultsCard({ caseStudy }: ResultsCardProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const topMetrics = caseStudy.outcomeMetrics.slice(0, 3)

  return (
    <Link
      href={`/results/${caseStudy.slug}`}
      className="card-dark block hover:border-[var(--color-accent-light)]"
      data-cta="results-card"
      data-case-study={caseStudy.slug}
    >
      <article className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            {industry} · {caseStudy.complianceDriver}
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            {caseStudy.certificationsPassed.join(" + ")} · {caseStudy.weeksToCertification} weeks
          </p>
        </header>

        <blockquote className="font-display text-[1.375rem] md:text-[1.625rem] font-medium tracking-[-0.005em] leading-[1.25] text-[var(--color-text-primary)] max-w-[44rem]">
          {caseStudy.buyerQuote}
        </blockquote>

        <div className="flex items-center gap-4">
          <SanityAvatar image={caseStudy.buyerHeadshot} fullName={caseStudy.buyerName} size={48} />
          <div>
            <p className="text-[0.9375rem] font-medium text-[var(--color-text-primary)]">
              {caseStudy.buyerName}, {caseStudy.buyerTitle}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              {industry}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border)]">
          {topMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {metric.label}
              </dt>
              <dd className="mt-2 font-display text-[1.5rem] md:text-[1.75rem] font-medium text-[var(--color-text-primary)]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] inline-flex items-center gap-2">
          Read the full case
          <span aria-hidden="true">→</span>
        </p>
      </article>
    </Link>
  )
}
