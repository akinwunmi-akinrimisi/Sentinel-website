import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustriesServedProps {
  industries: IndustryPage[]
}

export function IndustriesServed({ industries }: IndustriesServedProps) {
  return (
    <section
      aria-labelledby="industries-headline"
      className="py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-14">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Industries Served
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              id="industries-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Six industries. One certification track per compliance mandate.
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, i) => (
            <FadeUp key={industry._id} delay={0.3 + i * 0.08} className="flex">
              <article className="card-dark flex flex-col gap-5 flex-1">
                <h3
                  className="font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                >
                  {industry.industryName}
                </h3>

                <p
                  className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {industry.complianceMandateFull}
                </p>

                <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--color-accent-light)] mt-auto pt-4 border-t border-[var(--color-border)]">
                  {industry.complianceMandate}
                </p>

                <Link
                  href={`/industries/${industry.slug}`}
                  className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                  data-cta="industry-card"
                  data-industry={industry.slug}
                >
                  Industry detail
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
