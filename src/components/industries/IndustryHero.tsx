import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustryHeroProps {
  industry: IndustryPage
  /** "Industry 01 / 06" — derived from homepageOrder + total count by caller. */
  sequenceLabel: string
}

export function IndustryHero({ industry, sequenceLabel }: IndustryHeroProps) {
  return (
    <section
      aria-labelledby="industry-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {industry.industryName} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="industry-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {industry.industryName}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {industry.complianceMandateFull}
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)]">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Compliance mandate
              </dt>
              <dd className="mt-2 font-display text-[1.25rem] md:text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                {industry.complianceMandate}
              </dd>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="btn-primary"
                data-cta="industry-detail-primary"
                data-industry={industry.slug}
              >
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="industry-detail-secondary" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
