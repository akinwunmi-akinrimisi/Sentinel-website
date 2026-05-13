// src/app/(marketing)/page.tsx
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"

export const metadata: Metadata = {
  title: "Sentinel Institute — Where Enterprise Security Teams Get Certified",
  description:
    "Sentinel Institute trains corporate security teams to pass CompTIA Security+, CySA+, and CASP+ on the first attempt — with a no-pass, re-train guarantee built into every contract.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
    </>
  )
}
