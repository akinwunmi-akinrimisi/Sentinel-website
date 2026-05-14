import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { ProblemSection } from "@/components/sections/ProblemSection"
import { ProgramsOverview } from "@/components/sections/ProgramsOverview"
import { SentinelSystem } from "@/components/sections/SentinelSystem"
import { ResultsByProgram } from "@/components/sections/ResultsByProgram"
import { CaseStudyFeature } from "@/components/sections/CaseStudyFeature"
import { Testimonials } from "@/components/sections/Testimonials"
import { IndustriesServed } from "@/components/sections/IndustriesServed"
import { ProposalCTA } from "@/components/sections/ProposalCTA"
import { FAQPreview } from "@/components/sections/FAQPreview"
import { fetchHomepageData } from "@/lib/sanity/queries"
import { portableTextToPlain } from "@/lib/sanity/portable-text"
import {
  FALLBACK_CASE_STUDY,
  FALLBACK_CLIENT_LOGOS,
  FALLBACK_COMPANY_STATS,
  FALLBACK_FAQS,
  FALLBACK_HERO_PRESS,
  FALLBACK_INDUSTRIES,
  FALLBACK_PROGRAMS,
  FALLBACK_TESTIMONIALS,
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

  const rawPrograms = data.allPrograms.length > 0 ? data.allPrograms : FALLBACK_PROGRAMS
  const programs = rawPrograms.map((p) => ({
    slug: p.slug,
    certName: p.certName,
    eyebrow: p.eyebrow,
    oneliner: p.oneliner,
    priceUSD: p.priceUSD,
    durationWeeks: p.durationWeeks,
    sessionsPerWeek: p.sessionsPerWeek,
    whoNeedsItSummary: portableTextToPlain(p.whoNeedsIt),
  }))

  const testimonials = data.homepageTestimonials.length > 0
    ? data.homepageTestimonials
    : FALLBACK_TESTIMONIALS

  const caseStudy = data.featuredCaseStudy ?? FALLBACK_CASE_STUDY

  const industries = data.homepageIndustries.length > 0
    ? data.homepageIndustries
    : FALLBACK_INDUSTRIES

  const faqs = data.homepageFAQs.length > 0 ? data.homepageFAQs : FALLBACK_FAQS

  return (
    <>
      <Hero stats={stats} pressOutlets={pressOutlets} />
      <TrustBar
        enterpriseClients={stats.enterpriseClients}
        clientLabels={clientLabels}
      />
      <ProblemSection />
      <ProgramsOverview programs={programs} />
      <SentinelSystem />
      <ResultsByProgram stats={stats} />
      <CaseStudyFeature caseStudy={caseStudy} />
      <Testimonials testimonials={testimonials} />
      <IndustriesServed industries={industries} />
      <ProposalCTA availableSlots={stats.availableSlots} />
      <FAQPreview faqs={faqs} />
    </>
  )
}
