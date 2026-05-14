import type { RiskScenario } from "@/lib/sanity/types"

interface RiskScenariosProps {
  scenarios: RiskScenario[]
}

export function RiskScenarios({ scenarios }: RiskScenariosProps) {
  return (
    <section
      aria-labelledby="scenarios-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            What failed audits look like
          </p>
          <h2
            id="scenarios-headline"
            className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
          >
            Real outcomes from teams without certified personnel.
          </h2>
        </div>

        <ul className="max-w-[48rem] space-y-10">
          {scenarios.map((scenario, i) => (
            <li
              key={`${scenario.headline}-${i}`}
              className="border-l-2 border-[var(--color-accent-light)] pl-6 py-2"
            >
              <h3 className="font-display text-[1.125rem] md:text-[1.25rem] font-medium tracking-[-0.005em] text-[var(--color-text-primary)]">
                {scenario.headline}
              </h3>
              <p className="mt-3 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {scenario.narrative}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
