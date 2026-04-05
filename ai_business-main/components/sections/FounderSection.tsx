"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * FOUNDER / COMPANY POSITIONING SECTION — v2 PREMIUM REFINEMENT
 * ───────────────────────────────────────────────────────────────────────────
 * v2 CHANGES:
 *   · Stronger section entrance: 60px parallax (most personal chapter)
 *   · Large chapter ghost "05" behind content — editorial art direction
 *   · Portrait image: more cinematic, darker frame portrait composition
 *   · Portrait aspect ratio: taller (3/4 vs 4/5) — more editorial format
 *   · Founder name: larger (clamp 36px → 62px vs 32px → 52px)
 *   · Added editorial pull quote between bio paragraphs — human cinematic moment
 *   · Credential tags: hover state with blue tint, slightly larger padding
 *   · Asymmetric column ratio: 1fr 1.4fr (right/story gets more weight)
 *   · Bio text slightly brighter: 0.60 → 0.65 opacity for readability
 */

const credentials = [
  "Marine Corps Veteran",
  "Systems Engineer",
  "OSCP Candidate",
  "BS Information Technology",
  "8+ Years Enterprise IT",
]

export function FounderSection() {
  const ref = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const isInView = useInView(ref, {
    once: true,
    margin: "-80px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  const isImageInView = useInView(imageRef, {
    once: true,
    margin: "-40px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Strongest section entrance — the most personal chapter deserves the deepest entry
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })
  const sectionY = useTransform(scrollYProgress, [0, 1], [60, 0])
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.42], [0.78, 1])

  return (
    <section
      id="founder"
      ref={ref}
      style={{
        position: "relative",
        paddingTop: "clamp(80px, 10vw, 160px)",
        paddingBottom: "clamp(80px, 10vw, 160px)",
        overflow: "hidden",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      {/* ── Large decorative chapter ghost — editorial art direction ── */}
      <div
        className="chapter-ghost"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-0.02em",
          top: "-0.08em",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        05
      </div>

      {/* ── Subtle ambient glow — left side ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "45%",
          height: "100%",
          background:
            "radial-gradient(ellipse at left center, rgba(77,127,255,0.035) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          y: sectionY,
          opacity: sectionOpacity,
        }}
      >
        {/* ── Section header ── */}
        <div
          className="section-header-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(36px, 7vw, 96px)",
            flexWrap: "wrap",
          }}
        >
          {/* Silkscreen counter */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
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
            05
          </motion.span>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "rgba(240,242,245,0.35)", flexShrink: 0 }}
          >
            The Founder
          </motion.p>

          {/* Heading */}
          <div style={{ overflow: "hidden" }}>
            <motion.h2
              initial={{ opacity: 0, y: "100%" }}
              animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "100%" }}
              transition={{ duration: 1.0, delay: 0.14, ease: EASE_OUT_EXPO }}
              className="text-display-md"
              style={{ color: "var(--bs-white)" }}
            >
              Built by Someone Who Gets It
            </motion.h2>
          </div>
        </div>

        {/* ── Two-column layout: image left, story right ── */}
        {/* v15: asymmetric ratio 1fr 1.4fr — story column gets more weight */}
        <div
          className="two-col-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "clamp(32px, 7vw, 100px)",
            alignItems: "start",
          }}
        >
          {/* ── Left: Portrait / editorial image ── */}
          <motion.div
            ref={imageRef}
            initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
            animate={
              isImageInView
                ? { clipPath: "inset(0 0 0% 0)", opacity: 1 }
                : { clipPath: "inset(0 0 100% 0)", opacity: 0.4 }
            }
            transition={{ duration: 1.5, delay: 0.08, ease: EASE_OUT_EXPO }}
            style={{
              position: "relative",
              borderRadius: "4px",
              overflow: "hidden",
              // v15: taller portrait format — 3/4 vs 4/5 — more editorial
              // On mobile (stacked), use a more landscape-ish ratio to conserve vertical space
              aspectRatio: "3 / 4",
              maxHeight: "clamp(280px, 70vw, 600px)",
            }}
          >
            {/* v15: More cinematic, darker-framed portrait.
                 Higher contrast, more editorial. Professional, warm, human. */}
            <Image
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=88"
              alt="Geele Evans — Founder, Borne Systems"
              fill
              style={{ objectFit: "cover", objectPosition: "center 18%" }}
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            {/* Editorial tint — slightly stronger for more cinematic contrast */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(145deg, rgba(8,11,16,0.28) 0%, transparent 55%)",
              }}
            />
            {/* Brand accent tint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(77,127,255,0.10) 0%, transparent 48%)",
              }}
            />
            {/* Bottom fade */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "28%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(8,11,16,0.55))",
              }}
            />

            {/* Silkscreen image meta overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                fontFamily: "'Silkscreen', monospace",
                fontSize: "8px",
                color: "rgba(240,242,245,0.30)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Founder / CEO
            </div>
          </motion.div>

          {/* ── Right: Story content ── */}
          <div style={{ paddingTop: "clamp(0px, 2vw, 32px)" }}>

            {/* Founder name — Funnel Display, larger for more punch */}
            <div style={{ overflow: "hidden", marginBottom: "6px" }}>
              <motion.h3
                initial={{ opacity: 0, y: "80%" }}
                animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "80%" }}
                transition={{ duration: 1.0, delay: 0.20, ease: EASE_OUT_EXPO }}
                style={{
                  fontFamily: "'Funnel Display', system-ui, sans-serif",
                  // v15: larger for more typographic punch
                  fontSize: "clamp(36px, 4vw, 62px)",
                  fontWeight: 700,
                  color: "var(--bs-white)",
                  lineHeight: 0.93,
                  letterSpacing: "-0.028em",
                  margin: 0,
                }}
              >
                Geele Evans
              </motion.h3>
            </div>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.70, delay: 0.32, ease: EASE_OUT_EXPO }}
              className="text-label"
              style={{
                color: "var(--bs-accent)",
                marginBottom: "36px",
              }}
            >
              Founder &amp; CEO, Borne Systems
            </motion.p>

            {/* Accent rule */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.70, delay: 0.38, ease: EASE_OUT_EXPO }}
              style={{
                width: "48px",
                height: "1px",
                background: "rgba(77,127,255,0.42)",
                marginBottom: "28px",
                transformOrigin: "left center",
              }}
            />

            {/* Bio paragraph 1 */}
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.90, delay: 0.44, ease: EASE_OUT_EXPO }}
              style={{
                fontSize: "16px",
                lineHeight: 1.75,
                color: "rgba(240,242,245,0.62)",
                maxWidth: "540px",
                marginBottom: "28px",
              }}
            >
              Marine Corps veteran turned Systems Engineer. 8+ years managing enterprise IT
              in high-stakes military environments — where failure isn't an option and
              security isn't optional.
            </motion.p>

            {/* ── Editorial pull quote — cinematic human moment ── */}
            <motion.blockquote
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.95, delay: 0.54, ease: EASE_OUT_EXPO }}
              style={{
                margin: "0 0 28px 0",
                paddingLeft: "20px",
                borderLeft: "2px solid rgba(77,127,255,0.30)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Funnel Display', system-ui, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(16px, 1.5vw, 22px)",
                  lineHeight: 1.45,
                  color: "rgba(240,242,245,0.50)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                "Every system I build carries the same standard I held in service."
              </p>
            </motion.blockquote>

            {/* Bio paragraph 2 */}
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.90, delay: 0.62, ease: EASE_OUT_EXPO }}
              style={{
                fontSize: "16px",
                lineHeight: 1.75,
                color: "rgba(240,242,245,0.62)",
                maxWidth: "540px",
                marginBottom: "40px",
              }}
            >
              Borne Systems exists because small businesses deserve the same rigor —
              without the enterprise complexity or cost. Every engagement is personal,
              every solution is built to last.
            </motion.p>

            {/* Credentials — staggered tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "44px",
              }}
            >
              {credentials.map((cred, i) => (
                <motion.span
                  key={cred}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.68 + i * 0.07,
                    ease: EASE_OUT_EXPO,
                  }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "11px",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(240,242,245,0.48)",
                    letterSpacing: "0.02em",
                    transition: "background 0.25s ease, border-color 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(77,127,255,0.08)"
                    e.currentTarget.style.borderColor = "rgba(77,127,255,0.22)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                  }}
                >
                  {cred}
                </motion.span>
              ))}
            </div>

            {/* CTA */}
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.80, delay: 0.96, ease: EASE_OUT_EXPO }}
              href="#contact"
              className="text-link"
              style={{ fontSize: "14px" }}
            >
              Let&apos;s talk
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
      </motion.div>
    </section>
  )
}
