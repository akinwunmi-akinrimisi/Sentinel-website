import { createClient, type ClientConfig } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const SHARED: Pick<ClientConfig, 'projectId' | 'dataset' | 'apiVersion'> = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
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

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source)
