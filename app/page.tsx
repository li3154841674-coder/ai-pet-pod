"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import HeroScroll from "@/components/HeroScroll"
import AppleStickyFeatures from "@/components/AppleStickyFeatures"
import AppleImageShowcase from "@/components/AppleImageShowcase"
import AIDetailShowcase from "@/components/AIDetailShowcase"
import InteractiveUpload from "@/components/InteractiveUpload"
import MockupPreview from "@/components/MockupPreview"
import { useToast } from "@/components/ui/toast"

export default function Home() {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const { toast } = useToast()

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
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      setOriginalImageUrl(base64Image)

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) {
            return prev + Math.random() * 8 + 2
          } else if (prev < 95) {
            return prev + Math.random() * 2 + 0.1
          } else {
            return prev
          }
        })
      }, 200)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImageUrl(data.imageUrl)
      } else {
        hasError = true
        errorMessage = data.error || "生成失败"
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      hasError = true
      errorMessage = "请稍后重试"
    }

    if (progressInterval) {
      clearInterval(progressInterval)
    }

    setProgress(100)
    setIsRevealing(true)

    setTimeout(() => {
      setIsGenerating(false)
      setIsRevealing(false)
      setIsLoading(false)
      
      if (hasError) {
        toast({
          title: "生成失败",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "生成成功！",
          description: "你的宠物已被 AI 魔法重塑",
        })
      }
    }, 1500)
  }

  const handleCheckout = async (size: string) => {
    if (!generatedImageUrl) return

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size,
          imageUrl: generatedImageUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "正在跳转到支付页面...",
          description: `订单号: ${data.orderId}`,
        })
        console.log("Checkout URL:", data.checkoutUrl)
      } else {
        throw new Error(data.error || "创建订单失败")
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "支付失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroScroll />
      <AppleStickyFeatures />
      <AppleImageShowcase />
      <AIDetailShowcase />

      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-light text-gray-900 mb-3 md:mb-4 break-words whitespace-normal tracking-tight"
            >
              上传你的宠物
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              viewport={{ once: true }}
              className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto break-words whitespace-normal"
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

      <MockupPreview
        originalImageUrl={originalImageUrl}
        generatedImageUrl={generatedImageUrl}
        onCheckout={handleCheckout}
        isGenerating={isGenerating}
        progress={progress}
        isRevealing={isRevealing}
      />

      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-8 text-center">
          <p className="text-gray-400">
            © 2024 AI 宠物服装定制. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
