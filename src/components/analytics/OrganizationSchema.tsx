const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelinstitute.com"

/**
 * Organization schema (JSON-LD) for the homepage. Required for Google's
 * Knowledge Graph + rich result eligibility. The schema is static — no Sanity
 * lookup — because organization metadata is a brand-level constant.
 */
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sentinel Institute",
    legalName: "Sentinel Institute LLC",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    description:
      "Enterprise cybersecurity certification training — CompTIA Security+, CySA+, CASP+ — with a documented 96% first-attempt pass rate and a no-pass, re-train guarantee.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "200 W. Monroe Street, Suite 1900",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60606",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Sales",
      email: "training@sentinelinstitute.com",
      telephone: "+1-312-555-0194",
      areaServed: "US",
      availableLanguage: ["en"],
    },
    sameAs: [
      "https://www.linkedin.com/company/sentinel-institute",
    ],
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify on a static literal object — no user input, no XSS surface.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
