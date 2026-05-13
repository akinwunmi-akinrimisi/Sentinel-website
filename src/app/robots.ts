// src/app/robots.ts
import type { MetadataRoute } from "next"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelinstitute.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Studio (PR 4) and any internal API routes are server-rendered but
        // must not be indexed:
        disallow: ["/studio", "/api/", "/_smoke"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
