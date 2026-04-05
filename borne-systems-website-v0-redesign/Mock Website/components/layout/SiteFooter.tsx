"use client"

import { motion } from "framer-motion"

const links = [
  { label: "About",    href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Products", href: "#products" },
  { label: "Results",  href: "#results" },
  { label: "Contact",  href: "#contact" },
]

const social = [
  {
    label: "Email",
    href: "mailto:info@bornesystems.com",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/bornesystems",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bornesystems",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/bornesystems",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export function SiteFooter() {
  return (
    <footer
      style={{
        position: "relative",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingTop: "28px",
        paddingBottom: "28px",
      }}
      className="px-6 md:px-12 lg:px-20 xl:px-28"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="footer-inner"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Logo + entity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "'Funnel Display', 'Space Grotesk', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--bs-white)",
              textTransform: "uppercase",
            }}
          >
            BS
          </span>
          <span
            style={{
              width: "1px",
              height: "14px",
              background: "rgba(255,255,255,0.12)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "12px",
              color: "rgba(240,242,245,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            Borne Systems LLC
          </span>
        </div>

        {/* Nav links */}
        <nav className="footer-nav" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "12px",
                color: "rgba(240,242,245,0.35)",
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bs-white)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,242,245,0.35)")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Social + copyright */}
        <div className="footer-social" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{
                color: "rgba(240,242,245,0.3)",
                transition: "color 0.2s ease",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bs-white)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,242,245,0.3)")}
            >
              {s.icon}
            </a>
          ))}
          {/* Silkscreen for copyright year — pixel accent for tiny metadata */}
          <span
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "8px",
              color: "rgba(240,242,245,0.18)",
              marginLeft: "8px",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            © {new Date().getFullYear()}
          </span>
        </div>
      </motion.div>
    </footer>
  )
}
