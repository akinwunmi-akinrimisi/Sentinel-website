// src/components/layout/Footer.tsx
import Link from "next/link"

const NAV_COLUMNS = [
  {
    heading: "Programs",
    links: [
      { href: "/programs/security-plus", label: "CompTIA Security+" },
      { href: "/programs/cysa-plus", label: "CompTIA CySA+" },
      { href: "/programs/casp-plus", label: "CompTIA CASP+" },
      { href: "/#programs", label: "All Programs" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { href: "/industries/financial-services", label: "Financial Services" },
      { href: "/industries/healthcare", label: "Healthcare" },
      { href: "/industries/government-defense", label: "Government & Defense" },
      { href: "/#industries", label: "All Industries" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/#results", label: "Case Studies" },
      { href: "/#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/ccpa", label: "CCPA" },
] as const

const PRESS_LOGOS = ["SC Magazine", "Dark Reading", "CyberScoop"] as const
const ACCREDITATIONS = [
  "CompTIA Authorized Partner",
  "IACET Authorized Provider",
  "MBE Certified",
] as const

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
    >
      <div className="container-sentinel py-16 space-y-12">
        {/* Top grid — brand + 3 nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link
              href="/"
              aria-label="Sentinel Institute home"
              className="font-display text-lg font-medium tracking-[-0.015em] text-[var(--color-text-primary)]"
            >
              Sentinel Institute
            </Link>
            <p className="mt-3 text-[0.8125rem] leading-relaxed max-w-[28ch]">
              Where Enterprise Security Teams Get Certified.
            </p>
            <address className="mt-5 not-italic text-[0.75rem] leading-relaxed">
              <a
                href="mailto:training@sentinelinstitute.com"
                className="hover-underline text-[var(--color-text-primary)]"
              >
                training@sentinelinstitute.com
              </a>
              <br />
              <a href="tel:+13125550194" className="hover-underline">
                +1 (312) 555-0194
              </a>
              <br />
              200 W. Monroe Street, Suite 1900
              <br />
              Chicago, IL 60606
            </address>
          </div>

          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-accent-light)]">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[0.8125rem]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover-underline hover:text-[var(--color-text-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Accreditations + press band */}
        <div className="border-t border-[var(--color-border)] pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ul aria-label="Accreditations" className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            {ACCREDITATIONS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <ul aria-label="Press" className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            <li className="opacity-60">As featured in</li>
            {PRESS_LOGOS.map((p) => (
              <li key={p} className="text-[var(--color-text-secondary)]">{p}</li>
            ))}
          </ul>
        </div>

        {/* Bottom legal strip */}
        <div className="border-t border-[var(--color-border)] pt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} Sentinel Institute LLC</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[var(--color-text-secondary)] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
