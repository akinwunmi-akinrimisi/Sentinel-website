interface CaseStudyROIProps {
  text: string
}

export function CaseStudyROI({ text }: CaseStudyROIProps) {
  return (
    <section
      aria-labelledby="roi-headline"
      className="py-20 md:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
    >
      <div className="container-sentinel max-w-[48rem] text-center">
        <p
          id="roi-headline"
          className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium"
        >
          ROI
        </p>
        <blockquote className="mt-6 font-display text-[1.5rem] md:text-[1.875rem] font-medium tracking-[-0.01em] leading-[1.3] text-[var(--color-text-primary)]">
          {text}
        </blockquote>
      </div>
    </section>
  )
}
