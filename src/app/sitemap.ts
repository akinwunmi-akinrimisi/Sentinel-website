// src/app/sitemap.ts
import type { MetadataRoute } from "next"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelinstitute.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Future PRs add /programs, /industries, /results, /about, /faq, /contact.
    // They append themselves to this list when they ship.
  ]
}
