"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function AIDetailShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-gray-900 mb-3 md:mb-4 tracking-tight"
          >
            技法精细：AI 驱动毫米级重构
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-10%" }}
          >
            <div 
              className="relative aspect-[4/3] bg-white rounded-3xl overflow-hidden group shadow-xl cursor-pointer will-change-transform will-change-opacity transform-gpu"
              onMouseEnter={() => setHoveredIndex(-1)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src="/images/detail-ai-main.jpg.png"
                alt="AI 重构主视图"
                fill
                className="object-cover transition-transform duration-500"
                style={{
                  transform: hoveredIndex === -1 ? "scale(1.05)" : "scale(1)",
                }}
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent transition-opacity duration-300 ${
                  hoveredIndex === -1 ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">
                    AI 毫米级重构
                  </h3>
                  <p className="text-white/90 text-lg drop-shadow">
                    每一个像素都经过精心处理
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: hoveredIndex === -1 ? 1 : 0,
                  opacity: hoveredIndex === -1 ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            {[
              {
                src: "/images/detail-ai-sub1.jpg.png",
                title: "界面精度",
                desc: "像素级精准捕捉",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                  </svg>
                ),
              },
              {
                src: "/images/detail-ai-sub2.jpg.png",
                title: "边缘清晰度",
                desc: "发丝级边缘处理",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                src: "/images/detail-ai-sub3.jpg.png",
                title: "面料结构",
                desc: "完美还原织物纹理",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                viewport={{ once: true, margin: "-10%" }}
                className="cursor-pointer will-change-transform will-change-opacity transform-gpu"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative aspect-square bg-white rounded-2xl overflow-hidden group shadow-lg">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500"
                    style={{
                      transform: hoveredIndex === index ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity duration-300 ${
                      hoveredIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-white">
                          {item.icon}
                        </div>
                        <h3 className="font-bold text-white text-lg drop-shadow-lg">{item.title}</h3>
                      </div>
                      <p className="text-white/90 text-sm drop-shadow">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ 
                      scale: hoveredIndex === index ? 1 : 0,
                      opacity: hoveredIndex === index ? 1 : 0,
                      rotate: hoveredIndex === index ? 0 : -90,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
