import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Proposal Received — Sentinel Institute",
  description: "Your proposal request has been received. We respond within 1 business day.",
  robots: "noindex,nofollow",
}

export default function ThanksPage() {
  return (
    <section className="py-20 md:py-32 bg-[var(--color-surface)] print:bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: black !important; }
              a { color: black !important; text-decoration: underline; }
              .no-print { display: none !important; }
            }
          `,
        }}
      />
      <div className="container-sentinel">
        <div className="max-w-[42rem] mx-auto">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)] print:text-black font-medium">
            Confirmation · Proposal Received
          </p>
          <h1
            className="mt-5 font-display font-medium tracking-[-0.015em] leading-[1.05] text-[var(--color-text-primary)] print:text-black"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            We received your request.
          </h1>
          <p className="mt-6 text-[var(--color-text-secondary)] print:text-black max-w-[44ch] leading-relaxed">
            A senior advisor will review your requirements and respond within one business day
            with a tailored proposal. You&apos;ll also receive a confirmation email shortly with a
            direct link to book a discovery call.
          </p>

          <div className="mt-10 pt-8 border-t border-[var(--color-border)] print:border-black/30">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)] print:text-black mb-3">
              Next steps
            </p>
            <ol className="space-y-3 text-[var(--color-text-secondary)] print:text-black list-decimal pl-5">
              <li>Check your inbox for our confirmation email (within 60 seconds).</li>
              <li>Optionally book a 20-minute discovery call from the email.</li>
              <li>We&apos;ll send your tailored proposal within 1 business day.</li>
            </ol>
          </div>

          <div className="mt-12 flex flex-wrap gap-4 no-print">
            <Link href="/" className="btn-secondary" data-cta="thanks-home">
              Back to home
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-cta="thanks-book"
            >
              Book a discovery call
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
