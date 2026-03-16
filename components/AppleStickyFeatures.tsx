"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import Image from "next/image"

const features = [
  {
    text: "甄选新疆核心产区，云感柔棉技术",
  },
  {
    text: "纯绿环保印染，舒适度全面升级",
  },
  {
    text: "高定版型，完美承载艺术",
  },
]

export default function AppleStickyFeatures() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.8])
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section ref={container} className="relative bg-white">
      <div className="hidden md:block relative h-[120vh]">
        <div className="sticky top-0 h-screen flex items-center">
          <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div 
                className="w-72 h-96 md:w-96 md:h-[28rem] bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200 overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative w-full h-full">
                  <motion.div
                    style={{
                      scale: imageScale,
                    }}
                    transition={{ 
                      type: "tween",
                      ease: "easeOut",
                      duration: 0.1,
                    }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src="/images/hero-shirt.png"
                      alt="Premium T-Shirt"
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                  
                  {isHovered && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                      向下滚动页面放大 / 向上滚动缩小
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-24 py-24">
              {features.map((feature, index) => (
                <FeatureItem 
                  key={index} 
                  text={feature.text} 
                  index={index} 
                  scrollProgress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden py-16">
        <div className="container mx-auto px-6">
          <div className="space-y-12">
            <div className="flex justify-center mb-8">
              <div className="w-64 h-80 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/hero-shirt.png"
                    alt="Premium T-Shirt"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <p className="text-xl font-medium text-gray-800 leading-relaxed">
                    {feature.text}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {[...Array(index + 1)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-900"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureItem({ 
  text, 
  index, 
  scrollProgress 
}: { 
  text: string
  index: number
  scrollProgress: any
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  
  const start = index * 0.28
  const end = start + 0.3
  
  const opacity = useTransform(
    scrollProgress,
    [Math.max(0, start - 0.1), start, Math.min(1, end), Math.min(1, end + 0.1)],
    [0.35, 1, 1, 0.35]
  )
  
  const y = useTransform(
    scrollProgress,
    [Math.max(0, start - 0.1), start, Math.min(1, end), Math.min(1, end + 0.1)],
    [-20, 0, 0, -20]
  )
  
  const scale = useTransform(
    scrollProgress,
    [Math.max(0, start - 0.1), start, Math.min(1, end), Math.min(1, end + 0.1)],
    [0.95, 1, 1, 0.95]
  )

  useEffect(() => {
    const unsubscribe = scrollProgress.onChange((latest: number) => {
      setIsActive(latest >= start && latest <= end + 0.1)
    })
    return unsubscribe
  }, [scrollProgress, start, end])

  return (
    <div 
      ref={ref} 
      className="h-32 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        style={{
          opacity,
          y,
          scale,
          x: isHovered ? 8 : 0,
        }}
        transition={{ 
          duration: 0.6,
          ease: [0.25, 1, 0.5, 1],
        }}
        className="cursor-default"
      >
        <motion.div
          animate={{
            color: isHovered ? "#111827" : "#374151",
          }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-2xl md:text-3xl font-bold leading-relaxed">
            {text}
          </p>
        </motion.div>
        <div className="mt-4 flex items-center gap-3">
          {[...Array(index + 1)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: isActive ? "#111827" : "#d1d5db",
                scale: isHovered ? 1.3 : 1,
              }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`w-2 h-2 rounded-full ${isActive ? "bg-gray-900" : "bg-gray-300"}`}
            />
          ))}
          {isHovered && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 24, opacity: 1 }}
              className="h-[2px] bg-gradient-to-r from-gray-900 to-transparent"
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
