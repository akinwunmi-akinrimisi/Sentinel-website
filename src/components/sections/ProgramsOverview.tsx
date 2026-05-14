import { FadeUp } from "@/components/motion/FadeUp"
import { ProgramGrid } from "@/components/sections/ProgramGrid"
import type { ProgramCardData } from "@/lib/sanity/types"

interface ProgramsOverviewProps {
  programs: ProgramCardData[]
}

export function ProgramsOverview({ programs }: ProgramsOverviewProps) {
  return (
    <section
      id="programs"
      aria-labelledby="programs-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem] mb-14">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Programs
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              id="programs-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Three certifications. One methodology.
            </h2>
          </FadeUp>
        </div>

        <ProgramGrid programs={programs} />
      </div>
    </section>
  )
}
