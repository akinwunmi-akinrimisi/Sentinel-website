'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'

/**
 * Embeds the Sanity Studio under /studio. The config import path reaches up
 * out of `src/app/studio/[[...tool]]/` to the project root, then into
 * `sanity/sanity.config.ts`.
 */
export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
