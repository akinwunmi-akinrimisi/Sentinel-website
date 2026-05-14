import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center bg-[var(--color-surface)] px-6 py-24 md:py-32"
      >
        <div className="max-w-[36rem] text-center">
          <div
            aria-hidden="true"
            className="font-display font-medium tracking-[-0.04em] leading-none text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
          >
            404
          </div>
          <h1 className="mt-2 font-display text-2xl md:text-3xl font-medium tracking-[-0.015em] text-[var(--color-text-primary)]">
            Page not found.
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
            The page you&rsquo;re looking for either doesn&rsquo;t exist or has moved. Our enterprise certification programs are still where you left them.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="btn-primary"
              data-cta="not-found-primary"
            >
              Request a Proposal
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/"
              className="btn-secondary"
              data-cta="not-found-secondary"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
