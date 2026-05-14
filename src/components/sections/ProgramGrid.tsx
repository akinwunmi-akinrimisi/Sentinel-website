import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramGridProps {
  programs: ProgramCardData[]
  /** Delay (seconds) added to each card's FadeUp animation. Default 0.3 to match the original ProgramsOverview offset. */
  baseDelay?: number
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProgramGrid({ programs, baseDelay = 0.3 }: ProgramGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((program, i) => (
        <FadeUp key={program.slug} delay={baseDelay + i * 0.1} className="flex">
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
  )
}
