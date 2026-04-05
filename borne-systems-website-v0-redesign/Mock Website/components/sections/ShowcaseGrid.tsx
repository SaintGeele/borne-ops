"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * SHOWCASE GRID — APPYCAMPER-INSPIRED REFINEMENT v4
 * ──────────────────────────────────────────────────────────────────────────
 * Section feel: "Chapter 3 — Services & Products"
 *
 * v4 CHANGES:
 *   · Silkscreen counter "03" for section number
 *   · Section-entrance parallax: section rises into view
 *   · All card bg images replaced with more premium, editorial, humanized tech:
 *     - s1 (Borne Security): dark terminal code — editorial, not intimidating
 *     - s2 (Borne AI): abstract neural network visualization — non-literal AI
 *     - s3 (Borne Labs): flat-lay of components/tools — precision craft
 *     - s4 (Lead Automation): abstract data visualization — flow and connectivity
 *   · Card hover: refined to include a subtle background image opacity lift on hover
 *   · Card number labels now use Silkscreen font
 *
 * Section reveal order:
 *   1. Silkscreen counter "03" fades in
 *   2. Label "What We Offer" fades
 *   3. Heading slides up from mask
 *   4. Right-aligned CTA fades
 *   5. Cards: wave stagger — each delays 100ms per index
 */

interface ServiceCard {
  id: string
  number: string
  name: string
  description: string
  bullets: string[]
  span?: "normal" | "tall"
  bgImage: string
  bgAlt: string
  bgPosition: string
}

const services: ServiceCard[] = [
  {
    id: "s1",
    number: "01",
    name: "Borne Security",
    description:
      "Comprehensive cybersecurity for SMBs — vulnerability assessments, penetration testing, security posture hardening, and continuous monitoring. Defense-in-depth, not afterthought.",
    bullets: ["Penetration Testing", "Vulnerability Assessment", "Security Hardening", "Incident Response"],
    span: "tall",
    // Dark terminal with code — editorial cybersecurity aesthetic.
    // Premium, focused, not intimidating. Technology as craft.
    bgImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=75",
    bgAlt: "",
    bgPosition: "center 20%",
  },
  {
    id: "s2",
    number: "02",
    name: "Borne AI",
    description:
      "Intelligent automation that works while you sleep. Custom AI agents, workflow automation, and decision engines tailored to your business operations.",
    bullets: ["AI Agent Development", "Workflow Automation", "LLM Integration", "Process Intelligence"],
    span: "normal",
    // Abstract neural/neon network — intelligence as art, not cold machinery
    bgImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=75",
    bgAlt: "",
    bgPosition: "center center",
  },
  {
    id: "s3",
    number: "03",
    name: "Borne Labs",
    description:
      "Research and development arm. We prototype, test, and deploy emerging technologies — turning experimental ideas into production-ready tools for your business.",
    bullets: ["R&D Prototyping", "Technology Evaluation", "Custom Tool Development", "Innovation Pipeline"],
    span: "normal",
    // Premium flat-lay of electronic components — precision, craft, artisan R&D
    bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=75",
    bgAlt: "",
    bgPosition: "center 40%",
  },
  {
    id: "s4",
    number: "04",
    name: "Lead Automation",
    description:
      "Automated lead generation, scoring, and nurturing pipeline. Find prospects, enrich their data, score them, and engage — all on autopilot. Turn cold leads into warm conversations.",
    bullets: ["Lead Generation", "Auto-Scoring", "Email Sequences", "CRM Integration"],
    span: "tall",
    // v15: Abstract data flow / digital network visualization — connectivity and intelligence.
    // Replaced concrete texture (which felt cold) with warm network flow (feels connected, alive).
    bgImage: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=75",
    bgAlt: "",
    bgPosition: "center 40%",
  },
]

// ─── ServiceCardItem ───────────────────────────────────────────────────────

