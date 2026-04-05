"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Lightbulb, Palette, Code2, Rocket, TrendingUp } from "lucide-react"

const services = [
  {
    icon: Lightbulb,
    title: "Product Strategy",
    tagline: "We make it matter",
    description: "Why should your product exist? What real problem does it solve, why is it more than just a set of features, and why would anyone pay for it when there are so many alternatives? We help you find clear, confident answers and build everything around them.",
  },
  {
    icon: Palette,
    title: "UX / UI Design",
    tagline: "We make it personal",
    description: "We design for more than screens, but for how people see, touch, hear, and feel. Using AI, interaction, animation, expression and user agency, we create simple, accessible experiences that feel intentional and personal.",
  },
  {
    icon: Code2,
    title: "Development",
    tagline: "We make it sustainable",
    description: "We use AI to move fast, not to cut corners or re-invent the wheel. Our plug-and-play approach combines flexible, off-the-shelf technology with solid AI-assisted engineering, so what we deploy is sustainable, easy to evolve, and built to grow with you.",
  },
  {
    icon: Rocket,
    title: "Go-to-market",
    tagline: "We make it memorable",
    description: "People connect with stories, not features. A strong product narrative shapes how a product launch is experienced; what it is, who it's for, and why it matters now. We create go-to-market strategies that cut through the noise and resonate.",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    tagline: "We make it shareable",
    description: "Growth isn't a one-off launch, it's built over time. Products grow by iterating in response to evolving human values and by turning users into advocates. By nurturing communities around the product, we help create ambassadors who share it because they believe in it.",
  },
]

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const Icon = service.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative border-b border-border last:border-b-0 py-12 first:pt-0"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
        <div className="flex items-center gap-4 md:w-64 shrink-0">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3
            style={{
              fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--bs-white)",
            }}
          >
            {service.title}
          </h3>
            <p className="text-sm text-accent">{service.tagline}</p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed flex-1">
          {service.description}
        </p>
      </div>
    </motion.div>
  )
}

export function Services() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-start gap-8 mb-16"
        >
          <span className="text-sm text-muted-foreground font-mono">3 — 5</span>
          <div>
            <p className="text-sm text-accent uppercase tracking-widest mb-4">What we do</p>
            <h2
              className="text-display-md"
              style={{ color: "var(--bs-white)" }}
            >
              End-to-end excellence
            </h2>
          </div>
        </motion.div>

        <div className="border-t border-border">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
