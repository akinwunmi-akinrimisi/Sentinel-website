import { FadeUp } from "@/components/motion/FadeUp"

const PROBLEMS: readonly string[] = [
  "Compliance pressure — HIPAA / PCI-DSS / CMMC require certified security staff by name.",
  "High exam-failure rates with previous providers — wasted budget, gap unchanged.",
  "Generic training that doesn't transfer — Pluralsight / LinkedIn Learning don't produce passing scores.",
] as const

export function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-headline"
      className="py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[40rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              What Buyers Tell Us
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="problem-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Three problems show up on every discovery call.
            </h2>
          </FadeUp>

          <ol className="mt-12 space-y-10">
            {PROBLEMS.map((problem, i) => (
              <FadeUp key={problem} delay={0.3 + i * 0.12}>
                <li className="flex gap-5">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium pt-1.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    className="font-display font-medium leading-[1.3] text-[var(--color-text-primary)]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                  >
                    {problem}
                  </p>
                </li>
              </FadeUp>
            ))}
          </ol>

          <FadeUp delay={0.75}>
            <blockquote
              className="mt-14 pl-6 border-l-2 border-[var(--color-accent-light)] font-display font-medium leading-[1.2] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              You don&apos;t need another platform. You need a documented pass rate.
            </blockquote>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
