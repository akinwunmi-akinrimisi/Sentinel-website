import { FadeUp } from "@/components/motion/FadeUp"
import { SanityAvatar } from "@/components/sections/SanityAvatar"
import type { Testimonial } from "@/lib/sanity/types"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

function attributionLine(t: Testimonial): string {
  const company = t.industryAnonymized ?? t.company
  return `${t.title}, ${company}`
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null

  return (
    <section
      aria-labelledby="testimonials-headline"
      className="py-20 md:py-28 bg-[var(--color-surface)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[48rem]">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              What CISOs Say
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="testimonials-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Their words.
            </h2>
          </FadeUp>
        </div>

        <ul className="mt-16 space-y-20 max-w-[48rem]">
          {testimonials.map((t, i) => (
            <FadeUp key={t._id} delay={0.3 + i * 0.12}>
              <li>
                <p
                  className="font-display font-medium leading-[1.3] text-[var(--color-text-primary)]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.625rem)" }}
                >
                  {t.quote}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <SanityAvatar image={t.portrait} fullName={t.fullName} size={56} />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">
                      {t.fullName}
                    </p>
                    <p className="font-body text-[var(--color-text-secondary)] text-[0.9375rem]">
                      {attributionLine(t)}
                    </p>
                  </div>
                </div>
              </li>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  )
}
