import { FadeUp } from "@/components/motion/FadeUp"

const CLIENT_INDUSTRIES = [
  "Regional Bank, Midwest",
  "Health System, Northeast",
  "Defense Contractor, Mid-Atlantic",
  "Insurance Carrier, Southeast",
  "Utility, Pacific Northwest",
  "Law Firm, AmLaw 200",
  "Pharmaceutical, Top 25",
  "Financial Services, Big Four",
] as const

export function TrustBar() {
  return (
    <section
      aria-label="Trusted by"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface-alt)]"
    >
      <div className="container-sentinel py-10">
        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            {/* CompTIA badge — text fallback until SVG arrives */}
            <div
              role="img"
              aria-label="CompTIA Authorized Partner"
              className="inline-flex items-center gap-2.5 shrink-0 rounded border border-[var(--color-border-hover)] bg-[var(--color-surface-elevated)] px-3.5 py-2"
            >
              <span
                aria-hidden="true"
                className="font-display font-semibold text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--color-accent-light)]"
              >
                CompTIA
              </span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                Authorized Partner
              </span>
            </div>

            {/* Client industries strip */}
            <ul
              aria-label="Clients"
              className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
            >
              {CLIENT_INDUSTRIES.map((industry) => (
                <li
                  key={industry}
                  className="transition-colors hover:text-[var(--color-text-secondary)]"
                >
                  {industry}
                </li>
              ))}
            </ul>

            {/* Right-side caption */}
            <p className="md:max-w-[26ch] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] md:text-right shrink-0">
              63 enterprise clients certified across 11 regulated industries
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
