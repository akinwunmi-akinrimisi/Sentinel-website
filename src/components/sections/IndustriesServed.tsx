import { FadeUp } from "@/components/motion/FadeUp"
import { IndustryGrid } from "@/components/sections/IndustryGrid"
import type { IndustryPage } from "@/lib/sanity/types"

interface IndustriesServedProps {
  industries: IndustryPage[]
}

export function IndustriesServed({ industries }: IndustriesServedProps) {
  return (
    <section
      id="industries"
      aria-labelledby="industries-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
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

        <IndustryGrid industries={industries} />
      </div>
    </section>
  )
}
