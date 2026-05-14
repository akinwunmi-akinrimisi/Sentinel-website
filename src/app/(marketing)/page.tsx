import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { SentinelSystem } from "@/components/sections/SentinelSystem"
import { fetchHomepageData } from "@/lib/sanity/queries"
import {
  FALLBACK_CLIENT_LOGOS,
  FALLBACK_COMPANY_STATS,
  FALLBACK_HERO_PRESS,
} from "@/lib/sanity/fallbacks"

export const metadata: Metadata = {
  title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.",
}

/** ISR — page rebuilds in background every hour, or immediately when /api/revalidate fires. */
export const revalidate = 3600

export default async function HomePage() {
  const data = await fetchHomepageData()

  const stats = data.companyStats ?? FALLBACK_COMPANY_STATS

  const heroPress = data.heroPress.length > 0 ? data.heroPress : FALLBACK_HERO_PRESS
  const pressOutlets = heroPress.map((p) => p.outletName)

  const clientLogos = data.clientLogos.length > 0 ? data.clientLogos : FALLBACK_CLIENT_LOGOS
  const clientLabels = clientLogos.map((c) => c.anonymizedAs ?? c.companyName)

  return (
    <>
      <Hero stats={stats} pressOutlets={pressOutlets} />
      <TrustBar
        enterpriseClients={stats.enterpriseClients}
        clientLabels={clientLabels}
      />
      <SentinelSystem />
    </>
  )
}
