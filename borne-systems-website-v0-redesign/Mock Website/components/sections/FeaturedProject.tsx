"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * FEATURED PROJECT SECTION — APPYCAMPER-INSPIRED REFINEMENT v3
 * ─────────────────────────────────────────────────────────────
 * Section feel: "Chapter 2 — The Product"
 *
 * v3 CHANGES:
 *   · Silkscreen counter "02" for section number
 *   · Section-entrance parallax: content enters with subtle upward drift
 *   · Image replaced: abstract voice waveform → dark device/phone moody composition
 *     showing a modern smartphone in a dark premium environment — humanized tech
 *   · Clip-path wipe entrance preserved (cinematic entrance still works well)
 *   · Stats section: Silkscreen used for stat values (they're metadata/counters)
 *   · Image parallax: travel increased to [-50, 50] for more visible cinematic depth
 *
 * Reveal order (staggered, chapter pacing):
 *   1. Silkscreen counter "02" fades in (0ms)
 *   2. Label "Featured Product" fades in (80ms)
 *   3. Heading slides up from mask (140ms)
 *   4. Product label fades up (220ms)
 *   5. Image: clip-path wipes left→right (300ms)
 *   6. Description text fades + slides up (500ms)
 *   7. Capability tags stagger in (600ms + 40ms each)
 *   8. CTA link slides up (720ms)
 *   9. Stats: each staggered (640ms + 80ms each)
 */

const stats = [
  { value: "24/7",  label: "Availability" },
  { value: "< 1s",  label: "Response time" },
  { value: "∞",     label: "Concurrent calls" },
]

const capabilityTags = [
  "24/7 Availability",
  "Call Handling",
  "Lead Qualification",
  "Appointment Scheduling",
  "Custom Voice",
]

export function FeaturedProject() {
  const ref = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageParallaxRef = useRef<HTMLDivElement>(null)

  const isInView = useInView(ref, {
    once: true,
    margin: "-80px 0px" as Parameters<typeof useInView>[1]["margin"],
  })
  const isImageInView = useInView(imageRef, {
    once: true,
    margin: "-60px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Section-entrance: slight variation from ch01 for rhythmic pacing
  const { scrollYProgress: sectionScrollY } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })
  const sectionEntryY = useTransform(sectionScrollY, [0, 1], [50, 0])
  const sectionEntryOpacity = useTransform(sectionScrollY, [0, 0.45], [0.82, 1])

  // Scroll-driven parallax on the image — image drifts upward as you scroll through
  const { scrollYProgress: imageScrollY } = useScroll({
    target: imageParallaxRef,
    offset: ["start end", "end start"],
  })
  const imageParallaxY = useTransform(imageScrollY, [0, 1], [-50, 50])

  return (
    <section
      id="products"
      ref={ref}
      style={{
        position: "relative",
        paddingTop: "clamp(80px, 10vw, 160px)",
        paddingBottom: "clamp(80px, 10vw, 160px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      <motion.div
        style={{ maxWidth: "1440px", margin: "0 auto", y: sectionEntryY, opacity: sectionEntryOpacity }}
      >

        {/* ── Section header row ── */}
        <div
          className="section-header-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(28px, 6vw, 80px)",
            flexWrap: "wrap",
          }}
        >
          {/* Silkscreen counter — pixel font for section number metadata */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0, ease: EASE_OUT_EXPO }}
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "10px",
              color: "var(--bs-accent)",
              letterSpacing: "0.06em",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            02
          </motion.span>

          {/* Label — Space Grotesk */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "rgba(240,242,245,0.35)", flexShrink: 0 }}
          >
            Featured Product
          </motion.p>

          {/* Heading — Funnel Display overflow mask reveal */}
          <div style={{ overflow: "hidden" }}>
            <motion.h2
              initial={{ opacity: 0, y: "100%" }}
              animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "100%" }}
              transition={{ duration: 1.0, delay: 0.14, ease: EASE_OUT_EXPO }}
              className="text-display-lg"
              style={{ color: "var(--bs-white)", lineHeight: 1 }}
            >
              AI Receptionist
            </motion.h2>
          </div>
        </div>

        {/* ── Product label + image block ── */}
        <div style={{ position: "relative" }}>
          {/* Product label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.80, delay: 0.22, ease: EASE_OUT_EXPO }}
            style={{
              position: "relative",
              zIndex: 2,
              marginBottom: "-36px",
              paddingLeft: "2px",
            }}
          >
            <span
              className="text-label"
              style={{ color: "var(--bs-accent)", display: "block", marginBottom: "8px" }}
            >
              Borne AI · Product
            </span>
          </motion.div>

          {/* ── Full-bleed media block — clip-path wipe + scroll parallax ── */}
          <motion.div
            ref={imageRef}
            initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
            animate={
              isImageInView
                ? { clipPath: "inset(0 0% 0 0)", opacity: 1 }
                : { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }
            }
            transition={{ duration: 1.5, delay: 0.08, ease: EASE_OUT_EXPO }}
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(280px, 42vw, 600px)",
              borderRadius: "0px",
              overflow: "hidden",
            }}
          >
            {/* Parallax wrapper — image moves slower than the page */}
            <motion.div
              ref={imageParallaxRef}
              style={{
                position: "absolute",
                inset: "-10%",
                y: imageParallaxY,
                willChange: "transform",
              }}
            >
              {/*
               * REPLACED: abstract voice waveform → moody dark phone ambient composition
               * A premium smartphone in a dark environment — suggests AI communication
               * technology in a human, accessible way. No waveform gimmicks.
               * Premium, editorial, approachable. Communicates: "smart, silent, always working."
               */}
              {/* v15: refined objectPosition for more intentional, less abstract crop */}
              <Image
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=85"
                alt="Modern smartphone in dark environment — AI Receptionist, always available"
                fill
                style={{ objectFit: "cover", objectPosition: "center 30%" }}
                sizes="100vw"
                priority
              />
              {/* Editorial tint */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(145deg, rgba(8,11,16,0.38) 0%, transparent 60%)",
                  zIndex: 0,
                }}
              />
              {/* Brand accent tint */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(77,127,255,0.12) 0%, transparent 55%)",
                  zIndex: 0,
                }}
              />
            </motion.div>

            {/* Bottom gradient so text can overlap */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(8,11,16,0) 40%, rgba(8,11,16,0.72) 100%)",
                zIndex: 1,
              }}
            />
            {/* Left vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(8,11,16,0.35) 0%, transparent 40%)",
                zIndex: 1,
              }}
            />
          </motion.div>
        </div>

        {/* ── Below image: description + stats ── */}
        <div
          className="two-col-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr clamp(180px, 30%, 360px)",
            gap: "clamp(24px, 5vw, 80px)",
            marginTop: "clamp(24px, 4vw, 56px)",
            alignItems: "start",
          }}
        >
          {/* Description column */}
          <div>
            {/* Body copy — Space Grotesk */}
            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.90, delay: 0.48, ease: EASE_OUT_EXPO }}
              style={{
                fontSize: "17px",
                lineHeight: 1.7,
                color: "var(--bs-white-dim)",
                maxWidth: "560px",
                marginBottom: "32px",
              }}
            >
              Your 24/7 front desk — powered by AI. Handles calls, schedules appointments,
              qualifies leads, and routes inquiries. Never miss a customer again.
              Professional, consistent, always on.
            </motion.p>

            {/* Capability tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              {capabilityTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.58 + i * 0.05,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="text-counter"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(240,242,245,0.45)",
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* CTA */}
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.75, delay: 0.80, ease: EASE_OUT_EXPO }}
              href="#contact"
              className="text-link"
            >
              Request a demo
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

          {/* Stats block — Silkscreen for stat values (they're numeric metadata) */}
          <div
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              paddingLeft: "clamp(20px, 3vw, 40px)",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
            className="hidden lg:flex"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 24 }}
                animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{
                  duration: 0.85,
                  delay: 0.60 + i * 0.10,
                  ease: EASE_OUT_EXPO,
                }}
              >
                {/* Stat number — Silkscreen for precision metric accent */}
                <div style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={isImageInView ? { y: "0%" } : { y: "100%" }}
                    transition={{
                      duration: 0.90,
                      delay: 0.65 + i * 0.10,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{
                      fontFamily: "'Funnel Display', system-ui, sans-serif",
                      fontSize: "clamp(36px, 3.5vw, 52px)",
                      fontWeight: 600,
                      color: "var(--bs-white)",
                      lineHeight: 0.95,
                      letterSpacing: "-0.025em",
                      marginBottom: "8px",
                    }}
                  >
                    {stat.value}
                  </motion.div>
                </div>

                {/* Stat label — Space Grotesk tiny label */}
                <div
                  className="text-label"
                  style={{ color: "rgba(240,242,245,0.30)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
