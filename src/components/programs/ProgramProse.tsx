import type { PortableTextComponents } from "next-sanity"
import Link from "next/link"

export const programProseComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[var(--color-text-secondary)] leading-relaxed mt-4 first:mt-0">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 first:mt-0 font-display text-[1.375rem] font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 first:mt-0 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] font-medium">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-[var(--color-accent-light)] pl-5 italic text-[var(--color-text-secondary)]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 space-y-2 text-[var(--color-text-secondary)] leading-relaxed list-disc pl-6 marker:text-[var(--color-accent-light)]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 space-y-2 text-[var(--color-text-secondary)] leading-relaxed list-decimal pl-6 marker:text-[var(--color-accent-light)] marker:font-mono">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-[var(--color-text-primary)]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href ?? "#"
      const external = /^https?:\/\//.test(href)
      return external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-light)] hover-underline">
          {children}
        </a>
      ) : (
        <Link href={href} className="text-[var(--color-accent-light)] hover-underline">
          {children}
        </Link>
      )
    },
  },
}
