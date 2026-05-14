import Image from "next/image"
import type { SanityImage } from "@/lib/sanity/types"

interface SanityAvatarProps {
  /** Source image. `image.url` may be empty when rendering fallback data. */
  image: SanityImage
  /** Full name used to derive initials when `image.url` is empty. */
  fullName: string
  /** Pixel diameter — both width and height. */
  size: number
}

function initialsOf(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Circular avatar. Renders <Image> when image.url is set, otherwise a styled
 * div with the subject's initials. Used by <Testimonials> and
 * <CaseStudyFeature> so fallback content (which ships with empty image URLs)
 * still produces a coherent layout.
 */
export function SanityAvatar({ image, fullName, size }: SanityAvatarProps) {
  const dimension = { width: size, height: size }

  if (image.url) {
    return (
      <Image
        src={image.url}
        alt={image.alt || fullName}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={dimension}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="rounded-full shrink-0 flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border)] font-mono uppercase tracking-[0.1em] text-[var(--color-text-secondary)]"
      style={{ ...dimension, fontSize: Math.round(size * 0.32) }}
    >
      {initialsOf(fullName) || "·"}
    </div>
  )
}
