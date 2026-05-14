import type { ComparisonRow } from "@/lib/sanity/types"

interface SentinelVsSelfStudyProps {
  rows: ComparisonRow[]
}

export function SentinelVsSelfStudy({ rows }: SentinelVsSelfStudyProps) {
  return (
    <section
      aria-labelledby="comparison-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Sentinel vs Self-study
          </p>
          <h2
            id="comparison-headline"
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.1] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)" }}
          >
            What changes when you bring in a cohort.
          </h2>
        </div>

        {/* Desktop: 3-column table */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-4 pr-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-medium w-[24%]">
                Category
              </th>
              <th className="py-4 px-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] font-medium w-[38%]">
                Sentinel Institute
              </th>
              <th className="py-4 px-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-medium w-[38%]">
                Self-study / Pearson VUE prep
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.category}
                className={`border-b border-[var(--color-border)] ${
                  i % 2 === 1 ? "bg-[var(--color-surface)]/40" : ""
                }`}
              >
                <td className="py-5 pr-6 font-display text-[0.9375rem] font-medium text-[var(--color-text-primary)] align-top">
                  {row.category}
                </td>
                <td className="py-5 px-6 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed align-top">
                  {row.sentinel}
                </td>
                <td className="py-5 px-6 text-[0.9375rem] text-[var(--color-text-muted)] leading-relaxed align-top">
                  {row.selfStudy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: stacked cards */}
        <ul className="md:hidden space-y-6">
          {rows.map((row) => (
            <li
              key={row.category}
              className="border border-[var(--color-border)] rounded-md p-5 bg-[var(--color-surface)]/40"
            >
              <p className="font-display text-[1rem] font-medium text-[var(--color-text-primary)]">
                {row.category}
              </p>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)]">
                    Sentinel Institute
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                    {row.sentinel}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Self-study
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-[var(--color-text-muted)] leading-relaxed">
                    {row.selfStudy}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
