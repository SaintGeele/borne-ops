"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * METRICS / PROOF SECTION — v2 PREMIUM REFINEMENT
 * ───────────────────────────────────────────────────────────────────────────
 * v2 CHANGES:
 *   · Replaced city image with aerial highway network at dusk — warmer, more premium scale
 *   · Stronger top fade on image — seamless transition from above
 *   · Switched to fixed 4-column grid on large screens (no reflow)
 *   · Added left border accents on metrics 2–4 (thin editorial separator)
 *   · Added metric value underline accent (thin blue line, 60% width)
 *   · Increased quote font size + brightness — more editorial weight
 *   · Context text increased to 14px
 *   · Section entrance: increased parallax to 50px for stronger chapter pacing
 *   · Image parallax travel: increased from [-30, 30] to [-50, 50] for cinematic depth
 */

const metrics = [
  {
    value: "100%",
    label: "uptime SLA",
    context: "Zero excuses on reliability.",
  },
  {
    value: "3×",
    label: "faster response",
    context: "vs. average SMB IT vendors.",
  },
  {
    value: "< 48h",
    label: "implementation",
    context: "From kickoff to live systems.",
  },
  {
    value: "0",
    label: "data breaches",
    context: "For all clients on our managed program.",
  },
]

export function MetricsSection() {
  const ref = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const isInView = useInView(ref, {
    once: true,
    margin: "-80px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Section-entrance parallax — stronger than previous sections for pacing rhythm
  const { scrollYProgress: sectionScrollY } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })
  const sectionY = useTransform(sectionScrollY, [0, 1], [50, 0])
  const sectionOpacity = useTransform(sectionScrollY, [0, 0.45], [0.80, 1])

  // Image parallax — deeper travel for more cinematic atmosphere
  const { scrollYProgress: imageScrollY } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  })
  const imageY = useTransform(imageScrollY, [0, 1], [-50, 50])

  return (
    <section
      id="results"
      ref={ref}
      style={{
        position: "relative",
        paddingTop: "clamp(80px, 10vw, 160px)",
        paddingBottom: "clamp(80px, 10vw, 160px)",
        overflow: "hidden",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      {/* ── Subtle ambient glow ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(77,127,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        style={{ maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 1, y: sectionY, opacity: sectionOpacity }}
      >
        {/* ── Section header ── */}
        <div
          className="section-header-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(40px, 7vw, 96px)",
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
            04
          </motion.span>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "rgba(240,242,245,0.35)", flexShrink: 0 }}
          >
            The Results
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
              Outcomes &amp; Proof
            </motion.h2>
          </div>
        </div>

        {/* ── Wide atmospheric image — aerial highway network at dusk ── */}
        <div
          ref={imageRef}
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(200px, 28vw, 400px)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "clamp(56px, 7vw, 88px)",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: "-10%",
              y: imageY,
              willChange: "transform",
            }}
          >
            {/* v15: Aerial highway interchange at dusk — warm amber + blue twilight.
                 Communicates scale, connectivity, and precision at a human level.
                 Replaced city night (cold) with warm dusk tone (premium, aspirational). */}
            <Image
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1800&q=85"
              alt="Aerial highway network — connected systems at scale"
              fill
              style={{ objectFit: "cover", objectPosition: "center 50%" }}
              sizes="100vw"
            />
            {/* Dark editorial overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(145deg, rgba(8,11,16,0.58) 0%, rgba(8,11,16,0.20) 60%, rgba(8,11,16,0.42) 100%)",
              }}
            />
            {/* Brand accent tint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(77,127,255,0.09) 0%, transparent 50%)",
              }}
            />
          </motion.div>

          {/* Strong top fade — bridges from section header */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "30%",
              background: "linear-gradient(to bottom, rgba(8,11,16,0.55), transparent)",
              zIndex: 1,
            }}
          />
          {/* Bottom fade to page */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(to bottom, transparent, rgba(8,11,16,0.72))",
              zIndex: 1,
            }}
          />
        </div>

        {/* ── Metrics row — fixed 4-column editorial grid ── */}
        <div
          className="metrics-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(24px, 4vw, 48px)",
            paddingBottom: "clamp(40px, 5vw, 64px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              transition={{
                duration: 0.90,
                delay: 0.20 + i * 0.10,
                ease: EASE_OUT_EXPO,
              }}
              style={{
                // Left border accent on metrics 2–4 (editorial separator)
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                paddingLeft: i > 0 ? "clamp(16px, 3vw, 40px)" : "0",
              }}
            >
              {/* Metric value — Funnel Display large editorial number */}
              <div style={{ overflow: "hidden", marginBottom: "16px" }}>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={isInView ? { y: "0%" } : { y: "100%" }}
                  transition={{
                    duration: 1.0,
                    delay: 0.25 + i * 0.10,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="metric-underline"
                  style={{
                    fontFamily: "'Funnel Display', system-ui, sans-serif",
                    fontSize: "clamp(40px, 4.5vw, 72px)",
                    fontWeight: 700,
                    color: "var(--bs-white)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.03em",
                    display: "inline-block",
                  }}
                >
                  {metric.value}
                </motion.div>
              </div>

              {/* Metric label — Silkscreen pixel font for metadata annotation */}
              <div
                style={{
                  fontFamily: "'Silkscreen', monospace",
                  fontSize: "9px",
                  color: "var(--bs-accent)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                {metric.label}
              </div>

              {/* Context — Space Grotesk body */}
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.62,
                  color: "rgba(240,242,245,0.42)",
                  margin: 0,
                  maxWidth: "200px",
                }}
              >
                {metric.context}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Philosophy statement — more editorial weight ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 1.0, delay: 0.70, ease: EASE_OUT_EXPO }}
          style={{
            paddingTop: "clamp(36px, 4.5vw, 56px)",
          }}
        >
          <p
            style={{
              fontFamily: "'Funnel Display', system-ui, sans-serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(20px, 2.2vw, 30px)",
              lineHeight: 1.4,
              color: "rgba(240,242,245,0.52)",
              maxWidth: "680px",
              letterSpacing: "-0.01em",
            }}
          >
            "Small businesses deserve the same technology as Fortune 500 companies.
            We exist to close that gap — without the enterprise price tag."
          </p>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "1px",
                background: "rgba(77,127,255,0.42)",
              }}
            />
            <span
              className="text-label"
              style={{ color: "rgba(240,242,245,0.28)", fontSize: "10px" }}
            >
              Borne Systems
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
