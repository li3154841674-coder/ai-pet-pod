"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import InteractiveUpload from "@/components/InteractiveUpload"
import MockupPreview from "@/components/MockupPreview"
import OrderFinder from "@/components/OrderFinder"
import { useToast } from "@/components/ui/toast"
import Silk from "@/components/Silk"
import ScrollFloat from "@/components/ScrollFloat"

export default function Home() {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    console.log("🎯 [DEBUG] 开始上传图片")
    console.log("📄 [DEBUG] 文件信息:", { name: file.name, size: file.size, type: file.type })
    
    setIsLoading(true)
    setIsGenerating(true)
    setIsRevealing(false)
    setProgress(0)
    setOriginalImageUrl(null)
    setGeneratedImageUrl(null)

    let progressInterval: NodeJS.Timeout | null = null
    let hasError = false
    let errorMessage = "请稍后重试"

    try {
      console.log("📖 [DEBUG] 开始转换图片为 Base64")
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          console.log("✅ [DEBUG] Base64 转换成功，长度:", result.length)
          resolve(result)
        }
        reader.onerror = () => reject(new Error('图片读取失败'))
        reader.readAsDataURL(file)
      })

      console.log("🚀 [DEBUG] 开始调用 API")
      
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 200)

      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockGeneratedUrl = "https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20cartoon%20cat%20wearing%20a%20sweater&size=1024x1024"
      console.log("✅ [DEBUG] 模拟 API 调用成功")
      setGeneratedImageUrl(mockGeneratedUrl)
    } catch (error) {
      console.error("❌ [DEBUG] 上传失败:", error)
      hasError = true
      errorMessage = error instanceof Error ? error.message : "上传失败，请重试"
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setIsLoading(false)
      setIsGenerating(false)
      
      if (hasError) {
        toast({
          title: "上传失败",
          description: errorMessage,
          variant: "destructive",
          duration: 3000
        })
      } else if (generatedImageUrl) {
        setIsRevealing(true)
      }
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent">
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050505]">
        <Silk 
          speed={5} 
          scale={1} 
          color="#f9dcd2" 
          noiseIntensity={1} 
          rotation={0} 
        />
        {/* 添加这层保护罩 */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <section className="py-32 text-center bg-transparent">
        <div className="container mx-auto px-6">
          <div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl font-bold text-white mb-4 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] tracking-[0.2em]"
              >
                重塑你的宠物
              </motion.h1>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold text-white mb-6 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] tracking-[0.2em]"
                >
                  定义你的潮流
                </motion.h1>
              </div>
              <motion.p
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="text-sm text-zinc-100 tracking-wide [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]"
              >
                AI 驱动的宠物服装定制，让每一件都独一无二
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="mx-auto w-full md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-0 md:max-w-4xl md:mx-auto"
          >
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <img
                src="/images/116840015ec8c4e3bd8476d1833f21a5.jpg"
                alt="定制潮服展示"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-6 py-8 md:px-0 md:py-10"
          >
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="mb-3 text-xl md:text-2xl font-semibold text-white tracking-wide [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-md" 
            >
              白 T 恤 · 经典版型
            </ScrollFloat>
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="text-sm md:text-base text-zinc-200 drop-shadow-lg tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]" 
            >
              精选长绒棉，上身挺括，亲肤透气。
            </ScrollFloat>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="mx-auto w-full md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-0 md:max-w-4xl md:mx-auto"
          >
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <img
                src="https://claude-assets.bytedance.net/api/text2image?prompt=cute%20cartoon%20dog%20wearing%20a%20sweater%20on%20green%20background&size=1024x1024"
                alt="比格犬插画"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-6 py-8 md:px-0 md:py-10"
          >
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="mb-3 text-xl md:text-2xl font-semibold text-white tracking-wide [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-md" 
            >
              比格犬插画 · 灵动神态
            </ScrollFloat>
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="text-sm md:text-base text-zinc-200 drop-shadow-lg tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]" 
            >
              复古矢向量感，新年氛围，情感共鸣。
            </ScrollFloat>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="mx-auto w-full md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-0 md:max-w-4xl md:mx-auto"
          >
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <img
                src="/images/detail-ai-sub1.jpg.png"
                alt="刺绣细节图"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="px-6 py-8 md:px-0 md:py-10"
          >
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="mb-3 text-xl md:text-2xl font-semibold text-white tracking-wide [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-md" 
            >
              刺绣细节 · 精致触感
            </ScrollFloat>
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="text-sm md:text-base text-zinc-200 drop-shadow-lg tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]" 
            >
              高密度绣线，立体饱满，匠心工艺。
            </ScrollFloat>
          </motion.div>
        </div>
      </section>

      {/* 品牌留白区域 */}
      <section className="py-24 md:py-32 bg-transparent text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <ScrollFloat 
              animationDuration={1} 
              ease="back.inOut(2)" 
              scrollStart="center bottom+=50" 
              scrollEnd="bottom bottom-=40" 
              stagger={0.03} 
              containerClassName="block" 
              textClassName="text-sm md:text-lg text-zinc-200 drop-shadow-md tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]" 
            >
              每一件都是艺术品，每一件都是独一无二
            </ScrollFloat>
          </motion.div>
        </div>
      </section>

      {!isLoading && !generatedImageUrl && (
        <section className="py-12 md:py-20 bg-transparent">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-8 md:mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
                className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 break-words whitespace-normal tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]"
              >
                上传你的宠物
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                viewport={{ once: true }}
                className="text-base md:text-xl text-zinc-100 max-w-2xl mx-auto break-words whitespace-normal [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]"
              >
                只需一张照片，AI 为你打造专属设计
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              viewport={{ once: true }}
            >
              <InteractiveUpload onUpload={handleUpload} isLoading={isLoading} />
            </motion.div>
          </div>
        </section>
      )}

      {generatedImageUrl && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-12 md:py-20 bg-transparent"
        >
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-8 md:mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 break-words whitespace-normal tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]"
              >
                专属设计已生成
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                className="text-base md:text-xl text-zinc-100 max-w-2xl mx-auto break-words whitespace-normal [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]"
              >
                为你的宠物定制的专属服装设计
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
                className="bg-transparent rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center">
                  <MockupPreview imageUrl={generatedImageUrl} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
                className="bg-transparent rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center">
                  <MockupPreview imageUrl={generatedImageUrl} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      <section className="py-12 md:py-20 bg-transparent">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 break-words whitespace-normal tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
              已有订单？
            </h2>
            <p className="text-base md:text-xl text-zinc-100 max-w-2xl mx-auto break-words whitespace-normal [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
              输入手机号码，查找你的专属定制
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            viewport={{ once: true }}
          >
            <OrderFinder />
          </motion.div>
        </div>
      </section>
    </main>
  )
}