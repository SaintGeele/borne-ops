"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const projects = [
  {
    name: "Citizens",
    description: "A visual profile for students showcasing their social impact beyond grades and exams",
    highlight: "Presented at Misk Global Forum 2024",
    color: "from-amber-500/20 to-orange-600/20",
  },
  {
    name: "Audos",
    description: "An AI co-pilot to help first-time entrepreneurs build sustainable businesses",
    stat: "11.5m",
    statLabel: "Investment",
    color: "from-emerald-500/20 to-teal-600/20",
  },
  {
    name: "Letoe",
    description: "A personal AI-guardian, keeping an eye on your children in online games, without invading their privacy",
    color: "from-blue-500/20 to-indigo-600/20",
  },
  {
    name: "FutureFace",
    description: "A white-label healthcare platform showing patients how their lifestyle affects the way they age using AI",
    stat: "2.5m",
    statLabel: "users",
    color: "from-rose-500/20 to-pink-600/20",
  },
]

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="group relative"
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${project.color} border border-border p-8 md:p-10 h-full transition-all duration-500 hover:border-muted-foreground/30`}>
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <h3
            style={{
              fontFamily: "'Funnel Display', 'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(22px, 2.5vw, 30px)",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              lineHeight: 1.05,
              marginBottom: "16px",
              color: "var(--bs-white)",
            }}
          >
            {project.name}
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>
          
          {project.highlight && (
            <p className="text-sm text-accent font-medium">{project.highlight}</p>
          )}
          
          {project.stat && (
            <div className="flex items-end gap-2">
              <span className="text-4xl md:text-5xl font-light">{project.stat}</span>
              <span className="text-sm text-muted-foreground mb-2">{project.statLabel}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function Projects() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-start gap-8 mb-16"
        >
          <span className="text-sm text-muted-foreground font-mono">2 — 5</span>
          <div>
            <p className="text-sm text-accent uppercase tracking-widest mb-4">Featured projects</p>
            <h2
              className="text-display-md"
              style={{ color: "var(--bs-white)" }}
            >
              Our work speaks volumes
            </h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
