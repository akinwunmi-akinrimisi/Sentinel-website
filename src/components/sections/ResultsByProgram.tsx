import { FadeUp } from "@/components/motion/FadeUp"
import type { CompanyStats } from "@/lib/sanity/types"

interface ResultsByProgramProps {
  stats: CompanyStats
}

interface ProgramRow {
  cert: string
  passRate: number
  avgWeeks: number
}

function buildRows(stats: CompanyStats): ProgramRow[] {
  return [
    { cert: "Security+", passRate: stats.passRateSecurityPlus, avgWeeks: stats.avgWeeksSecurityPlus },
    { cert: "CySA+",     passRate: stats.passRateCySAPlus,     avgWeeks: stats.avgWeeksCySAPlus },
    { cert: "CASP+",     passRate: stats.passRateCASPPlus,     avgWeeks: stats.avgWeeksCASPPlus },
  ]
}

export function ResultsByProgram({ stats }: ResultsByProgramProps) {
  const rows = buildRows(stats)

  return (
    <section
      aria-labelledby="results-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[56rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Results · By Program
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="results-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Pass rate, by certification.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-5 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
              Hero stats are top-line totals. Below is the breakdown CISOs quote in board decks.
            </p>
          </FadeUp>

          <ul className="mt-12">
            {rows.map((row, i) => (
              <FadeUp key={row.cert} delay={0.45 + i * 0.1}>
                <li className="grid grid-cols-[1fr_auto_auto] items-baseline gap-6 md:gap-12 py-6 border-b border-[var(--color-border)]">
                  <span
                    className="font-display font-medium text-[var(--color-text-primary)]"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {row.cert}
                  </span>
                  <span
                    className="font-display font-medium text-[var(--color-accent-light)] tabular-nums"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {row.passRate}%
                  </span>
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] tabular-nums">
                    {row.avgWeeks} wks avg
                  </span>
                </li>
              </FadeUp>
            ))}
          </ul>

          <FadeUp delay={0.85}>
            <p className="mt-8 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] leading-relaxed">
              Across {stats.professionalsCertified} professionals at {stats.enterpriseClients} clients  ·  {stats.auditsPassed} compliance audits passed  ·  0 failures
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
