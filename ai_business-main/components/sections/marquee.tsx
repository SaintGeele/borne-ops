"use client"

import { motion } from "framer-motion"

interface MarqueeProps {
  text: string
  direction?: "left" | "right"
  speed?: number
}

export function Marquee({ text, direction = "left", speed = 30 }: MarqueeProps) {
  const repeatedText = Array(10).fill(text).join(" • ")
  
  return (
    <div className="relative overflow-hidden py-8 border-y border-border bg-secondary/30">
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex whitespace-nowrap"
      >
        <span className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-foreground/10">
          {repeatedText}
        </span>
      </motion.div>
    </div>
  )
}
