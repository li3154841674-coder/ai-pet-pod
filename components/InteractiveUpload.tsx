"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/toast"
import { Upload, Sparkles, Wand2, Image as ImageIcon } from "lucide-react"

interface InteractiveUploadProps {
  onUpload: (file: File) => void
  isLoading: boolean
}

const loadingSteps = [
  { text: "正在分析你的宠物照片...", icon: ImageIcon },
  { text: "AI 正在施展魔法...", icon: Wand2 },
  { text: "为你生成专属设计...", icon: Sparkles },
]

export default function InteractiveUpload({
  onUpload,
  isLoading,
}: InteractiveUploadProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const firstError = fileRejections[0]?.errors?.[0]
      const message = firstError?.code === "file-invalid-type"
        ? "仅支持图片文件上传"
        : firstError?.code === "too-many-files"
        ? "一次只能上传一张图片"
        : "文件不符合上传要求，请更换后重试"

      toast({
        title: "上传失败",
        description: message,
        variant: "destructive",
      })
    },
    [toast]
  )

  useEffect(() => {
    if (isLoading) {
      setCurrentStep(0)
      setProgress(0)

      const stepTimer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % loadingSteps.length)
      }, 1500)

      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95
          return prev + Math.random() * 5
        })
      }, 300)

      return () => {
        clearInterval(stepTimer)
        clearInterval(progressTimer)
      }
    } else {
      setProgress(100)
    }
  }, [isLoading])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (isLoading) return

      if (fileRejections.length > 0) {
        const firstError = fileRejections[0]?.errors?.[0]
        let description = "请上传有效的图片文件（支持常见图片格式）。"

        if (firstError?.code === "file-too-large") {
          description = "图片过大，请压缩后重试。"
        } else if (firstError?.code === "file-invalid-type") {
          description = "不支持该文件类型，请上传图片文件。"
        } else if (firstError?.code === "too-many-files") {
          description = "一次只能上传一张图片。"
        }

        toast({
          title: "上传失败",
          description,
          variant: "destructive",
        })
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const fileType = (file.type || "").toLowerCase()
      const fileName = (file.name || "").toLowerCase()
      const isHeicLike =
        fileType.includes("heic") ||
        fileType.includes("heif") ||
        fileName.endsWith(".heic") ||
        fileName.endsWith(".heif")

      if (isHeicLike) {
        toast({
          title: "已识别 HEIC/HEIF 图片",
          description:
            "部分浏览器对 HEIC/HEIF 预览兼容性有限。如显示异常，建议先转换为 JPG/PNG 后再上传。",
        })
      }

      onUpload(file)
    },
    [onUpload, isLoading, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    // 允许所有图片 MIME，避免仅限少数扩展名
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  if (isLoading) {
    const CurrentIcon = loadingSteps[currentStep].icon
    
    return (
      <Card className="p-8 w-full max-w-xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center"
            >
              <CurrentIcon className="w-12 h-12 text-purple-600" />
            </motion.div>
            
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-semibold text-gray-900 text-center"
            >
              {loadingSteps[currentStep].text}
            </motion.p>
            
            <p className="text-gray-500 mt-2">
              请稍候，这可能需要 5-10 秒
            </p>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>正在处理</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          {...getRootProps()}
          className={`p-1 cursor-pointer transition-all ${
            isDragActive
              ? "border-gray-900 bg-gray-50"
              : isHovered
              ? "border-gray-300"
              : "border-gray-200"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative rounded-xl p-12 text-center bg-gradient-to-br from-transparent via-gray-50/50 to-transparent">
            <div
              className={`absolute inset-0 rounded-xl transition-opacity ${
                isHovered || isDragActive
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                background:
                "linear-gradient(90deg, rgba(236,72,153,0) 0%, rgba(236,72,153,0.3) 25%, rgba(168,85,247,0.3) 50%, rgba(236,72,153,0.3) 75%, rgba(236,72,153,0) 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite",
              }}
            />

            <input {...getInputProps()} />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" aria-hidden="true">
                  <rect width="200" height="200" fill="#ffffff" />
                  <path d="M100 10 L173.2 105 L26.8 105 Z M100 190 L26.8 95 L173.2 95 Z" fill="none" stroke="#000000" strokeWidth="1.5" />
                </svg>
              </div>
              <motion.div
                animate={{ boxShadow: ["0 0 0 rgba(212,175,55,0.08)", "0 0 14px rgba(212,175,55,0.22)", "0 0 0 rgba(212,175,55,0.08)"] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex rounded-full border border-amber-200/70 px-6 py-2"
              >
                <p className="text-xl font-semibold text-gray-900 tracking-wide [text-shadow:_1px_1px_3px_rgba(33,33,33,0.15)]">
转动星盘
                </p>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
