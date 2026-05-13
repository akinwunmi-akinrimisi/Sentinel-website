import { FadeUp } from "@/components/motion/FadeUp"
import { SystemTimeline } from "@/components/sections/SystemTimeline"

const PHASES = [
  {
    number: "01",
    name: "Precision Gap Assessment",
    body:
      "Before any training begins, every team member completes a structured diagnostic. We map individual knowledge gaps against the exact CompTIA exam objectives. No one sits through content they already know. No one skips content they need.",
    meta: [
      { label: "Duration", value: "1 week" },
      { label: "Output", value: "Individual gap report per team member" },
    ],
  },
  {
    number: "02",
    name: "Instructor-Led Certification Training",
    body:
      "Live sessions led by CISSP / CASP+ / CySA+ credentialed instructors. Content mapped 1:1 to CompTIA exam domains — no generic cybersecurity theory. Microsoft Teams or Zoom; client selects schedule.",
    meta: [
      { label: "Cadence", value: "3× per week, 2 hours" },
      { label: "Track", value: "Per certification" },
    ],
  },
  {
    number: "03",
    name: "Exam Simulation & Readiness Certification",
    body:
      "600+ practice questions in CompTIA exam format. Timed mock exams under real conditions. Weekly performance tracking shared with the CISO. No team member sits the live exam until they are consistently scoring above 85%.",
    meta: [
      { label: "Threshold", value: "85% sustained" },
      { label: "Reporting", value: "Weekly to training lead" },
    ],
  },
] as const

export function SentinelSystem() {
  return (
    <section
      aria-labelledby="system-headline"
      className="grain-overlay relative bg-[var(--color-surface)] py-24 md:py-32"
    >
      <div className="container-sentinel relative z-10">
        <FadeUp>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
            Our Methodology
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2
            id="system-headline"
            className="mt-4 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)] max-w-[28ch]"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            The Sentinel Certification System™
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mt-6 text-[var(--color-text-secondary)] max-w-[56ch] leading-relaxed">
            The same three-phase methodology applied to every contract — engineered to produce a
            documented pass rate, not just complete a course.
          </p>
        </FadeUp>

        <div className="mt-16">
          <SystemTimeline className="relative pl-12 md:pl-16">
            {/* Connector line — runs from top of phase 1 dot to center of result dot */}
            <div
              aria-hidden="true"
              data-system-line
              className="pointer-events-none absolute left-[11px] md:left-[15px] top-2 bottom-12 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)] to-[rgba(37,99,235,0.2)]"
            />

            {/* Phase steps */}
            {PHASES.map((phase) => (
              <div key={phase.number} className="relative mb-12 last:mb-0">
                <span
                  aria-hidden="true"
                  data-system-dot
                  className="absolute left-[-30px] md:left-[-46px] top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent)]"
                >
                  <span className="font-mono text-[0.625rem] font-medium text-[var(--color-accent-light)]">
                    {phase.number.replace(/^0/, "")}
                  </span>
                </span>

                <div data-system-step-content>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                    Phase {phase.number}
                  </p>
                  <h3 className="mt-2 font-display font-medium tracking-[-0.01em] leading-[1.15] text-[var(--color-text-primary)] text-xl md:text-2xl">
                    {phase.name}
                  </h3>
                  <p className="mt-3 text-[var(--color-text-secondary)] max-w-[60ch] leading-relaxed text-[0.9375rem]">
                    {phase.body}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.05em]">
                    {phase.meta.map((m) => (
                      <div key={m.label}>
                        <span className="text-[var(--color-text-muted)] opacity-70">{m.label}</span>{" "}
                        <span className="text-[var(--color-text-secondary)]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Result block */}
            <div className="relative">
              <span
                aria-hidden="true"
                data-system-result-dot
                className="absolute left-[-34px] md:left-[-50px] top-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-accent)] shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-[pulseGlow_3s_ease-in-out_infinite]"
              >
                <span className="block h-2 w-2 rounded-full bg-white" />
              </span>

              <div
                data-system-result-content
                className="rounded-lg border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.05)] p-6 md:p-7"
              >
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                  Result
                </p>
                <p className="mt-2 font-display font-medium tracking-[-0.015em] leading-[1.15] text-[var(--color-text-primary)] text-xl md:text-2xl">
                  96% first-attempt pass rate
                </p>
                <p className="mt-2 text-[var(--color-text-secondary)] text-[0.8125rem]">
                  Documented across all programs · 2019–2026
                </p>
              </div>
            </div>
          </SystemTimeline>
        </div>
      </div>
    </section>
  )
}
