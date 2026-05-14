import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"
import type { ProgramPage } from "@/lib/sanity/types"

interface ProgramHeroProps {
  program: ProgramPage
  /** "Program 01 / 03" — derived from homepageOrder + total count by caller. */
  sequenceLabel: string
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramHero({ program, sequenceLabel }: ProgramHeroProps) {
  return (
    <section
      aria-labelledby="program-hero-headline"
      className="bg-[var(--color-surface)] py-20 md:py-28 border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[52rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              {program.certName} · {sequenceLabel}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1
              id="program-hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.02em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)" }}
            >
              {program.eyebrow}
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] leading-relaxed max-w-[36rem]">
              {program.oneliner}
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <dl className="mt-10 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Investment
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {priceFormatter.format(program.priceUSD)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Duration
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {program.durationWeeks} weeks
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Cadence
                </dt>
                <dd className="mt-2 font-display text-[1.5rem] font-medium text-[var(--color-text-primary)]">
                  {program.sessionsPerWeek}× per week
                </dd>
              </div>
            </dl>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="btn-primary"
                data-cta="program-detail-primary"
                data-program={program.slug}
              >
                Request a Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="program-detail-secondary" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
