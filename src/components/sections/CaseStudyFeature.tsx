import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { CaseStudy } from "@/lib/sanity/types"

interface CaseStudyFeatureProps {
  caseStudy: CaseStudy
}

export function CaseStudyFeature({ caseStudy }: CaseStudyFeatureProps) {
  const industry = caseStudy.clientIndustryAnonymized ?? caseStudy.clientIndustry
  const certList = caseStudy.certificationsPassed.join(", ")

  return (
    <section
      aria-labelledby="case-study-headline"
      className="relative py-20 md:py-32 bg-[var(--color-surface)] grain-overlay overflow-hidden"
    >
      <div className="container-sentinel relative">
        <FadeUp>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Featured Case Study
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <blockquote
            id="case-study-headline"
            className="mt-8 max-w-[40rem] font-display font-medium tracking-[-0.01em] leading-[1.15] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            {caseStudy.buyerQuote}
          </blockquote>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="mt-10 flex items-center gap-4">
            <SanityAvatar
              image={caseStudy.buyerHeadshot}
              fullName={caseStudy.buyerName}
              size={56}
            />
            <div>
              <p className="font-body font-medium text-[var(--color-text-primary)]">
                {caseStudy.buyerName}, {caseStudy.buyerTitle}
              </p>
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mt-1">
                {industry}
              </p>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.55}>
          <p className="mt-10 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] leading-relaxed">
            {caseStudy.complianceDriver}  ·  Team of {caseStudy.teamSize}  ·  {caseStudy.weeksToCertification} weeks  ·  {certList} passed
          </p>
        </FadeUp>

        <FadeUp delay={0.7}>
          <Link
            href={`/results/${caseStudy.slug}`}
            className="mt-10 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
            data-cta="case-study-feature"
          >
            Read the full case
            <span aria-hidden="true">→</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}
