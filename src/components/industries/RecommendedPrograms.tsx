import Link from "next/link"
import type { ProgramPage, ProgramSlug } from "@/lib/sanity/types"

interface RecommendedProgramsProps {
  /** The slugs to recommend, from industry.recommendedProgramSlugs (1-3 items). */
  slugs: ProgramSlug[]
  /** All programs (fetched on the detail page) — filtered by slugs. */
  allPrograms: ProgramPage[]
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RecommendedPrograms({ slugs, allPrograms }: RecommendedProgramsProps) {
  const programs = slugs
    .map((slug) => allPrograms.find((p) => p.slug === slug))
    .filter((p): p is ProgramPage => Boolean(p))
    .sort((a, b) => a.homepageOrder - b.homepageOrder)

  if (programs.length === 0) return null

  return (
    <section
      aria-labelledby="recommended-programs-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Recommended programs
          </p>
          <h2
            id="recommended-programs-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Tracks that fit this risk profile.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {programs.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="card-dark flex flex-col gap-4 hover:border-[var(--color-accent-light)]"
              data-cta="industry-recommended-program"
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
              <h3 className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)] text-[1.25rem]">
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
