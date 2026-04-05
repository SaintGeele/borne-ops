"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"

// ─── Easing ────────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/*
 * CTA SECTION — APPYCAMPER-INSPIRED REFINEMENT v3
 * ────────────────────────────────────────────────
 * Section feel: "Chapter 6 — Let's Build"
 *
 * v3 CHANGES:
 *   · Silkscreen counter "06" for section number
 *   · Section-entrance parallax for content entry
 *   · Background image replaced with more premium editorial night city / dark ambience
 *   · Form card: refined — "Start a conversation" label now uses Silkscreen
 *   · Section header uses the standard Silkscreen + label + heading row pattern
 *
 * Reveal order (left col first, then right col):
 * LEFT COLUMN:
 *   1. Silkscreen label "06 — Let's Build" fades in (0ms)
 *   2. Headline line 1 slides up from mask (80ms)
 *   3. Headline line 2 italic slides up from mask (220ms)
 *   4. Body copy fades + slides up (400ms)
 *   5. Email link slides up (540ms)
 *
 * RIGHT COLUMN (form card):
 *   6. Card slides up (480ms) — left-then-right chapter feel
 */

export function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px 0px" as Parameters<typeof useInView>[1]["margin"],
  })

  // Section-entrance parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })
  const sectionY = useTransform(scrollYProgress, [0, 1], [40, 0])

  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        position: "relative",
        paddingTop: "clamp(80px, 12vw, 180px)",
        paddingBottom: "clamp(80px, 12vw, 180px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      {/* ── Ambient background image — dark urban / city lights at night ── */}
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
        {/* v15: Warm amber horizon — aspirational, forward-looking, warm dark.
             Replaced cold city night with horizon blur — feels like dawn, possibility.
             Same ultra-low opacity editorial treatment. */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center 55%",
            opacity: 0.07,
          }}
          sizes="100vw"
        />
        {/* Strong vignette left → ensures left column text stays clean */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(8,11,16,0.95) 0%, rgba(8,11,16,0.70) 45%, rgba(8,11,16,0.50) 100%)",
          }}
        />
        {/* Top vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(8,11,16,0.70) 0%, transparent 35%, rgba(8,11,16,0.60) 100%)",
          }}
        />
        {/* Brand accent tint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(77,127,255,0.04) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Ambient glow — static atmospheric */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "60%",
          background:
            "radial-gradient(ellipse at bottom center, rgba(77,127,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <motion.div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          y: sectionY,
        }}
      >
        {/* ── Section header row ── */}
        <div
          className="section-header-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(32px, 6vw, 80px)",
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
            06
          </motion.span>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.70, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="text-label"
            style={{ color: "rgba(240,242,245,0.35)", flexShrink: 0 }}
          >
            Let&apos;s Build
          </motion.p>
        </div>

        {/* ── Two-column layout: headline left, form right ── */}
        <div
          className="two-col-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(36px, 8vw, 120px)",
            alignItems: "center",
          }}
        >
          {/* ── LEFT: CTA headline ── */}
          <div>
            {/* Headline line 1 */}
            <div style={{ overflow: "hidden", marginBottom: "4px" }}>
              <motion.span
                initial={{ opacity: 0, y: "100%" }}
                animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "100%" }}
                transition={{ duration: 1.0, delay: 0.08, ease: EASE_OUT_EXPO }}
                className="text-display-lg"
                style={{ color: "var(--bs-white)", display: "block" }}
              >
                Ready to automate,
              </motion.span>
            </div>

            {/* Headline line 2 — larger, italic Funnel Display */}
            <div style={{ overflow: "hidden", marginBottom: "clamp(24px, 4vw, 40px)" }}>
              <motion.span
                initial={{ opacity: 0, y: "100%" }}
                animate={isInView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "100%" }}
                transition={{ duration: 1.1, delay: 0.22, ease: EASE_OUT_EXPO }}
                className="text-display-xl font-display"
                style={{
                  color: "var(--bs-white)",
                  display: "block",
                  fontStyle: "italic",
                  lineHeight: 0.9,
                }}
              >
                protect &amp; scale?
              </motion.span>
            </div>

            {/* Body copy */}
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.85, delay: 0.40, ease: EASE_OUT_EXPO }}
              style={{
                fontSize: "16px",
                lineHeight: 1.65,
                color: "var(--bs-white-dim)",
                maxWidth: "400px",
                marginBottom: "32px",
              }}
            >
              Small businesses deserve enterprise-grade technology. Reach out directly —
              we respond fast and keep it real.
            </motion.p>

            {/* Email link */}
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.80, delay: 0.54, ease: EASE_OUT_EXPO }}
              href="mailto:info@bornesystems.com"
              className="text-link"
              style={{ fontSize: "15px" }}
            >
              info@bornesystems.com
            </motion.a>
          </div>

          {/* ── RIGHT: contact form card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.0, delay: 0.48, ease: EASE_OUT_EXPO }}
            style={{
              background: "var(--bs-surface)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "clamp(28px, 4vw, 52px)",
            }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                style={{ textAlign: "center", padding: "32px 0" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(77,127,255,0.12)",
                    border: "1px solid rgba(77,127,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="var(--bs-accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "var(--bs-white)",
                    marginBottom: "8px",
                  }}
                >
                  Message received.
                </p>
                <p style={{ fontSize: "14px", color: "var(--bs-white-dim)" }}>
                  We&apos;ll be in touch shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Form label — Silkscreen for the meta "Start a conversation" label */}
                <div style={{ marginBottom: "32px" }}>
                  <span
                    style={{
                      fontFamily: "'Silkscreen', monospace",
                      fontSize: "9px",
                      color: "rgba(240,242,245,0.30)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    Start a conversation
                  </span>
                </div>

                {/* Name */}
                <div style={{ marginBottom: "28px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(240,242,245,0.35)",
                      marginBottom: "10px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="input-editorial"
                    required
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: "28px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(240,242,245,0.35)",
                      marginBottom: "10px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-editorial"
                    required
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: "36px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(240,242,245,0.35)",
                      marginBottom: "10px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    How can we help?
                  </label>
                  <textarea
                    placeholder="Security audit, AI automation, AI receptionist…"
                    rows={3}
                    className="input-editorial"
                    style={{ resize: "none" }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--bs-white)",
                    color: "var(--bs-bg)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "13px 24px",
                    fontFamily: "'Funnel Display', 'Space Grotesk', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Get in Touch
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
