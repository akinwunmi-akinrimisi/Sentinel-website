import Link from "next/link"
import { FadeUp } from "@/components/motion/FadeUp"
import { BookingButton } from "@/components/sections/BookingDialog"

interface ProposalCTAProps {
  /** Number of remaining cohort slots — pulled from companyStats. */
  availableSlots: number
}

export function ProposalCTA({ availableSlots }: ProposalCTAProps) {
  return (
    <section
      aria-labelledby="proposal-cta-headline"
      className="relative py-24 md:py-32 bg-[var(--color-surface)] grain-overlay overflow-hidden"
    >
      <div className="container-sentinel relative">
        <div className="max-w-[48rem] mx-auto text-center">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              Q3 2026 Enrollment
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="proposal-cta-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
            >
              Ready to close your certification gap?
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-7 text-[var(--color-text-secondary)] max-w-[36rem] mx-auto leading-relaxed">
              We&apos;re currently accepting Q3 2026 enterprise contracts.{" "}
              <span className="text-[var(--color-text-primary)] font-medium">
                {availableSlots} spots remaining.
              </span>
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary" data-cta="cta-primary">
                Request a Training Proposal
                <span aria-hidden="true">→</span>
              </Link>
              <BookingButton variant="secondary" ctaId="cta-secondary" />
            </div>
          </FadeUp>

          <FadeUp delay={0.6}>
            <p className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Response within 1 business day  ·  No-pass, re-train guarantee
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
