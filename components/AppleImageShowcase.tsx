"use client"

import { motion } from "framer-motion"

export default function AppleImageShowcase() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-6xl mx-auto will-change-transform will-change-opacity transform-gpu"
        >
          <div className="relative">
            <div className="absolute -inset-20 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-[3rem] blur-3xl opacity-30" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
