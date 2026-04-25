"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import PaymentSheet from "./PaymentSheet"

const craftingStages = [
  {
    id: 0,
    mainTitle: "智能识别爱宠神态...",
    subTitle: "— 正在提取专属视觉特征 —",
    duration: 3000,
  },
  {
    id: 1,
    mainTitle: "纳米级构图重构中...",
    subTitle: "— 优化高定印花细节 —",
    duration: 4000,
  },
  {
    id: 2,
    mainTitle: "模拟纤维物理融合特效...",
    subTitle: "— 确保呈现最高质感 —",
    duration: 4000,
  },
  {
    id: 3,
    mainTitle: "专属于您的印记，即将呈现...",
    subTitle: "— 正在进行发丝级边缘校准 —",
    duration: 3000,
  },
]

interface MockupPreviewProps {
  originalImageUrl: string | null
  generatedImageUrl: string | null
  onCheckout: (size: string) => void
  isGenerating?: boolean
  progress?: number
  isRevealing?: boolean
}

const sizes = ["S", "M", "L", "XL"]

export default function MockupPreview({
  originalImageUrl,
  generatedImageUrl,
  onCheckout: _onCheckout,
  isGenerating = false,
  progress: _progress = 0,
  isRevealing = false,
}: MockupPreviewProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>("M")
  const [activeView, setActiveView] = useState<'preview' | 'compare'>('preview')
  const [currentStage, setCurrentStage] = useState(0)
  const [fakeProgress, setFakeProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)
  const [isHoveringOrder, setIsHoveringOrder] = useState(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isGenerating && !isRevealing) {
      setCurrentStage(0)
      setFakeProgress(0)
      setIsReady(false)
      
      progressIntervalRef.current = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev < 80) {
            return prev + Math.random() * 8 + 4
          } else if (prev < 95) {
            return prev + Math.random() * 0.5 + 0.1
          } else {
            return prev
          }
        })
      }, 200)
      
      let totalDuration = 0
      craftingStages.forEach((stage, index) => {
        totalDuration += stage.duration
        setTimeout(() => {
          setCurrentStage(index + 1)
        }, totalDuration)
      })
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        if (stageTimeoutRef.current) {
          clearTimeout(stageTimeoutRef.current)
        }
      }
    }
  }, [isGenerating, isRevealing])

  useEffect(() => {
    if (generatedImageUrl && !isReady) {
      setIsReady(true)
      setFakeProgress(100)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [generatedImageUrl, isReady])

  const currentCraftingStage = craftingStages[Math.min(currentStage, craftingStages.length - 1)]

  if (!originalImageUrl && !generatedImageUrl && !isGenerating) {
    return null
  }

  return (
    <section className="py-8 md:py-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-xl md:text-3xl font-light tracking-tight text-white">
            预览你的定制
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6">
            {!isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-1 bg-gray-100/80 rounded-full p-1">
                  <button
                    onClick={() => setActiveView('preview')}
                    className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeView === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    产品预览
                  </button>
                  <button
                    onClick={() => setActiveView('compare')}
                    className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeView === 'compare'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    原图对照
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {activeView === 'preview' || isGenerating ? (
                <div className="relative">
                  <div className="relative aspect-square md:aspect-[3/4] bg-transparent rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <img
                          src="/images/hero-shirt.png"
                          alt="T-Shirt Template"
                          className="w-full h-full object-cover"
                        />
                        {(originalImageUrl || generatedImageUrl || isGenerating) && (
                          <div
                            className="absolute flex items-center justify-center overflow-visible bg-transparent border-none"
                            style={{ top: '26%', left: '50%', width: '38%', transform: 'translateX(-50%)' }}
                          >
                            {generatedImageUrl ? (
                              <img
                                src={generatedImageUrl}
                                alt="AI Generated Pet on T-Shirt"
                                className="block w-full h-auto object-contain bg-transparent border-0 opacity-[0.98]"
                              />
                            ) : (
                              <img
                                src={originalImageUrl || ''}
                                alt="Original Pet on T-Shirt"
                                className="block w-full h-auto object-contain bg-transparent border-0 opacity-[0.98]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isGenerating && (
                        <motion.div
                          key="loading-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent backdrop-blur-3xl"
                        >
                          <AnimatePresence mode="wait">
                            {!isRevealing ? (
                              <motion.div
                                key="generating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center"
                              >
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentCraftingStage.mainTitle}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col items-center"
                                  >
                                    <motion.h2
                                      className="text-gray-900 text-lg md:text-xl font-light tracking-[0.2em] text-center"
                                      initial={{ opacity: 0, y: 15 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                      {currentCraftingStage.mainTitle}
                                    </motion.h2>
                                    <motion.p
                                      className="text-gray-500 text-sm tracking-[0.15em] mt-3"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                      {currentCraftingStage.subTitle}
                                    </motion.p>
                                  </motion.div>
                                </AnimatePresence>
                                
                                <div className="w-48 h-[1px] bg-gray-200 mt-10 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-gray-300 via-gray-900 to-gray-300"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.min(fakeProgress, 95)}%` }}
                                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                  />
                                </div>
                                
                                <motion.div
                                  className="mt-8 flex items-center gap-2"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                  <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                  />
                                  <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                  />
                                </motion.div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="revealing"
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center"
                              >
                                <motion.p
                                  className="text-black text-xl md:text-3xl font-medium tracking-wide text-center"
                                  initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                >
                                  专属于您的印记，呈现给您。
                                </motion.p>
                                <motion.div
                                  className="w-16 h-[2px] bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-6"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: 1 }}
                                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-3 md:p-6 border-0 shadow-sm bg-transparent">
                      <h3 className="text-xs font-medium text-center mb-3 md:mb-4 text-gray-300 tracking-wide uppercase">
                        原始照片
                      </h3>
                      <div className="aspect-square bg-transparent rounded-2xl overflow-hidden">
                        <img
                          src={originalImageUrl || ""}
                          alt="Original Pet Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-3 md:p-6 border-0 shadow-sm bg-transparent">
                      <h3 className="text-xs font-medium text-center mb-3 md:mb-4 text-gray-300 tracking-wide uppercase">
                        AI 渲染效果
                      </h3>
                      <div className="aspect-square bg-transparent rounded-2xl overflow-hidden">
                        <img
                          src={generatedImageUrl || ""}
                          alt="AI Generated Pet"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}
            </motion.div>

            <div className="lg:hidden space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center"
              >
                <h3 className="text-xl font-light tracking-tight text-white">
                  专属定制 T 恤
                </h3>
                <p className="text-gray-300 mt-1 text-sm">
                  你的宠物，独一无二的设计
                </p>
                <p className="text-2xl font-light text-white mt-4">
                  ¥69.9
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              >
                <p className="text-xs font-medium text-gray-300 mb-3 text-center tracking-wide uppercase">
                  选择尺码
                </p>
                <div className="flex gap-2 justify-center">
                  {sizes.map((size, index) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.06 }}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="w-full lg:w-80 lg:sticky lg:top-12 lg:self-start hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white">
                  专属定制 T 恤
                </h3>
                <p className="text-gray-300 mt-2">
                  你的宠物，独一无二的设计
                </p>
                <p className="text-3xl font-light text-white mt-5">
                  ¥69.9
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-300 mb-3 tracking-wide uppercase">
                  选择尺码
                </p>
                <div className="flex gap-2">
                  {sizes.map((size, index) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.06 }}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-11 text-sm font-medium bg-gray-900 hover:bg-gray-800 rounded-full transition-all duration-300 shadow-sm hover:shadow"
                onClick={() => setIsPaymentSheetOpen(true)}
              >
                确认定制并支付
              </Button>


              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  安全支付，加密传输
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-transparent border-t border-gray-100 px-5 py-3.5 z-50">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs text-gray-400">售价</p>
              <p className="text-lg font-light text-white">¥69.9</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="h-10 text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 rounded-full px-4"
                onClick={() => router.push('/order')}
              >
                订单
              </Button>
              <Button
                className="h-10 text-sm font-medium bg-gray-900 hover:bg-gray-800 rounded-full px-6"
                onClick={() => setIsPaymentSheetOpen(true)}
              >
                立即购买
              </Button>
            </div>
          </motion.div>
        </div>

        <PaymentSheet
          isOpen={isPaymentSheetOpen}
          onClose={() => setIsPaymentSheetOpen(false)}
          total={69.9}
          generatedImageUrl={generatedImageUrl}
        />
      </div>
    </section>
  )
}
