"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface ParallaxLayerProps {
  children: React.ReactNode
  offset?: [number, number]
  className?: string
}

/**
 * Subtle scroll-bound translateY parallax.
 * offset: [outputMin, outputMax] in pixels — positive values move down with scroll, negative move up.
 * Default [-30, 30] — very subtle drift.
 */
export function ParallaxLayer({
  children,
  offset = [-30, 30],
  className = "",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], offset)

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
