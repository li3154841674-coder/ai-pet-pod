"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function HeroScroll() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 2])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={container}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white py-16 md:py-20"
    >
      <motion.div
        style={{ scale, opacity }}
        className="text-center px-6 md:px-8 max-w-6xl will-change-transform will-change-opacity transform-gpu"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight md:leading-tight break-words whitespace-normal tracking-tight text-gray-900 mb-4 md:mb-6 will-change-transform will-change-opacity transform-gpu"
        >
          重塑你的宠物
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight md:leading-tight break-words whitespace-normal tracking-tight text-gray-700 mb-6 md:mb-8 will-change-transform will-change-opacity transform-gpu"
        >
          定义你的潮流
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mt-6 md:mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto break-words whitespace-normal will-change-transform will-change-opacity transform-gpu"
        >
          AI 驱动的宠物服装定制，让每一件都独一无二
        </motion.p>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
