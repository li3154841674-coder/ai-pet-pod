"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import InteractiveUpload from "@/components/InteractiveUpload"
import MockupPreview from "@/components/MockupPreview"
import OrderFinder, { type OrderFinderResult } from "@/components/OrderFinder"
import { useToast } from "@/components/ui/toast"
import Silk from "@/components/Silk"
import ScrollFloat from "@/components/ScrollFloat"
import { Noto_Serif_SC } from "next/font/google"

const notoSerif = Noto_Serif_SC({ subsets: ["latin"], weight: ["400", "500", "700"] })

const mysticLines = [
  "在这座拥挤而喧嚣的城市森林里，",
  "我们习惯用逻辑解释一切。",
  "却总忽略那些最幽微的奇迹。",
  "为什么偏偏是它，接住你深夜的眼泪？",
  "为什么偏偏是它，抚平你归家的疲惫？",
  "每一个孩子。",
  "都是宇宙投射给你的具象守护神。",
  "它也许是引你穿越迷雾的隐者，",
  "也许是照亮你生命纹理的太阳。",
  "不要叫它 T 恤。",
  "这是一件穿戴式护身符。",
  "观象臻选重磅精梳棉，世界顶尖推理模型研制",
  "将你的守护神，伴随于身。",
]

export default function Home() {
  // 🚀 Locked to ai-pet-pod target: 终极部署
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const [orderMeta, setOrderMeta] = useState<OrderFinderResult | null>(null)
  const { toast } = useToast()

  const removeWhiteBackground = async (imageUrl: string): Promise<string | null> => {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image()
        image.crossOrigin = "anonymous"
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("图片加载失败"))
        image.src = imageUrl
      })

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r > 245 && g > 245 && b > 245) data[i + 3] = 0
      }

      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL("image/png")
    } catch (error) {
      console.warn("[Matting] 白底剔除失败，回退原图：", error)
      return null
    }
  }

  const handleUpload = async (file: File) => {
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
      const originalUrl = URL.createObjectURL(file)
      setOriginalImageUrl(originalUrl)

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("图片读取失败"))
        reader.readAsDataURL(file)
      })

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 5, 95))
      }, 200)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || "AI 生成失败，请稍后重试")

      const resultUrl = data?.imageUrl || data?.url
      if (!resultUrl) throw new Error("AI 未返回图片地址")

      const mattedUrl = await removeWhiteBackground(resultUrl)
      setGeneratedImageUrl(mattedUrl || resultUrl)
      setProgress(100)
      setIsRevealing(true)
    } catch (error) {
      hasError = true
      errorMessage = error instanceof Error ? error.message : "上传失败，请重试"
    } finally {
      if (progressInterval) clearInterval(progressInterval)
      setIsLoading(false)
      setIsGenerating(false)
      if (hasError) {
        toast({ title: "上传失败", description: errorMessage, variant: "destructive" })
      }
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent">
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050505]">
        <Silk speed={5} scale={1} color="#f9dcd2" noiseIntensity={1} rotation={0} />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <section className="py-28 md:py-36 text-center bg-transparent">
        <div className="container mx-auto px-6">
          <div className="overflow-hidden [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)]">
            <motion.h1 initial={{ opacity: 0, y: 36, scale: 1.04 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 2.6, ease: [0.23, 1, 0.32, 1] }} className={`${notoSerif.className} text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white mb-2 tracking-widest text-center [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)]`}>
              观象
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.2, delay: 0.95, ease: [0.23, 1, 0.32, 1] }} className={`${notoSerif.className} max-w-3xl mx-auto mt-8 md:mt-12 text-sm md:text-base text-zinc-200 leading-loose tracking-wide [text-shadow:_1px_1px_3px_rgba(33,33,33,0.15)]`}>
              你以为是你挑选了它。但在浩瀚的星图中，是它跋涉了光年，才决定以这般毛茸茸的姿态，降临在你的生命里。
            </motion.p>
          </div>
        </div>
      </section>

      <section className="relative py-32 md:py-48 overflow-hidden bg-transparent">
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
          <div className="w-[75vw] max-w-[860px] aspect-square rounded-full border border-slate-300/40" />
          <div className="absolute w-[58vw] max-w-[640px] aspect-square rounded-full border border-slate-400/35" />
          <div className="absolute w-[38vw] max-w-[430px] aspect-square rounded-full border border-slate-500/30" />
        </motion.div>
        <div className="container mx-auto px-6 md:px-8 max-w-5xl relative z-10 [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)]">
          <div className="space-y-[25px] md:space-y-[25px]">
            {mysticLines.map((line, idx) => (
              <div key={line} className="space-y-10 md:space-y-14 text-center">
                <motion.p initial={{ opacity: 0, y: 24, scale: 1.05 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.25, ease: [0.23, 1, 0.32, 1] }} viewport={{ once: true, amount: 0.5 }} className={`${notoSerif.className} text-lg md:text-3xl text-zinc-200 leading-loose tracking-wide [text-shadow:_1px_1px_3px_rgba(33,33,33,0.15)]`}>
                  {line}
                </motion.p>
                {idx < mysticLines.length - 1 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 0.1, y: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} viewport={{ once: true }} className="flex justify-center">
                    <svg viewBox="0 0 320 44" className="w-48 md:w-72 h-auto text-zinc-300/60">
                      <path d="M10 24 C 58 4, 106 42, 160 24 C 214 6, 262 38, 310 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 5" />
                    </svg>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="mx-auto w-full md:max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-50px" }} className="px-0 md:max-w-4xl md:mx-auto">
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <img src="/images/2-v2.png" alt="比格犬插画" className="w-full h-full object-cover object-center" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-50px" }} className="px-6 py-8 md:px-0 md:py-10">
            <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50" scrollEnd="bottom bottom-=40" stagger={0.03} containerClassName="block" textClassName="mb-3 text-xl md:text-2xl font-semibold text-white tracking-wide [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-md">在一方小时光中拥抱金穗阳光</ScrollFloat>
            <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50" scrollEnd="bottom bottom-=40" stagger={0.03} containerClassName="block" textClassName="text-sm md:text-base text-zinc-200 drop-shadow-lg tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">让它在衣服上感受爱意。</ScrollFloat>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="mx-auto w-full md:max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-50px" }} className="px-0 md:max-w-4xl md:mx-auto">
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <img src="/images/3-v2.png" alt="刺绣细节图" className="w-full h-full object-cover object-center" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-50px" }} className="px-6 py-8 md:px-0 md:py-10">
            <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50" scrollEnd="bottom bottom-=40" stagger={0.03} containerClassName="block" textClassName="mb-3 text-xl md:text-2xl font-semibold text-white tracking-wide [text-shadow:_0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-md">在温馨的午后，相拥时刻。</ScrollFloat>
            <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50" scrollEnd="bottom bottom-=40" stagger={0.03} containerClassName="block" textClassName="text-sm md:text-base text-zinc-200 drop-shadow-lg tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">旖旎美好时光</ScrollFloat>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-transparent text-center">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true }}>
            <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50" scrollEnd="bottom bottom-=40" stagger={0.03} containerClassName="block" textClassName="text-sm md:text-lg text-zinc-200 drop-shadow-md tracking-wider [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">每一件都是艺术品，每一件都是独一无二</ScrollFloat>
          </motion.div>
        </div>
      </section>

      {!isLoading && !generatedImageUrl && (
        <section className="py-12 md:py-20 bg-transparent">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-8 md:mb-12">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} viewport={{ once: true }} className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 break-words whitespace-normal tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">上传你的宠物</motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }} viewport={{ once: true }} className="text-base md:text-xl text-zinc-100 max-w-2xl mx-auto break-words whitespace-normal [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">在「观象」，你无法指定你的卡牌。当金芒闪过，牌面翻转——准备好，迎接你们的宿命了吗？</motion.p>
            </div>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }} viewport={{ once: true }}>
              <InteractiveUpload onUpload={handleUpload} isLoading={isLoading} />
            </motion.div>
          </div>
        </section>
      )}

      {(isLoading || generatedImageUrl) && (
        <MockupPreview
          originalImageUrl={originalImageUrl}
          generatedImageUrl={generatedImageUrl}
          onCheckout={() => {}}
          isGenerating={isGenerating}
          progress={progress}
          isRevealing={isRevealing}
          orderMeta={orderMeta ? {
            orderId: orderMeta.orderId || null,
            size: orderMeta.size || null,
            price: orderMeta.price || null,
            expressCompany: orderMeta.expressCompany || null,
            expressNumber: orderMeta.expressNumber || null,
          } : undefined}
        />
      )}

      <section className="py-12 md:py-20 bg-transparent">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} viewport={{ once: true }} className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 break-words whitespace-normal tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">已有订单？</h2>
            <p className="text-base md:text-xl text-zinc-100 max-w-2xl mx-auto break-words whitespace-normal [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">输入手机号码，查找你的专属定制</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }} viewport={{ once: true }}>
            <OrderFinder onOrderFound={(order) => setOrderMeta(order)} />
          </motion.div>
        </div>
      </section>
    </main>
  )
}
