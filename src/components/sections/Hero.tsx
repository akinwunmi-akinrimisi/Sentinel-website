import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { LineReveal } from "@/components/motion/LineReveal"
import { StatCounter } from "@/components/motion/StatCounter"
import type { CompanyStats } from "@/lib/sanity/types"

interface HeroProps {
  /** Drives the stat pillar (right column). */
  stats: CompanyStats
  /** Outlet names rendered in the "AS FEATURED IN" band. */
  pressOutlets: string[]
}

interface HeroStat {
  value: number
  suffix: string
  label: string
}

function buildPillar(stats: CompanyStats): HeroStat[] {
  return [
    { value: stats.passRate, suffix: "%", label: "First-Attempt Pass Rate" },
    { value: stats.professionalsCertified, suffix: "", label: "Professionals Certified" },
    { value: stats.enterpriseClients, suffix: "", label: "Enterprise Clients" },
    { value: stats.auditsPassed, suffix: "", label: "Compliance Audits Passed" },
  ]
}

export function Hero({ stats, pressOutlets }: HeroProps) {
  const pillar = buildPillar(stats)

  return (
    <section
      aria-labelledby="hero-headline"
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 md:gap-16 items-start">
          {/* Left column */}
          <div>
            <FadeUp>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
                Enterprise Cybersecurity Certification
              </p>
            </FadeUp>

            <h1
              id="hero-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[0.95] text-[var(--color-text-primary)] max-w-[22ch]"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)" }}
            >
              <LineReveal>Close the Certification Gap Before the Auditors Do.</LineReveal>
            </h1>

            <FadeUp delay={0.5}>
              <p className="mt-7 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
                Sentinel Institute trains corporate security teams to pass CompTIA Security+,
                CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built
                into every contract.
              </p>
            </FadeUp>

            <FadeUp delay={0.65}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary" data-cta="hero-primary">
                  Request a Training Proposal
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  data-cta="hero-secondary"
                >
                  Book a 20-Minute Discovery Call
                </a>
              </div>
            </FadeUp>

            {pressOutlets.length > 0 && (
              <FadeUp delay={0.85}>
                <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.15em]">
                  <span className="text-[var(--color-text-muted)] opacity-70">As featured in</span>
                  {pressOutlets.map((outlet) => (
                    <span key={outlet} className="text-[var(--color-text-secondary)]">
                      {outlet}
                    </span>
                  ))}
                </div>
              </FadeUp>
            )}
          </div>

          {/* Right column — stat pillar */}
          <FadeUp delay={0.3} className="md:pt-2">
            <ul aria-label="Sentinel Institute outcomes">
              {pillar.map((stat, i) => (
                <li
                  key={stat.label}
                  className={
                    i === 0
                      ? "py-5"
                      : "py-5 border-t border-[var(--color-border)]"
                  }
                >
                  <span
                    className="block font-display font-medium tracking-[-0.025em] text-[var(--color-text-primary)] leading-none"
                    style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)" }}
                  >
                    <StatCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-2 block font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)]">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
