import type { NextConfig } from "next"

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.sanity.io https://www.google.com",
  "frame-src https://js.stripe.com https://cal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
