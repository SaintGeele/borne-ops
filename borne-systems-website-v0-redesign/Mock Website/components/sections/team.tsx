"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const leaders = [
  {
    name: "Michael Le",
    role: "Co-founder / Tech-y",
    background: "(Ex) Microsoft, Skype, EA",
  },
  {
    name: "Jacob van Leeuwen",
    role: "Co-founder / Design-y",
    background: "(Ex) WeWork, Philips, F1",
  },
]

export function Team() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-start gap-8 mb-16"
        >
          <span className="text-sm text-muted-foreground font-mono">5 — 5</span>
          <div>
            <p className="text-sm text-accent uppercase tracking-widest mb-4">Appy to meet you</p>
            <h2
              className="text-display-md"
              style={{ color: "var(--bs-white)" }}
            >
              The people behind the pixels
            </h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {/* Leaders */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-8">Leadership</h3>
            <div className="space-y-8">
              {leaders.map((leader, index) => (
                <motion.div
                  key={leader.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-medium">
                      {leader.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
                          fontSize: "17px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          transition: "color 0.2s ease",
                        }}
                        className="group-hover:text-accent"
                      >
                        {leader.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{leader.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-16">{leader.background}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-8">Our mission</h3>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              Appy is a London-based product studio with roots in big tech, bringing a scale and growth mindset 
              to businesses who use tech not just to capture attention, but create meaningful social impact.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The idea for AppyCamper began as a spark; to apply our big-tech experience to products that 
              create real social impact, helping them grow without losing focus on what matters.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our name is a nod to &quot;Happy Camper&quot;, an idiom that reflects why we get out of our sleeping bags 
              in the morning: to shift the direction of technology — away from products built for clicks and attention, 
              and towards authenticity, connection, wellbeing, and experiences that genuinely make people &apos;appy.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
