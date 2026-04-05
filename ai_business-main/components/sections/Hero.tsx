"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

// ─── Card type ─────────────────────────────────────────────────────────────
interface CollageCard {
  id: string
  src: string
  alt: string
  width: number
  height: number
  floatClass: string
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  zIndex: number
  scrollFactor: number
  entryDelay: number
  objectPosition: string
  opacity: number
  showCounter: boolean
}

/*
 * MOBILE COLLAGE — v16
 * ─────────────────────────────────────────────────────────────────────────────
 * 6 curated cards selected for mobile display (< 1024px).
 * Composition strategy:
 *   RIGHT COLUMN (partially bleeding off right edge — frames headline without
 *   obstructing the text column which occupies left ~80% of viewport):
 *     - card-a   top-right  → Earth at night: most impactful, cinematic anchor
 *     - card-g   mid-right  → Code editor: craft identity, understated
 *     - card-f   lower-right → Holographic UI: tall portrait, editorial depth
 *   LEFT GHOST (z < 5, very low opacity — pure atmosphere, not readable content):
 *     - card-b   upper-left → Dark keyboard: bleeds off left, textural shadow
 *     - card-e   lower-left → Botanical macro: organic ground layer
 *   BOTTOM ACCENT:
 *     - card-j   bottom-right → Light trails: small energetic anchor point
 *
 * Size reduction: ~50–60% of desktop dimensions.
 * Scroll factors: max 0.15 (much gentler parallax on mobile).
 * Float animations: re-enabled for these 6 via CSS, with reduced amplitudes.
 */
const mobileCollageCards: CollageCard[] = [
  // ── RIGHT COLUMN ──
  {
    id: "card-a",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=88",
    alt: "Earth at night — city lights and connected systems",
    width: 200,
    height: 148,
    floatClass: "float-a",
    position: { top: "4%", right: "-8%" },
    zIndex: 18,
    scrollFactor: 0.12,
    entryDelay: 0.30,
    objectPosition: "center 55%",
    opacity: 0.90,
    showCounter: true,
  },
  {
    id: "card-g",
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=88",
    alt: "Minimal code — the art of clean craft",
    width: 160,
    height: 108,
    floatClass: "float-g",
    position: { top: "18%", right: "-5%" },
    zIndex: 16,
    scrollFactor: 0.10,
    entryDelay: 0.42,
    objectPosition: "center 30%",
    opacity: 0.80,
    showCounter: false,
  },
  {
    id: "card-f",
    src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=700&q=85",
    alt: "Abstract holographic interface — modern software design",
    width: 138,
    height: 196,
    floatClass: "float-f",
    position: { top: "50%", right: "-6%" },
    zIndex: 17,
    scrollFactor: 0.08,
    entryDelay: 0.60,
    objectPosition: "center 40%",
    opacity: 0.85,
    showCounter: false,
  },

  // ── LEFT GHOST ──
  {
    id: "card-b",
    src: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=88",
    alt: "Premium dark mechanical keyboard — precision craft",
    width: 150,
    height: 210,
    floatClass: "float-b",
    position: { top: "8%", left: "-12%" },
    zIndex: 3,
    scrollFactor: 0.06,
    entryDelay: 0.50,
    objectPosition: "center 45%",
    opacity: 0.28,
    showCounter: false,
  },
  {
    id: "card-e",
    src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=82",
    alt: "Dark botanical macro — organic structure and growth",
    width: 162,
    height: 95,
    floatClass: "float-e",
    position: { bottom: "14%", left: "-8%" },
    zIndex: 3,
    scrollFactor: 0.05,
    entryDelay: 0.72,
    objectPosition: "center 50%",
    opacity: 0.22,
    showCounter: false,
  },

  // ── BOTTOM ACCENT ──
  {
    id: "card-j",
    src: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=700&q=85",
    alt: "Light trail energy — motion and precision",
    width: 128,
    height: 90,
    floatClass: "float-j",
    position: { bottom: "20%", right: "1%" },
    zIndex: 19,
    scrollFactor: 0.09,
    entryDelay: 0.78,
    objectPosition: "center 45%",
    opacity: 0.70,
    showCounter: false,
  },
]

// ─── Easing constants ──────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const EASE_OUT      = [0.25, 0.1, 0.25, 1] as const

