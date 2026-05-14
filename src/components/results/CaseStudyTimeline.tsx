import type { TimelineMilestone } from "@/lib/sanity/types"

interface CaseStudyTimelineProps {
  milestones: TimelineMilestone[]
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" })

function formatYearMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-")
  if (!year || !month) return yyyymm
  return monthFormatter.format(new Date(Number(year), Number(month) - 1, 1))
}

export function CaseStudyTimeline({ milestones }: CaseStudyTimelineProps) {
  return (
    <section
      aria-labelledby="timeline-headline"
      className="py-20 md:py-24 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel max-w-[48rem]">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
          Timeline
        </p>
        <h2
          id="timeline-headline"
          className="mt-5 font-display text-[1.75rem] md:text-[2rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
        >
          From audit finding to closed corrective action.
        </h2>

        <ol className="mt-12 relative">
          {milestones.map((milestone, i) => (
            <li
              key={`${milestone.date}-${i}`}
              className={`relative pl-10 ${i === milestones.length - 1 ? "" : "pb-10"}`}
            >
              {i !== milestones.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--color-border)]"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-[var(--color-accent-light)] bg-[var(--color-surface)]"
              />
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
                {formatYearMonth(milestone.date)}
              </p>
              <h3 className="mt-2 font-display text-[1.125rem] font-medium tracking-[-0.005em] text-[var(--color-text-primary)]">
                {milestone.headline}
              </h3>
              <p className="mt-2 text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
