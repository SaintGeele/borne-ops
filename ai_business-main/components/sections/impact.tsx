"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const metrics = [
  { value: "$15m+", label: "Secured in grants and investment" },
  { value: "16", label: "Awards for design and innovation" },
  { value: "100%", label: "Success rate for client funding" },
  { value: "5m+", label: "Downloads and active users" },
]

const happyCamperScore = [
  { letter: "A", title: "Ritual", description: "people come back regularly, but not addictively" },
  { letter: "B", title: "Agency", description: "people invest time to explore and tinker" },
  { letter: "C", title: "Affinity", description: "people get you and advocate for you" },
]

const testimonials = [
  {
    quote: "Appy created a powerful app story striking the perfect balance of professional and playful, creating a gamified experience and people love it.",
    author: "Auriole Prince",
    company: "FutureFace",
  },
  {
    quote: "Appy are the epitome of the strength that is created across both design and function, which they cover comprehensively.",
    author: "Ben Littlewood",
    company: "Moveli",
  },
  {
    quote: "We saw our returning customer rate jump to 80% after launching the new website and booking platform.",
    author: "Hugo Harrison",
    company: "Hugo's",
  },
]

export function Impact() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  
  const metricsRef = useRef(null)
  const isMetricsInView = useInView(metricsRef, { once: true, margin: "-50px" })
  
  const scoreRef = useRef(null)
  const isScoreInView = useInView(scoreRef, { once: true, margin: "-50px" })

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-start gap-8 mb-24"
        >
          <span className="text-sm text-muted-foreground font-mono">4 — 5</span>
          <div>
            <p className="text-sm text-accent uppercase tracking-widest mb-4">The Happy Camper Score</p>
            <h2
              className="text-display-md"
              style={{ color: "var(--bs-white)", marginBottom: "24px" }}
            >
              <span style={{ fontStyle: "italic" }}>Measurable</span> impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Our secret lies in the mechanics we implement to measure user happiness.
            </p>
          </div>
        </motion.div>

        {/* Happy Camper Score */}
        <motion.div
          ref={scoreRef}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {happyCamperScore.map((item, index) => (
            <motion.div
              key={item.letter}
              initial={{ opacity: 0, y: 40 }}
              animate={isScoreInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="relative p-8 rounded-2xl bg-secondary/50 border border-border hover:border-muted-foreground/30 transition-colors duration-300"
            >
              <span className="text-sm text-accent font-mono">({item.letter})</span>
              <h3
                style={{
                  fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  marginTop: "16px",
                  marginBottom: "8px",
                  color: "var(--bs-white)",
                }}
              >
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          ref={metricsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isMetricsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="text-center"
            >
              <span className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                {metric.value}
              </span>
              <p className="text-sm text-muted-foreground mt-2 max-w-32 mx-auto">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="relative"
            >
              <span className="text-6xl text-accent/30 font-serif absolute -top-4 -left-2">&ldquo;</span>
              <p className="text-foreground/90 leading-relaxed mb-6 relative z-10">
                {testimonial.quote}
              </p>
              <div>
                <p className="font-medium text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">/ {testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
