import { createClient, type ClientConfig } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
if (!projectId) {
  // Dev: surface misconfiguration loudly. Prod: degrade gracefully — safeFetch
  // in queries.ts catches the Sanity client's downstream error, and the page
  // falls back to constants in fallbacks.ts (spec §7 — page never returns 500).
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Did you run `pnpm dlx sanity@latest init`?'
    )
  }
  console.error(
    '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set in production — page will render fallback constants from src/lib/sanity/fallbacks.ts.'
  )
}

// '@sanity/client' validates projectId synchronously in its constructor and
// throws if the value is an empty string. When projectId is missing (dev
// misconfiguration or build without real env), we pass a placeholder so the
// module loads cleanly; actual fetches will fail at request time and
// `safeFetch` in queries.ts will catch them, falling back to constants.
const SHARED: Pick<ClientConfig, 'projectId' | 'dataset' | 'apiVersion'> = {
  projectId: projectId || 'uninitialised-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-10-01',
}

/**
 * Public read client — CDN-cached, anonymous. Used by `fetchHomepageData` for
 * the standard read path. Safe to import into server components.
 */
export const sanityClient = createClient({
  ...SHARED,
  useCdn: true,
})

/**
 * Server-only write/read-token client. Use ONLY inside route handlers, server
 * components, or build-time scripts. Reads from the live API (no CDN cache),
 * which is needed when the request must reflect the very latest publish.
 *
 * Never import this into a `"use client"` file — the token would leak.
 */
export const sanityServerClient = createClient({
  ...SHARED,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const builder = createImageUrlBuilder(sanityClient)
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source)