/*
 * HERO FLOATING COLLAGE v15 — FINAL PREMIUM REFINEMENT PASS
 * ─────────────────────────────────────────────────────────────────────────────
 * v15 CHANGES:
 *   · Stronger left anchor — tighter content column, deeper left edge
 *   · More curated image set — eliminated repeated abstracts and tech-texture duplication
 *     - card-k (circuit macro) → person at premium workstation (humanized craft)
 *     - card-h (concrete) → hand holding phone (human touch, connection)
 *     - card-d (ink splash) → aerial neighborhood (relatable small business scale)
 *     - card-e (fluid sim) → dark botanical macro (organic growth metaphor)
 *     + card-o NEW: wide moody architectural exterior, bleeds off right edge (compositional mass)
 *   · Cinematic scroll: range increased from 220 to 280px, layered fade-out added
 *   · Image composition: diagonal flow from card-a → card-g → card-f
 *   · Float animation: card-a period increased to 12s (less mechanical), sine easing added
 *   · Left vertical accent line added for stronger editorial anchoring
 */

const collageCards: CollageCard[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // FOREGROUND ANCHORS — z > 20, float IN FRONT of headline
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "card-a",
    // Earth at night — orbital view, city lights as glowing human networks.
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=88",
    alt: "Earth at night — city lights and connected systems",
    width: 340,
    height: 250,
    floatClass: "float-a",
    position: { top: "3%", right: "-1%" },
    zIndex: 28,
    scrollFactor: 0.45,
    entryDelay: 0.30,
    objectPosition: "center 55%",
    opacity: 1,
    showCounter: true,
  },
  {
    id: "card-f",
    // Abstract holographic UI fragment — glassmorphism interface, cool blues/teals.
    src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=700&q=85",
    alt: "Abstract holographic interface — modern software design",
    width: 220,
    height: 310,
    floatClass: "float-f",
    position: { top: "58%", right: "1%" },
    zIndex: 26,
    scrollFactor: 0.35,
    entryDelay: 0.68,
    objectPosition: "center 40%",
    opacity: 1,
    showCounter: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MIDGROUND — z: 22–24
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "card-g",
    // Ultra-minimal code editor — cream background, elegant monospace syntax.
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=88",
    alt: "Minimal code — the art of clean craft",
    width: 260,
    height: 175,
    floatClass: "float-g",
    position: { top: "11%", right: "9%" },
    zIndex: 24,
    scrollFactor: 0.30,
    entryDelay: 0.40,
    objectPosition: "center 30%",
    opacity: 0.95,
    showCounter: false,
  },
  {
    id: "card-j",
    // Long-exposure light trail — fiber optic / neon energy lines.
    src: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=700&q=85",
    alt: "Light trail energy — motion and precision",
    width: 200,
    height: 140,
    floatClass: "float-j",
    position: { top: "73%", right: "22%" },
    zIndex: 22,
    scrollFactor: 0.28,
    entryDelay: 0.76,
    objectPosition: "center 45%",
    opacity: 1,
    showCounter: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WEAVE-BEHIND CARDS — z < 20, moderate scroll parallax
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "card-b",
    // Premium dark mechanical keyboard — moody workstation closeup.
    src: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=88",
    alt: "Premium dark mechanical keyboard — precision craft",
    width: 220,
    height: 310,
    floatClass: "float-b",
    position: { top: "14%", right: "28%" },
    zIndex: 6,
    scrollFactor: 0.20,
    entryDelay: 0.48,
    objectPosition: "center 45%",
    opacity: 1,
    showCounter: false,
  },
  {
    id: "card-k",
    // Person at a premium modern workstation — humanized tech.
    // Warm ambient light, intentional, craft-focused. Not intimidating.
    src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&q=85",
    alt: "Designer at workstation — technology as human craft",
    width: 185,
    height: 132,
    floatClass: "float-k",
    position: { top: "-4%", right: "36%" },
    zIndex: 5,
    scrollFactor: 0.18,
    entryDelay: 0.36,
    objectPosition: "center 40%",
    opacity: 0.88,
    showCounter: false,
  },
  {
    id: "card-d",
    // Aerial view of a small city neighborhood — relatable human scale.
    // Communicates: "we serve real communities, real businesses, real people."
    src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=700&q=82",
    alt: "Aerial neighborhood — human scale, community business",
    width: 230,
    height: 162,
    floatClass: "float-d",
    position: { top: "30%", right: "18%" },
    zIndex: 4,
    scrollFactor: 0.16,
    entryDelay: 0.38,
    objectPosition: "center 45%",
    opacity: 0.80,
    showCounter: false,
  },
  {
    id: "card-c",
    // Abstract 3D typography / bold letterform macro — warm amber 3D numeral.
    src: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=82",
    alt: "Abstract 3D letterform — bold type artistry",
    width: 190,
    height: 148,
    floatClass: "float-c",
    position: { top: "62%", right: "24%" },
    zIndex: 3,
    scrollFactor: 0.14,
    entryDelay: 0.62,
    objectPosition: "center center",
    opacity: 0.85,
    showCounter: false,
  },
  {
    id: "card-h",
    // Hand holding a smartphone — human touch, connection, approachable tech.
    // Replaces abstract concrete texture — more warmth, less cold architecture.
    src: "https://images.unsplash.com/photo-1512446816042-444d641267d4?w=600&q=80",
    alt: "Hand with phone — human connection and technology",
    width: 175,
    height: 132,
    floatClass: "float-h",
    position: { top: "40%", right: "42%" },
    zIndex: 2,
    scrollFactor: 0.10,
    entryDelay: 0.56,
    objectPosition: "center 35%",
    opacity: 0.52,
    showCounter: false,
  },
  {
    id: "card-o",
    // Wide moody architectural exterior — industrial, intentional, dark premium.
    // Compositional mass card: bleeds off right edge for editorial asymmetry.
    src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    alt: "Premium architectural exterior — precision and permanence",
    width: 280,
    height: 170,
    floatClass: "float-o",
    position: { top: "20%", right: "-5%" },
    zIndex: 1,
    scrollFactor: 0.08,
    entryDelay: 0.44,
    objectPosition: "center 50%",
    opacity: 0.28,
    showCounter: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ATMOSPHERIC LAYER — low opacity, very slow drift, minimal scroll
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "card-e",
    // Dark botanical macro — organic leaf vein structure, dark green/black.
    // Replaces fluid sim — stronger growth metaphor, more editorial texture.
    src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=82",
    alt: "Dark botanical macro — organic structure and growth",
    width: 245,
    height: 142,
    floatClass: "float-e",
    position: { top: "78%", right: "9%" },
    zIndex: 23,
    scrollFactor: 0.22,
    entryDelay: 0.80,
    objectPosition: "center 50%",
    opacity: 0.55,
    showCounter: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEFT COLUMN — ghost atmosphere, purely compositional
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "card-i",
    // Gold dust / bokeh particles — luxury constellation, warm atmosphere.
    src: "https://images.unsplash.com/photo-1561622539-74afe4c0e63c?w=600&q=80",
    alt: "Gold bokeh particles — luxury atmosphere",
    width: 155,
    height: 108,
    floatClass: "float-i",
    position: { top: "6%", left: "-2%" },
    zIndex: 1,
    scrollFactor: 0.06,
    entryDelay: 0.58,
    objectPosition: "center center",
    opacity: 0.28,
    showCounter: false,
  },
  {
    id: "card-l",
    // Abstract ink drop blooming in water — deep indigo/violet organic texture.
    src: "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=600&q=80",
    alt: "Abstract ink in water — organic depth",
    width: 140,
    height: 180,
    floatClass: "float-l",
    position: { top: "28%", left: "-3%" },
    zIndex: 1,
    scrollFactor: 0.08,
    entryDelay: 0.50,
    objectPosition: "center 40%",
    opacity: 0.25,
    showCounter: false,
  },
  {
    id: "card-m",
    // Neon wireframe geometric mesh — glowing grid lines in dark space.
    src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=78",
    alt: "Neon wireframe geometry — structure and precision",
    width: 162,
    height: 115,
    floatClass: "float-m",
    position: { top: "60%", left: "-1%" },
    zIndex: 1,
    scrollFactor: 0.06,
    entryDelay: 0.72,
    objectPosition: "center center",
    opacity: 0.20,
    showCounter: false,
  },
  {
    id: "card-n",
    // Warm sunset through frosted glass — pure color gradient, calm editorial light.
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=78",
    alt: "Warm sunset through frosted glass — calm editorial light",
    width: 190,
    height: 128,
    floatClass: "float-n",
    position: { top: "80%", left: "-2%" },
    zIndex: 1,
    scrollFactor: 0.04,
    entryDelay: 0.84,
    objectPosition: "center center",
    opacity: 0.20,
    showCounter: false,
  },
]

