import { NavBar } from "@/components/layout/NavBar"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { Hero } from "@/components/sections/Hero"
import { Editorial } from "@/components/sections/Editorial"
import { FeaturedProject } from "@/components/sections/FeaturedProject"
import { ShowcaseGrid } from "@/components/sections/ShowcaseGrid"
import { MetricsSection } from "@/components/sections/MetricsSection"
import { FounderSection } from "@/components/sections/FounderSection"
import { CTASection } from "@/components/sections/CTASection"

/*
 * PAGE STRUCTURE — APPYCAMPER-INSPIRED CHAPTER FLOW
 * ───────────────────────────────────────────────────
 * Chapter 00 — Hero (floating editorial image cloud, left-anchored)
 * Chapter 01 — The Company (editorial intro statement, philosophy)
 * Chapter 02 — The Product (featured AI Receptionist, large visual-led)
 * Chapter 03 — Services & Products (showcase grid, capabilities)
 * Chapter 04 — Outcomes & Proof (metrics, trust-building)
 * Chapter 05 — The Founder (positioning, bio, credentials)
 * Chapter 06 — Let's Build (elegant final CTA)
 *
 * Each section is a chapter — intentional narrative progression.
 * Typography: Funnel Display (display) + Silkscreen (pixel accents) + Space Grotesk (body)
 */

export default function Home() {
  return (
    <>
      <NavBar />
      <main style={{ backgroundColor: "#080b10", minHeight: "100vh" }}>
        <Hero />
        <Editorial />
        <FeaturedProject />
        <ShowcaseGrid />
        <MetricsSection />
        <FounderSection />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  )
}
