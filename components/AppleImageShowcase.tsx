"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function AppleImageShowcase() {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"]
  const baseImagePath = "/images/116840015ec8c4e3bd8476d1833f21a5"
  
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
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
            
            <div className="relative aspect-[16/10] bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src={`${baseImagePath}.jpg`}
                alt="Featured Image"
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  let extIndex = 0
                  const tryNextExt = () => {
                    extIndex++
                    if (extIndex < imageExtensions.length) {
                      target.src = `${baseImagePath}${imageExtensions[extIndex]}`
                    } else {
                      target.style.display = "none"
                    }
                  }
                  tryNextExt()
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
