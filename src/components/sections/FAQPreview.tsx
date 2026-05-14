import Link from "next/link"
import { PortableText, type PortableTextComponents } from "next-sanity"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FadeUp } from "@/components/motion/FadeUp"
import type { Faq } from "@/lib/sanity/types"

interface FAQPreviewProps {
  faqs: Faq[]
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h3 className="font-display font-medium text-[var(--color-text-primary)] text-[1.125rem] mb-2 mt-4">{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className="font-display font-medium text-[var(--color-text-primary)] text-[1rem] mb-2 mt-3">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="pl-4 border-l-2 border-[var(--color-accent-light)] text-[var(--color-text-secondary)] italic my-3">{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="text-[var(--color-text-primary)] font-medium">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={(value as { href?: string })?.href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1 text-[var(--color-text-secondary)]">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 my-3 space-y-1 text-[var(--color-text-secondary)]">{children}</ol>,
  },
}

export function FAQPreview({ faqs }: FAQPreviewProps) {
  if (faqs.length === 0) return null

  return (
    <section
      id="faq"
      aria-labelledby="faq-headline"
      className="scroll-mt-24 py-20 md:py-28 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]"
    >
      <div className="container-sentinel">
        <div className="max-w-[56rem] mx-auto">
          <FadeUp>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] font-medium">
              FAQ
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              id="faq-headline"
              className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Most-asked.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <Accordion type="single" collapsible className="mt-12">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq._id}
                  value={faq._id}
                  className="border-b border-[var(--color-border)]"
                >
                  <AccordionTrigger className="text-left py-6">
                    <span
                      className="font-display font-medium text-[var(--color-text-primary)] leading-[1.3]"
                      style={{ fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)" }}
                    >
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-1">
                    <PortableText value={faq.answer} components={portableTextComponents} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>

          <FadeUp delay={0.5}>
            <Link
              href="/faq"
              className="mt-10 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
              data-cta="faq-preview-all"
            >
              See all 12 questions
              <span aria-hidden="true">→</span>
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
