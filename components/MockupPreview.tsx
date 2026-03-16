"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

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
  onCheckout,
  isGenerating = false,
  progress = 0,
  isRevealing = false,
}: MockupPreviewProps) {
  const [selectedSize, setSelectedSize] = useState<string>("M")
  const [activeView, setActiveView] = useState<'preview' | 'compare'>('preview')

  if (!originalImageUrl && !isGenerating) {
    return null
  }

  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-xl md:text-3xl font-light tracking-tight text-gray-900">
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
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    产品预览
                  </button>
                  <button
                    onClick={() => setActiveView('compare')}
                    className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeView === 'compare'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
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
                  <div className="relative aspect-square md:aspect-[3/4] bg-[#FAFAF8] rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <img
                          src="/images/hero-shirt.png"
                          alt="T-Shirt Template"
                          className="w-full h-full object-cover"
                        />
                        {(originalImageUrl || generatedImageUrl || isGenerating) && (
                          <div className="absolute top-[17%] left-[18%] w-[64%] h-[55%] flex items-center justify-center overflow-hidden bg-transparent border-none">
                            {generatedImageUrl && (
                              <img
                                src={generatedImageUrl}
                                alt="AI Generated Pet on T-Shirt"
                                className="w-full h-full object-contain mix-blend-multiply bg-transparent border-0 contrast-[1.05] brightness-[1.02] opacity-[0.98]"
                                style={{
                                  maskImage: 'radial-gradient(circle at center, black 85%, transparent 100%)',
                                  WebkitMaskImage: 'radial-gradient(circle at center, black 85%, transparent 100%)'
                                }}
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
                          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-2xl"
                        >
                          <AnimatePresence mode="wait">
                            {!isRevealing ? (
                              <motion.div
                                key="generating"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                className="flex flex-col items-center"
                              >
                                <h3 className="text-gray-900 text-sm md:text-lg font-light tracking-[0.2em] text-center uppercase">
                                  正在为您量身定制
                                </h3>
                                <p className="text-gray-400 text-xs tracking-[0.3em] mt-2 text-center">
                                  — 独一无二 —
                                </p>
                                <div className="w-40 h-[1px] bg-gray-200 mt-8 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gray-900"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="revealing"
                                initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                              >
                                <p className="text-gray-900 text-base md:text-xl font-medium tracking-wide text-center">
                                  专属于您的印记，呈现给您。
                                </p>
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
                    <Card className="p-3 md:p-6 border-0 shadow-sm">
                      <h3 className="text-xs font-medium text-center mb-3 md:mb-4 text-gray-500 tracking-wide uppercase">
                        原始照片
                      </h3>
                      <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                        <img
                          src={originalImageUrl}
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
                    <Card className="p-3 md:p-6 border-0 shadow-sm">
                      <h3 className="text-xs font-medium text-center mb-3 md:mb-4 text-gray-500 tracking-wide uppercase">
                        AI 渲染效果
                      </h3>
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden">
                        <img
                          src={generatedImageUrl}
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
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-xl font-light tracking-tight text-gray-900">
                  专属定制 T 恤
                </h3>
                <p className="text-gray-500 mt-1 text-sm">
                  你的宠物，独一无二的设计
                </p>
                <p className="text-2xl font-light text-gray-900 mt-4">
                  ¥69.9
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-xs font-medium text-gray-500 mb-3 text-center tracking-wide uppercase">
                  选择尺码
                </p>
                <div className="flex gap-2 justify-center">
                  {sizes.map((size, index) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.06 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-2xl font-light tracking-tight text-gray-900">
                  专属定制 T 恤
                </h3>
                <p className="text-gray-500 mt-2">
                  你的宠物，独一无二的设计
                </p>
                <p className="text-3xl font-light text-gray-900 mt-5">
                  ¥69.9
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-3 tracking-wide uppercase">
                  选择尺码
                </p>
                <div className="flex gap-2">
                  {sizes.map((size, index) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.06 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                onClick={() => onCheckout(selectedSize)}
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

        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-5 py-3.5 z-50">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs text-gray-400">售价</p>
              <p className="text-lg font-light text-gray-900">¥69.9</p>
            </div>
            <Button
              className="h-10 text-sm font-medium bg-gray-900 hover:bg-gray-800 rounded-full px-6 flex-1 max-w-xs"
              onClick={() => onCheckout(selectedSize)}
            >
              立即购买
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
