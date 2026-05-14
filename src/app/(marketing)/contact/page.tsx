import type { Metadata } from "next"
import { ProposalForm } from "@/components/forms/ProposalForm"

export const metadata: Metadata = {
  title: "Request a Training Proposal — Sentinel Institute",
  description: "Tell us about your team. We respond to all proposals within 1 business day.",
}

export default function ContactPage() {
  return (
    <section className="py-20 md:py-28 bg-[var(--color-surface)]">
      <div className="container-sentinel">
        <div className="max-w-[42rem] mb-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Request a Training Proposal
          </p>
          <h1
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            Tell us about your team.
          </h1>
          <p className="mt-6 text-[var(--color-text-secondary)] max-w-[44ch] leading-relaxed">
            A senior advisor reviews every request. We respond within one business day with a
            tailored proposal — cohort plan, pricing, and compliance documentation.
          </p>
        </div>
        <ProposalForm />
      </div>
    </section>
  )
}
