import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramsOverviewProps {
  programs: ProgramCardData[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramsOverview({ programs }: ProgramsOverviewProps) {
  return (
    <section
      id="programs"
      aria-labelledby="programs-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-14">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Programs
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              id="programs-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Three certifications. One methodology.
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <FadeUp key={program.slug} delay={0.3 + i * 0.1} className="flex">
              <article className="card-dark flex flex-col gap-6 flex-1">
                <header className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                    {program.certName}
                  </p>
                  <p className="font-mono text-[0.875rem] text-[var(--color-text-primary)]">
                    {priceFormatter.format(program.priceUSD)}
                  </p>
                </header>

                <h3
                  className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.375rem, 2vw, 1.625rem)" }}
                >
                  {program.eyebrow}
                </h3>

                <p
                  className="text-[var(--color-text-secondary)] leading-relaxed"
                  style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {program.oneliner}
                </p>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
                    Who needs this
                  </p>
                  <p
                    className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {program.whoNeedsItSummary}
                  </p>
                </div>

                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mt-auto">
                  Duration · {program.durationWeeks} weeks  ·  Sessions · {program.sessionsPerWeek}× per week
                </p>

                <Link
                  href={`/programs/${program.slug}`}
                  className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                  data-cta="program-card"
                  data-program={program.slug}
                >
                  Explore the program
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
