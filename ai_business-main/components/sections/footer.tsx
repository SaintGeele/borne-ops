"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="relative py-12 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">Appy</span>
            <span className="text-muted-foreground">Camper Ltd</span>
          </div>
          
          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Work</a>
            <a href="#" className="hover:text-foreground transition-colors">Services</a>
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