// ─── ImageCard ────────────────────────────────────────────────────────────
function ImageCard({
  card,
  sectionScrollY,
}: {
  card: CollageCard
  sectionScrollY: ReturnType<typeof useScroll>["scrollYProgress"]
}) {
  const scrollUpAmount = Math.round(card.scrollFactor * 280)
  // Layered cinematic: foreground fades slightly as it drifts up
  const opacityEnd = card.scrollFactor > 0.30 ? card.opacity * 0.60 : card.opacity * 0.85
  const y = useTransform(sectionScrollY, [0, 0.3, 1], [0, -Math.round(scrollUpAmount * 0.15), -scrollUpAmount])
  const cardOpacity = useTransform(sectionScrollY, [0, 0.5, 1], [card.opacity, card.opacity, opacityEnd])

  const isDeepBackground = card.opacity < 0.45
  const isBackground = card.opacity < 0.80

  return (
    <motion.div
      style={{
        position: "absolute",
        ...card.position,
        zIndex: card.zIndex,
        y,
        opacity: cardOpacity,
      }}
      initial={{ opacity: 0, y: 52, scale: 0.94 }}
      animate={{
        opacity: card.opacity,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 1.40,
        delay: card.entryDelay,
        ease: EASE_OUT_EXPO,
      }}
    >
      <div className={card.floatClass} style={{ willChange: "transform" }}>
        <div
          style={{
            width: card.width,
            height: card.height,
            borderRadius: isBackground ? "7px" : "11px",
            overflow: "hidden",
            position: "relative",
            border: isDeepBackground
              ? "1px solid rgba(255,255,255,0.03)"
              : isBackground
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(255,255,255,0.10)",
            boxShadow: isDeepBackground
              ? "0 4px 16px rgba(0,0,0,0.30)"
              : isBackground
              ? "0 8px 30px rgba(0,0,0,0.44)"
              : "0 22px 66px rgba(0,0,0,0.68), 0 2px 14px rgba(0,0,0,0.32)",
          }}
        >
          <Image
            src={card.src}
            alt={card.alt}
            fill
            style={{
              objectFit: "cover",
              objectPosition: card.objectPosition,
            }}
            sizes={`${card.width}px`}
            priority={card.id === "card-a"}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(145deg, rgba(8,11,16,0.28) 0%, transparent 55%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(77,127,255,0.07) 0%, transparent 52%)",
            }}
          />
          {card.showCounter && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "12px",
                fontFamily: "'Silkscreen', monospace",
                fontSize: "8px",
                fontWeight: 400,
                color: "rgba(240,242,245,0.22)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                userSelect: "none",
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              01 / Editorial
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.88, 0.75])

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "clamp(96px, 14vw, 140px)",
        paddingBottom: "clamp(64px, 8vw, 96px)",
      }}
    >
      {/* ── Ambient glows ── */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "18%",
          width: "72%",
          height: "90%",
          background:
            "radial-gradient(ellipse at top left, rgba(77,127,255,0.08) 0%, transparent 58%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "2%",
          right: "-8%",
          width: "52%",
          height: "72%",
          background:
            "radial-gradient(ellipse at top right, rgba(77,127,255,0.032) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "12%",
          width: "65%",
          height: "55%",
          background:
            "radial-gradient(ellipse at center left, rgba(77,127,255,0.022) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Left edge fade — softens left ghost cards */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "18%",
          height: "100%",
          background:
            "linear-gradient(to right, rgba(8,11,16,0.85) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Right edge fade — on mobile expands to mask bleeding collage cards */}
      <div
        className="hero-right-fade"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "4%",
          height: "100%",
          background:
            "linear-gradient(to left, rgba(8,11,16,0.60) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Bottom gradient bridge — seamless transition into next section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(8,11,16,0.18) 60%, rgba(8,11,16,0.40) 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* ── Floating image collage — desktop (lg+): full 14-card set ── */}
      <div
        className="hidden lg:block"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {collageCards.map((card) => (
          <ImageCard
            key={card.id}
            card={card}
            sectionScrollY={scrollYProgress}
          />
        ))}
      </div>

      {/* ── Floating image collage — mobile/tablet (< lg): 6-card curated set ── */}
      {/*    Images frame the headline from the right edge and left ghost layer.  */}
      {/*    Right-column cards bleed ~6-12% off-screen — editorial asymmetry.   */}
      <div
        className="hero-mobile-collage block lg:hidden"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {mobileCollageCards.map((card) => (
          <ImageCard
            key={`mobile-${card.id}`}
            card={card}
            sectionScrollY={scrollYProgress}
          />
        ))}
      </div>

      {/* ── Main content — strongly left-anchored editorial ── */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          paddingLeft: "clamp(20px, 4vw, 72px)",
          paddingRight: "clamp(20px, 5vw, 88px)",
          y: heroTextY,
          opacity: heroContentOpacity,
        }}
      >
        {/* Left accent line — editorial anchoring (hidden on small mobile) */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.12, ease: EASE_OUT_EXPO }}
          className="hidden sm:block"
          style={{
            position: "absolute",
            left: "clamp(8px, 1.8vw, 28px)",
            top: "12px",
            bottom: "12px",
            width: "1px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(77,127,255,0.35) 20%, rgba(77,127,255,0.20) 70%, transparent 100%)",
            transformOrigin: "top center",
          }}
        />

        <div style={{ width: "100%", maxWidth: "clamp(320px, 90%, 600px)" }}>

          {/* Silkscreen chapter marker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.80, delay: 0.08, ease: EASE_OUT }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "clamp(20px, 4vw, 32px)",
            }}
          >
            <span
              style={{
                fontFamily: "'Silkscreen', monospace",
                fontSize: "9px",
                color: "rgba(77,127,255,0.55)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              00
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(to right, rgba(77,127,255,0.35), transparent)",
                maxWidth: "52px",
              }}
            />
            <p
              className="text-label"
              style={{ color: "var(--bs-accent)", margin: 0 }}
            >
              AI Automation &amp; Cybersecurity
            </p>
          </motion.div>

          {/* Headline line 1 */}
          <div style={{ overflow: "hidden", lineHeight: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: "0%" }}
              transition={{ duration: 1.1, delay: 0.20, ease: EASE_OUT_EXPO }}
            >
              <span
                className="text-display-xl block"
                style={{
                  color: "var(--bs-white)",
                  fontFamily: "'Funnel Display', system-ui, sans-serif",
                  fontWeight: 800,
                }}
              >
                Borne
              </span>
            </motion.div>
          </div>

          {/* Headline line 2 */}
          <div style={{ overflow: "hidden", lineHeight: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: "0%" }}
              transition={{ duration: 1.1, delay: 0.33, ease: EASE_OUT_EXPO }}
            >
              <span
                className="text-display-xl block"
                style={{
                  color: "var(--bs-white)",
                  fontFamily: "'Funnel Display', system-ui, sans-serif",
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    color: "var(--bs-accent)",
                    fontWeight: 800,
                    fontStyle: "normal",
                  }}
                >
                  {"→"}{" "}
                </span>
                Systems<span style={{ color: "var(--bs-accent)", fontWeight: 800 }}>*</span>
              </span>
            </motion.div>
          </div>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.90, delay: 0.68, ease: EASE_OUT_EXPO }}
            style={{
              marginTop: "clamp(24px, 4vw, 40px)",
              maxWidth: "360px",
              fontSize: "clamp(14px, 3.5vw, 16px)",
              lineHeight: 1.75,
              color: "var(--bs-white-dim)",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 400,
              letterSpacing: "0.005em",
            }}
          >
            Military-grade discipline meets cutting-edge AI — so you can focus
            on growth while we handle the complexity.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.80, delay: 0.90, ease: EASE_OUT_EXPO }}
            style={{
              marginTop: "clamp(28px, 5vw, 44px)",
              display: "flex",
              alignItems: "center",
              gap: "clamp(20px, 4vw, 36px)",
              flexWrap: "wrap",
            }}
          >
            <a href="#contact" className="text-link" style={{ fontSize: "15px" }}>
              Get started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#services"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                color: "rgba(240,242,245,0.36)",
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "color 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(240,242,245,0.75)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(240,242,245,0.36)")
              }
            >
              See services {"↓"}
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom section rule */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "clamp(16px, 3vw, 28px)",
          right: "clamp(16px, 3vw, 28px)",
          height: "1px",
          background: "var(--bs-border)",
          zIndex: 5,
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 2.2 }}
        style={{
          position: "absolute",
          bottom: "34px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 25,
        }}
      >
        <span
          style={{
            fontFamily: "'Silkscreen', monospace",
            color: "rgba(240,242,245,0.20)",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "32px",
            background:
              "linear-gradient(to bottom, rgba(240,242,245,0.25), transparent)",
          }}
        />
      </motion.div>
    </section>
  )
}
