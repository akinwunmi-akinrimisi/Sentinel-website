import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { CaseStudy } from "@/lib/sanity/types"

interface ResultsHeroProps {
  caseStudy: CaseStudy
  /** "Case 01 / N" — derived by caller. */
  sequenceLabel: string
}

export function ResultsHero({ caseStudy, sequenceLabel }: ResultsHeroProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const certList = caseStudy.certificationsPassed.join(" + ")

  return (
    <section
      aria-labelledby="results-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {industry} · {caseStudy.complianceDriver} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="results-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {industry} — {caseStudy.complianceDriver}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {caseStudy.buyerName}, {caseStudy.buyerTitle}, led a {caseStudy.teamSize}-person security team through Sentinel&apos;s certification path in {caseStudy.weeksToCertification} weeks under live audit scrutiny.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Team size</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{caseStudy.teamSize} learners</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Time to cert</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{caseStudy.weeksToCertification} weeks</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Certifications</dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">{certList}</dd>
              </div>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-primary" data-cta="results-detail-primary" data-case-study={caseStudy.slug}>
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="results-detail-secondary" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
