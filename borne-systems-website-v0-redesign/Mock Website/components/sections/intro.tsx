"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function Intro() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-start gap-8"
        >
          <span className="text-sm text-muted-foreground font-mono">1 — 5</span>
          
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-sm text-accent uppercase tracking-widest mb-8"
            >
              Let&apos;s build something that lasts
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-display-md max-w-4xl"
              style={{ color: "var(--bs-white)", lineHeight: 1.15 }}
            >
              AI has changed the way we build. Great digital products are no longer defined by features, but by{" "}
              <span className="text-foreground font-medium">values people connect with</span>.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mt-8 max-w-3xl leading-relaxed"
            >
              Appy helps startups build digital products that stand out in a saturated tech landscape 
              by grounding them end-to-end in strategy, storytelling, and evolving human values — 
              creating tech that doesn&apos;t just optimise for efficiency, but makes people genuinely &apos;appier.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 text-sm font-medium text-foreground border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
            >
              How we do it
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
