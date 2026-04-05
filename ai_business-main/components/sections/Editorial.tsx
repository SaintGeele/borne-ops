"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * EDITORIAL SECTION — APPYCAMPER-INSPIRED REFINEMENT v3
 * ─────────────────────────────────────────────────────
 * Section feel: "Chapter 1 — The Company"
 *
 * v3 CHANGES:
 *   · Silkscreen counter "01" accent applied to section number
 *   · Subtle section-entrance parallax: content drifts up slightly as section enters viewport
 *   · Right-column image replaced with abstract dark workstation ambient (more on-brand)
 *   · Philosophy statement upgraded to stronger editorial voice
 *   · Stat tags now use Silkscreen for the marker dots / separators
 *   · Section has a slight clip-mask entrance on the right ambient image
 *
 * Reveal order (staggered, editorial pacing):
 *   1. Silkscreen counter "01" fades in (0ms)
 *   2. Vertical line grows (80ms)
 *   3. Vertical label "About" fades (160ms)
 *   4. Section label "The Company" fades (0ms, right col)
 *   5. Headline phrase 1 slides up from mask (80ms)
 *   6. Headline phrase 2 italic slides up (200ms)
 *   7. Body copy fades + slides up (320ms)
 *   8. CTA link slides up (500ms)
 *   9. Stats row fades in (680ms)
 *   10. Individual stat tags stagger (740ms + 60ms each)
 */

const statTags = [
  "Security-First",
  "Reliable Systems",
  "Built to Scale",
  "Automation Ready",
  "Future-Focused",
]

export function Editorial() {
  const ref = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const isInView = useInView(ref, {
    once: true,
    margin: "-100px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Section entry: stronger parallax for the first "chapter turn" from hero
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })
  const sectionY = useTransform(scrollYProgress, [0, 1], [60, 0])
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.4], [0.78, 1])

  return (
    <motion.section
      id="about"
      ref={ref}
      style={{
        position: "relative",
        paddingTop: "clamp(96px, 11vw, 180px)",
        paddingBottom: "clamp(96px, 11vw, 180px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        y: sectionY,
        opacity: sectionOpacity,
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      {/* ── Ambient background image — moody dark workstation at ultra-low opacity ── */}
      <div
        ref={imageRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "45%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* v15: humanized tech — hands working at a warm-lit laptop.
             More personal, approachable. Same ultra-low opacity editorial treatment. */}
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center 40%",
            opacity: 0.065,
          }}
          sizes="45vw"
          aria-hidden="true"
        />
        {/* Dark editorial veil — same treatment as Hero card overlays */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(8,11,16,1) 0%, rgba(8,11,16,0.6) 35%, rgba(8,11,16,0.3) 100%)",
          }}
        />
        {/* Brand accent tint from bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(77,127,255,0.04) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Subtle right-side glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "35%",
          height: "100%",
          background:
            "radial-gradient(ellipse at right center, rgba(77,127,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        className="editorial-grid"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "clamp(40px, 12%, 120px) 1fr",
          gap: "clamp(24px, 4vw, 64px)",
          alignItems: "start",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── Left column: Silkscreen counter + vertical rule + label ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            paddingTop: "6px",
          }}
        >
          {/* Silkscreen section counter — pixel accent for tiny label metadata */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0, ease: EASE_OUT_EXPO }}
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "10px",
              letterSpacing: "0.06em",
              color: "var(--bs-accent)",
              lineHeight: 1,
            }}
          >
            01
          </motion.span>

          {/* Vertical rule — grows from height 0 */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.10, ease: EASE_OUT_EXPO }}
            style={{
              width: "1px",
              height: "48px",
              background:
                "linear-gradient(to bottom, rgba(77,127,255,0.4), rgba(255,255,255,0.06))",
              transformOrigin: "top center",
            }}
          />

          {/* Vertical label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.20, ease: EASE_OUT_EXPO }}
            className="vertical-label text-label"
            style={{ color: "rgba(240,242,245,0.25)", fontSize: "10px" }}
          >
            About
          </motion.span>
        </div>

        {/* ── Right column: editorial body ── */}
        <div>
          {/* Section label — Space Grotesk for readability */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "var(--bs-accent)", marginBottom: "40px" }}
          >
            The Company
          </motion.p>

          {/* Editorial headline — TWO phrases, each revealed via overflow mask */}
          {/* Phrase 1: "Built for Security." */}
          <div style={{ overflow: "hidden" }}>
            <motion.p
              initial={{ opacity: 0, y: "60%" }}
              animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "60%" }}
              transition={{ duration: 0.95, delay: 0.10, ease: EASE_OUT_EXPO }}
              className="text-editorial"
              style={{
                color: "var(--bs-white)",
                maxWidth: "760px",
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              Built for Security.
            </motion.p>
          </div>

          {/* Phrase 2: "Designed for Growth." — italic Funnel Display, premium editorial feel */}
          <div style={{ overflow: "hidden", marginBottom: "32px" }}>
            <motion.p
              initial={{ opacity: 0, y: "60%" }}
              animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "60%" }}
              transition={{ duration: 0.95, delay: 0.22, ease: EASE_OUT_EXPO }}
              className="text-editorial"
              style={{
                color: "var(--bs-white)",
                maxWidth: "760px",
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              <span
                style={{
                  fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "inherit",
                  letterSpacing: "-0.015em",
                }}
              >
                Designed for Growth.
              </span>
            </motion.p>
          </div>

          {/* Body copy — Space Grotesk for readability */}
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.90, delay: 0.36, ease: EASE_OUT_EXPO }}
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              color: "var(--bs-white-dim)",
              maxWidth: "680px",
              marginBottom: "48px",
            }}
          >
            Borne Systems helps businesses build stronger technology foundations through practical
            IT, cybersecurity, and automation solutions. We focus on creating secure, reliable,
            and future-ready systems that support growth and long-term success.
          </motion.p>

          {/* CTA link */}
          <motion.a
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.80, delay: 0.54, ease: EASE_OUT_EXPO }}
            href="#contact"
            className="text-link"
          >
            Work with us
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      </div>

      {/* ── Editorial stats row — staggered tags with Silkscreen dot separators ── */}
      <div
        className="stat-tags-row"
        style={{
          maxWidth: "1440px",
          margin: "clamp(40px, 6vw, 72px) auto 0",
          paddingTop: "28px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "0",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 2,
        }}
      >
        {statTags.map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{
              duration: 0.65,
              delay: 0.70 + i * 0.07,
              ease: EASE_OUT_EXPO,
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
            }}
          >
            <span
              className="text-counter"
              style={{
                color: "rgba(240,242,245,0.22)",
                fontSize: "11px",
                padding: "0 28px 0 (i === 0 ? 0 : 28px)",
                paddingLeft: i === 0 ? "0" : "28px",
                paddingRight: "28px",
              }}
            >
              {tag}
            </span>
            {/* Silkscreen dot separator — pixel accent between tags */}
            {i < statTags.length - 1 && (
              <span
                style={{
                  fontFamily: "'Silkscreen', monospace",
                  fontSize: "8px",
                  color: "rgba(77,127,255,0.25)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                ·
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
