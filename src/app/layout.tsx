import type { Metadata } from "next"
import "./globals.css"

// Self-hosted IBM Plex via @fontsource — pulls woff2 from node_modules at build time.
// Importing in the root layout ensures the @font-face declarations are emitted into
// the global CSS bundle once, available to all pages.
import "@fontsource/ibm-plex-serif/400.css"
import "@fontsource/ibm-plex-serif/500.css"
import "@fontsource/ibm-plex-serif/600.css"
import "@fontsource/ibm-plex-sans/400.css"
import "@fontsource/ibm-plex-sans/500.css"
import "@fontsource/ibm-plex-sans/600.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelinstitute.com"),
  title: {
    default: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
    template: "%s · Sentinel Institute",
  },
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract. 96% first-attempt pass rate. 410 professionals certified. 63 enterprise clients.",
  applicationName: "Sentinel Institute",
  authors: [{ name: "Sentinel Institute LLC", url: "https://sentinelinstitute.com" }],
  generator: "Next.js",
  keywords: [
    "CompTIA Security+ training",
    "enterprise cybersecurity certification",
    "CySA+ team training",
    "CASP+ corporate training",
    "HIPAA cybersecurity compliance training",
    "PCI-DSS security training",
    "CMMC certification training",
    "SOC 2 cybersecurity workforce",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sentinel Institute",
    title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
    description:
      "96% first-attempt CompTIA pass rate across 410 certified professionals and 63 enterprise clients.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    site: "@sentinelinst",
    creator: "@sentinelinst",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
