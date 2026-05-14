import type { ComplianceClause } from "@/lib/sanity/types"

interface ComplianceClausesProps {
  clauses: ComplianceClause[]
}

export function ComplianceClauses({ clauses }: ComplianceClausesProps) {
  return (
    <section
      aria-labelledby="clauses-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Compliance clauses
          </p>
          <h2
            id="clauses-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            The specific citations this program addresses.
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clauses.map((clause, i) => (
            <li key={`${clause.code}-${i}`} className="card-dark flex flex-col gap-3">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] font-medium">
                {clause.code}
              </p>
              <h3 className="font-display font-medium text-[1.0625rem] tracking-[-0.005em] text-[var(--color-text-primary)]">
                {clause.title}
              </h3>
              <p className="text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {clause.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
