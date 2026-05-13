// src/app/(marketing)/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.",
}

export default function HomePage() {
  return (
    <div className="container-sentinel section-padding">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent-light)]">
        PR 1 · Foundations
      </p>
      <h1 className="mt-3 font-display text-4xl md:text-6xl font-medium tracking-[-0.015em] text-[var(--color-text-primary)] max-w-[18ch]">
        Sentinel Institute homepage shell is live.
      </h1>
      <p className="mt-6 max-w-prose text-[var(--color-text-secondary)] leading-relaxed">
        This page is the PR 1 stub. The 12 section components (Hero, Trust Bar,
        Problem, Programs, Sentinel Certification System™, Results By Program,
        Case Study, Testimonials, Industries, Proposal CTA, FAQ, Footer) ship in
        PR 2–8 per the design spec.
      </p>
    </div>
  )
}
