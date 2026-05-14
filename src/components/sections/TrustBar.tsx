import { FadeUp } from "@/components/motion/FadeUp"

interface TrustBarProps {
  /** Total enterprise clients certified — drives the right-side caption. */
  enterpriseClients: number
  /** Labels for the client strip. Pass anonymized labels for industry-text mode. */
  clientLabels: string[]
}

export function TrustBar({ enterpriseClients, clientLabels }: TrustBarProps) {
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
            {clientLabels.length > 0 && (
              <ul
                aria-label="Clients"
                className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
              >
                {clientLabels.map((label) => (
                  <li
                    key={label}
                    className="transition-colors hover:text-[var(--color-text-secondary)]"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}

            {/* Right-side caption — uses live count */}
            <p className="md:max-w-[26ch] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] md:text-right shrink-0">
              {enterpriseClients} enterprise clients certified across 11 regulated industries
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