function ServiceCardItem({ service, index }: { service: ServiceCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  const isTall = service.span === "tall"
  const duration = isTall ? 1.05 : 0.88
  // v15: Row-aware stagger — tall cards (row 1) enter first, short cards slightly after.
  // Creates asymmetric wave: cards don't all pop in uniformly.
  const baseDelay = index < 2 ? index * 0.12 : 0.20 + (index - 2) * 0.14
  const delay = Math.min(baseDelay, 0.40)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      className={`showcase-card${isTall ? " showcase-card-tall" : ""}`}
      style={{ gridRow: isTall ? "span 2" : "span 1", position: "relative" }}
    >
      {/* ── Ambient background image — card-level art direction ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "12px",
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <Image
          src={service.bgImage}
          alt={service.bgAlt}
          fill
          style={{
            objectFit: "cover",
            objectPosition: service.bgPosition,
            opacity: 0.10,
            transition: "opacity 0.45s ease",
          }}
          sizes="280px"
        />
        {/* Dark editorial veil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(145deg, rgba(8,11,16,0.55) 0%, rgba(8,11,16,0.25) 100%)",
          }}
        />
        {/* Brand accent tint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(77,127,255,0.05) 0%, transparent 55%)",
          }}
        />
      </div>

      <div style={{ padding: "28px 28px 32px", position: "relative", zIndex: 1 }}>

        {/* Silkscreen number + Funnel Display name row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
          {/* Silkscreen pixel font for card number — tiny metadata accent */}
          <span
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "9px",
              color: "var(--bs-accent)",
              letterSpacing: "0.06em",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {service.number}
          </span>
          {/* Funnel Display for service name */}
          <h3
            style={{
              fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--bs-white)",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            {service.name}
          </h3>
        </div>

        {/* Accent rule */}
        <div
          style={{
            width: "32px",
            height: "1px",
            background: "rgba(77,127,255,0.4)",
            marginBottom: "18px",
          }}
        />

        {/* Description — Space Grotesk for body readability */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.65,
            color: "var(--bs-white-dim)",
            marginBottom: "20px",
          }}
        >
          {service.description}
        </p>

        {/* Bullets */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {service.bullets.map((bullet) => (
            <li
              key={bullet}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "rgba(240,242,245,0.45)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "rgba(77,127,255,0.6)",
                  flexShrink: 0,
                }}
              />
              {bullet}
            </li>
          ))}
        </ul>

        {/* CTA link */}
        <div style={{ marginTop: "28px" }}>
          <a href="#contact" className="text-link" style={{ fontSize: "13px" }}>
            Learn more
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

// ─── ShowcaseGrid ──────────────────────────────────────────────────────────

export function ShowcaseGrid() {
  const headerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isHeaderInView = useInView(headerRef, {
    once: true,
    margin: "-100px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Section-entrance parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  })
  const sectionY = useTransform(scrollYProgress, [0, 1], [40, 0])

  return (
    <section
      id="services"
      ref={sectionRef}
      style={{
        position: "relative",
        paddingTop: "clamp(80px, 10vw, 160px)",
        paddingBottom: "clamp(80px, 10vw, 160px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      {/* ── Section-level ambient background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <Image
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=75"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center center",
            opacity: 0.04,
          }}
          sizes="100vw"
        />
        {/* Full-coverage dark editorial veil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8,11,16,0.82)",
          }}
        />
        {/* Brand accent from bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(77,127,255,0.03) 0%, transparent 40%)",
          }}
        />
      </div>

      <motion.div
        style={{ maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 1, y: sectionY }}
      >

        {/* ── Section header ── */}
        <div
          ref={headerRef}
          className="section-header-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(36px, 6vw, 80px)",
            flexWrap: "wrap",
          }}
        >
          {/* Silkscreen counter */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0, ease: EASE_OUT_EXPO }}
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "10px",
              color: "var(--bs-accent)",
              letterSpacing: "0.06em",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            03
          </motion.span>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "rgba(240,242,245,0.35)", flexShrink: 0 }}
          >
            What We Offer
          </motion.p>

          {/* Heading — Funnel Display overflow mask reveal */}
          <div style={{ overflow: "hidden" }}>
            <motion.h2
              initial={{ opacity: 0, y: "100%" }}
              animate={isHeaderInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "100%" }}
              transition={{ duration: 1.0, delay: 0.14, ease: EASE_OUT_EXPO }}
              className="text-display-md"
              style={{ color: "var(--bs-white)" }}
            >
              Services &amp; Products
            </motion.h2>
          </div>

          {/* Right-aligned CTA */}
          <motion.a
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0.30, ease: EASE_OUT_EXPO }}
            href="#contact"
            className="text-link section-header-cta"
            style={{
              marginLeft: "auto",
              fontSize: "13px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Get in touch
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>

        {/* ── Cards grid ── */}
        <div
          className="showcase-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "clamp(12px, 2vw, 20px)",
            gridAutoRows: "auto",
          }}
        >
          {services.map((service, index) => (
            <ServiceCardItem key={service.id} service={service} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
