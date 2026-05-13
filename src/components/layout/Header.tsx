// src/components/layout/Header.tsx
import Link from "next/link"

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/industries", label: "Industries" },
  { href: "/results", label: "Results" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/70">
      <div className="container-sentinel flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label="Sentinel Institute home"
          className="font-display text-[1.0625rem] font-medium tracking-[-0.015em] text-[var(--color-text-primary)] hover:text-[var(--color-accent-light)] transition-colors"
        >
          Sentinel Institute
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors hover-underline"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="btn-primary"
          data-cta="header-primary"
        >
          Request a Proposal
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  )
}
