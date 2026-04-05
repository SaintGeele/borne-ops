"use client"

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { useState } from "react"

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const

const navLinks = [
  { label: "About",    href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Products", href: "#products" },
  { label: "Results",  href: "#results" },
  { label: "Contact",  href: "#contact" },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60)
  })

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
        style={{
          backgroundColor: scrolled || menuOpen ? "rgba(8, 11, 16, 0.95)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
          borderBottom: scrolled || menuOpen ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "20px 24px", maxWidth: "100%" }}
        >
          {/* Logo mark */}
          <a href="/" className="flex items-center gap-2 group" aria-label="Borne Systems home">
            <span
              style={{
                fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#f0f2f5",
                textTransform: "uppercase",
              }}
            >
              BS
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.05em",
                color: "rgba(240,242,245,0.42)",
              }}
              className="hidden sm:inline"
            >
              Borne Systems
            </span>
          </a>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "rgba(240,242,245,0.75)",
                transformOrigin: "center",
              }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "rgba(240,242,245,0.75)",
              }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "rgba(240,242,245,0.75)",
                transformOrigin: "center",
              }}
            />
          </button>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.30, ease: EASE_OUT }}
              style={{
                overflow: "hidden",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(8, 11, 16, 0.98)",
              }}
            >
              <div style={{ padding: "8px 0 20px" }}>
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05, ease: EASE_OUT }}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "14px 24px",
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: "15px",
                      fontWeight: 400,
                      color: "rgba(240,242,245,0.70)",
                      letterSpacing: "0.04em",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f2f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,242,245,0.70)")}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
