"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { X, Loader2, AlertCircle, RefreshCw } from "lucide-react"

interface AlipayQRModalProps {
  isOpen: boolean
  onClose: () => void
  paymentUrl: string
  orderId: string
  onPaymentSuccess: () => void
}

type PaymentState = 'loading' | 'ready' | 'error' | 'timeout'

export default function AlipayQRModal({
  isOpen,
  onClose,
  paymentUrl: initialPaymentUrl,
  orderId: initialOrderId,
  onPaymentSuccess,
}: AlipayQRModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('loading')
  const [paymentUrl, setPaymentUrl] = useState<string>(initialPaymentUrl)
  const [orderId, setOrderId] = useState<string>(initialOrderId)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [pollingCount, setPollingCount] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const MAX_POLLING_COUNT = 20
  const POLLING_INTERVAL = 3000
  const REQUEST_TIMEOUT = 5000

  const createOrder = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setPaymentState('loading')
    setErrorMessage('')

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('请求超时，请重试'))
        }, REQUEST_TIMEOUT)
      })

      const responsePromise = fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "观象高定宠物服装",
          totalFee: 69.9,
        }),
        signal: abortControllerRef.current.signal,
      })

      const response = await Promise.race([responsePromise, timeoutPromise]) as Response

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '创建支付订单失败')
      }

      setPaymentUrl(data.paymentUrl)
      setOrderId(data.orderId)
      setPaymentState('ready')
      setPollingCount(0)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      console.error('创建支付订单错误:', error)
      setErrorMessage(error instanceof Error ? error.message : '创建支付订单失败')
      setPaymentState('error')
    }
  }, [])

  const pollOrderStatus = useCallback(async () => {
    if (!orderId) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (data.success && data.status === 'paid') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        onPaymentSuccess()
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('轮询订单状态错误:', error)
      }
    }
  }, [orderId, onPaymentSuccess])

  useEffect(() => {
    if (isOpen) {
      // 直接使用传递的支付信息，不需要重新创建订单
      if (initialPaymentUrl && initialOrderId) {
        console.log('✅ 使用传递的支付信息:', {
          paymentUrl: initialPaymentUrl,
          orderId: initialOrderId
        })
        setPaymentUrl(initialPaymentUrl)
        setOrderId(initialOrderId)
        setPaymentState('ready')
        setPollingCount(0)
      } else {
        // 如果没有传递支付信息，才创建新订单
        console.log('⚠️  没有传递支付信息，创建新订单...')
        createOrder()
      }
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  }, [isOpen, initialPaymentUrl, initialOrderId, createOrder])

  // 检测是否为手机端
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 手机端自动跳转支付宝
  useEffect(() => {
    if (isMobile && paymentState === 'ready' && paymentUrl) {
      console.log('📱 检测到手机端，尝试跳转到支付宝App...')
      console.log('🔗 支付URL:', paymentUrl)
      
      // 支付宝App跳转协议（正确的支付协议）
      const alipayScheme = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(paymentUrl)}`
      
      // 尝试打开支付宝App
      console.log('🚀 跳转到支付宝App:', alipayScheme)
      window.location.href = alipayScheme
      
      // 2秒后检查是否跳转成功
      const checkJump = setTimeout(() => {
        console.log('🔍 检查是否跳转成功...')
        // 这里可以添加更复杂的跳转检测逻辑
      }, 2000)
      
      return () => clearTimeout(checkJump)
    }
  }, [isMobile, paymentState, paymentUrl])

  useEffect(() => {
    if (isOpen && paymentState === 'ready' && orderId) {
      pollingIntervalRef.current = setInterval(() => {
        setPollingCount(prev => {
          const newCount = prev + 1
          if (newCount >= MAX_POLLING_COUNT) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
            }
            setPaymentState('timeout')
          }
          return newCount
        })
        pollOrderStatus()
      }, POLLING_INTERVAL)

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }
  }, [isOpen, paymentState, orderId, pollOrderStatus])

  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    setPaymentState('loading')
    setPollingCount(0)
    setErrorMessage('')
  }

  const handleRetry = () => {
    createOrder()
  }

  if (!isOpen) return null

  const renderContent = () => {
    switch (paymentState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mb-6"
            >
              <Loader2 className="w-16 h-16 text-blue-500" />
            </motion.div>
            <p className="text-gray-600 text-lg font-medium">正在生成支付二维码...</p>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg font-medium mb-2">生成失败</p>
            <p className="text-gray-500 text-sm mb-6 text-center">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
          </div>
        )

      case 'timeout':
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-yellow-700 text-lg font-medium mb-2">等待超时</p>
            <p className="text-gray-500 text-sm mb-6 text-center">
              等待时间过长，请检查支付状态或重新生成二维码
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
          </div>
        )

      case 'ready':
      default:
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              请使用支付宝扫码支付
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              订单号: {orderId}
            </p>

            <div className="inline-block mb-6">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <QRCodeSVG
                  value={paymentUrl}
                  size={192}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5"
              >
                <Loader2 className="w-5 h-5 text-gray-400" />
              </motion.div>
              <p className="text-gray-500 text-sm font-medium">
                系统正在等待支付完成... ({pollingCount}/{MAX_POLLING_COUNT})
              </p>
            </div>

            <p className="text-gray-500 text-sm">
              支付完成后将自动跳转
            </p>
          </>
        )
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none"
      >
        <div 
          className="pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl max-w-sm mx-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center">
              {renderContent()}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
