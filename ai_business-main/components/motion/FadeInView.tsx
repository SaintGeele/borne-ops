"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
  once?: boolean
  margin?: string
}

export function FadeInView({
  children,
  delay = 0,
  duration = 0.9,
  y = 40,
  className = "",
  once = true,
  margin = "-120px 0px",
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: margin as Parameters<typeof useInView>[1]["margin"] })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
