import Link from "next/link"
import type { ProgramPage } from "@/lib/sanity/types"

interface RelatedProgramsProps {
  /** The currently-viewed program — excluded from the list. */
  current: ProgramPage
  /** All programs, used to derive the other 2. */
  all: ProgramPage[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RelatedPrograms({ current, all }: RelatedProgramsProps) {
  const others = all
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => a.homepageOrder - b.homepageOrder)

  if (others.length === 0) return null

  return (
    <section
      aria-labelledby="related-programs-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Compare other certifications
          </p>
          <h2
            id="related-programs-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Shortlist the right path for your team.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {others.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="card-dark flex flex-col gap-4 hover:border-[var(--color-accent-light)] transition-colors"
              data-cta="related-program"
              data-program={program.slug}
            >
              <header className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                  {program.certName}
                </p>
                <p className="font-mono text-[0.8125rem] text-[var(--color-text-primary)]">
                  {priceFormatter.format(program.priceUSD)}
                </p>
              </header>
              <h3
                className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                style={{ fontSize: "1.25rem" }}
              >
                {program.eyebrow}
              </h3>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mt-auto pt-2">
                {program.durationWeeks} weeks · {program.sessionsPerWeek}× per week
                <span className="ml-2 text-[var(--color-accent-light)]">Explore →</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
