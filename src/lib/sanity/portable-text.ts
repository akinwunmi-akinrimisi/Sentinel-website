import type { PortableTextBlock } from 'next-sanity'

interface PortableTextChild {
  _type?: string
  text?: string
}

interface PortableTextWithChildren {
  children?: PortableTextChild[]
}

/**
 * Concatenates the plain-text contents of a Portable Text array. Used on the
 * homepage's program cards to show a 2-line summary of `whoNeedsIt` without
 * pulling in `<PortableText>` (which would force the card to a client boundary
 * for styling). Newlines join blocks; multiple spans inside a block are
 * concatenated without a separator.
 *
 * Intentionally simple — no mark handling, no list bullets, no link annotation.
 * The homepage card visually clamps to 2 lines via Tailwind, so anything past
 * the first few sentences is invisible anyway.
 */
export function portableTextToPlain(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks || blocks.length === 0) return ''
  return blocks
    .map((block) => {
      const b = block as unknown as PortableTextWithChildren
      if (!b.children) return ''
      return b.children
        .filter((child) => child._type === 'span' && typeof child.text === 'string')
        .map((child) => child.text)
        .join('')
    })
    .filter((line) => line.length > 0)
    .join('\n')
}
