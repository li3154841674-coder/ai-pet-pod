"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { X, Loader2, AlertCircle, RefreshCw, Smartphone, CheckCircle2 } from "lucide-react"

interface AlipayQRModalProps {
  isOpen: boolean
  onClose: () => void
  paymentUrl: string
  orderId: string
  onPaymentSuccess: () => void
}

type PaymentState = 'loading' | 'ready' | 'error' | 'timeout'
type JumpState = 'idle' | 'attempting' | 'success' | 'failed'

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
  const [jumpState, setJumpState] = useState<JumpState>('idle')
  const [jumpAttempts, setJumpAttempts] = useState<number>(0)
  const [jumpError, setJumpError] = useState<string>('')
  const [showDebug, setShowDebug] = useState<boolean>(false)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const jumpStartTimeRef = useRef<number>(0)
  const visibilityChangeHandlerRef = useRef<(() => void) | null>(null)

  const MAX_POLLING_COUNT = 20
  const POLLING_INTERVAL = 3000
  const REQUEST_TIMEOUT = 5000
  const MAX_JUMP_ATTEMPTS = 3

  const logDebug = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[📱 Alipay Debug] [${timestamp}] ${message}`, data || '')
  }, [])

  const logError = useCallback((message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(`[❌ Alipay Error] [${timestamp}] ${message}`, error || '')
  }, [])

  const createOrder = useCallback(async () => {
    logDebug('开始创建支付订单...')
    
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
      logDebug('订单创建成功', data)

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
      
      logError('创建支付订单错误:', error)
      setErrorMessage(error instanceof Error ? error.message : '创建支付订单失败')
      setPaymentState('error')
    }
  }, [logDebug, logError])

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
        logDebug('支付成功！')
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        onPaymentSuccess()
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        logError('轮询订单状态错误:', error)
      }
    }
  }, [orderId, onPaymentSuccess, logDebug, logError])

  const checkIsMobile = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
    const isNarrowScreen = window.innerWidth < 768
    const result = isMobileDevice || isNarrowScreen
    
    logDebug('设备检测', {
      userAgent: userAgent.substring(0, 100),
      isMobileDevice,
      isNarrowScreen,
      result
    })
    
    return result
  }, [logDebug])

  const performJump = useCallback((scheme: string, method: string): Promise<boolean> => {
    return new Promise((resolve) => {
      logDebug(`尝试跳转 - 方法: ${method}`, scheme)
      
      let success = false
      const startTime = Date.now()
      
      try {
        switch (method) {
          case 'location':
            window.location.href = scheme
            success = true
            break
            
          case 'iframe':
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.style.position = 'absolute'
            iframe.style.left = '-9999px'
            iframe.style.top = '-9999px'
            iframe.src = scheme
            document.body.appendChild(iframe)
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe)
              }
            }, 2000)
            success = true
            break
            
          case 'link':
            const link = document.createElement('a')
            link.href = scheme
            link.style.display = 'none'
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            setTimeout(() => {
              if (link.parentNode) {
                link.parentNode.removeChild(link)
              }
            }, 2000)
            success = true
            break
            
          case 'window-open':
            window.open(scheme, '_blank')
            success = true
            break
        }
        
        const duration = Date.now() - startTime
        logDebug(`跳转方法执行完成 - ${method}`, { success, duration: `${duration}ms` })
        
      } catch (error) {
        logError(`跳转方法失败 - ${method}`, error)
        success = false
      }
      
      resolve(success)
    })
  }, [logDebug, logError])

  const jumpToAlipay = useCallback(async (userInitiated: boolean = false) => {
    if (!paymentUrl) {
      const error = '支付URL为空，无法跳转'
      logError(error)
      setJumpError(error)
      setJumpState('failed')
      return
    }

    if (jumpState === 'attempting') {
      logDebug('跳转正在进行中，跳过...')
      return
    }

    if (jumpAttempts >= MAX_JUMP_ATTEMPTS && !userInitiated) {
      logDebug(`已达到最大跳转次数 (${MAX_JUMP_ATTEMPTS})，停止自动跳转`)
      return
    }

    setJumpState('attempting')
    setJumpAttempts(prev => prev + 1)
    setJumpError('')
    jumpStartTimeRef.current = Date.now()

    logDebug('开始跳转到支付宝', {
      paymentUrl,
      attempt: jumpAttempts + 1,
      userInitiated,
      timestamp: new Date().toISOString()
    })

    try {
      const alipayScheme = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(paymentUrl)}`
      const fallbackScheme = `alipay://platformapi/startapp?appId=20000067&url=${encodeURIComponent(paymentUrl)}`
      
      logDebug('生成的跳转协议', { alipayScheme, fallbackScheme })

      const methods = [
        { scheme: alipayScheme, method: 'location' },
        { scheme: alipayScheme, method: 'iframe' },
        { scheme: alipayScheme, method: 'link' },
        { scheme: fallbackScheme, method: 'location' },
        { scheme: alipayScheme, method: 'window-open' },
      ]

      let anySuccess = false
      for (let i = 0; i < methods.length; i++) {
        const { scheme, method } = methods[i]
        logDebug(`执行跳转方法 ${i + 1}/${methods.length}`, { method, scheme: scheme.substring(0, 50) + '...' })
        
        const success = await performJump(scheme, method)
        if (success) {
          anySuccess = true
        }
        
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      if (anySuccess) {
        setJumpState('success')
        logDebug('跳转方法执行完成，等待用户确认...')
        
        setTimeout(() => {
          const duration = Date.now() - jumpStartTimeRef.current
          logDebug(`跳转后 ${duration}ms，检查页面可见性...`)
        }, 3000)
        
      } else {
        throw new Error('所有跳转方法都失败了')
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '跳转失败'
      logError('跳转到支付宝失败', error)
      setJumpError(errorMsg)
      setJumpState('failed')
    }
  }, [paymentUrl, jumpState, jumpAttempts, logDebug, logError, performJump])

  useEffect(() => {
    if (!isOpen) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && jumpState === 'attempting') {
        const duration = Date.now() - jumpStartTimeRef.current
        logDebug('页面重新可见', { duration: `${duration}ms` })
        
        if (duration > 2000) {
          logDebug('用户可能已从支付宝返回')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    visibilityChangeHandlerRef.current = handleVisibilityChange

    return () => {
      if (visibilityChangeHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeHandlerRef.current)
      }
    }
  }, [isOpen, jumpState, logDebug])

  useEffect(() => {
    if (isOpen) {
      logDebug('模态框打开', {
        initialPaymentUrl: initialPaymentUrl ? initialPaymentUrl.substring(0, 50) + '...' : 'empty',
        initialOrderId,
        timestamp: new Date().toISOString()
      })
      
      setJumpState('idle')
      setJumpAttempts(0)
      setJumpError('')
      
      if (initialPaymentUrl && initialOrderId) {
        logDebug('使用传递的支付信息')
        setPaymentUrl(initialPaymentUrl)
        setOrderId(initialOrderId)
        setPaymentState('ready')
        setPollingCount(0)
      } else {
        logDebug('没有传递支付信息，创建新订单')
        createOrder()
      }
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  }, [isOpen, initialPaymentUrl, initialOrderId, createOrder, logDebug])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(checkIsMobile())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkIsMobile])

  useEffect(() => {
    if (isMobile && paymentState === 'ready' && paymentUrl && jumpState === 'idle') {
      logDebug('检测到支付就绪，延迟后自动跳转...')
      
      const timer = setTimeout(() => {
        jumpToAlipay(false)
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isMobile, paymentState, paymentUrl, jumpState, jumpToAlipay, logDebug])

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
    logDebug('清理资源')
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
    setJumpState('idle')
    setJumpAttempts(0)
    setJumpError('')
  }

  const handleRetry = () => {
    logDebug('用户点击重试')
    setJumpState('idle')
    setJumpAttempts(0)
    setJumpError('')
    createOrder()
  }

  const handleRetryJump = () => {
    logDebug('用户点击重试跳转')
    jumpToAlipay(true)
  }

  const handleOpenInBrowser = () => {
    logDebug('用户点击在浏览器中打开')
    if (paymentUrl) {
      window.open(paymentUrl, '_blank')
    }
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
              {isMobile ? '支付宝支付' : '请使用支付宝扫码支付'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              订单号: {orderId}
            </p>

            {isMobile ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="w-12 h-12 text-blue-600" />
                </div>
                
                {jumpState === 'success' && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-50 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">已尝试跳转</span>
                  </div>
                )}
                
                {jumpState === 'failed' && (
                  <div className="mb-4 px-4 py-2 bg-red-50 rounded-full">
                    <span className="text-red-600 font-medium">跳转失败</span>
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-6 text-center">
                  {jumpState === 'success' 
                    ? '如未跳转到支付宝，请选择下方方式' 
                    : '请选择以下方式打开支付宝'}
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleRetryJump}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    {jumpState === 'idle' ? '打开支付宝' : '重新打开支付宝'}
                  </button>
                  
                  <button
                    onClick={handleOpenInBrowser}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    在浏览器中打开
                  </button>
                </div>

                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="mt-4 text-gray-400 text-sm hover:text-gray-600"
                >
                  {showDebug ? '隐藏调试信息' : '显示调试信息'}
                </button>

                {showDebug && (
                  <div className="mt-4 w-full p-4 bg-gray-100 rounded-xl text-left">
                    <p className="text-xs text-gray-500 mb-2 font-mono">
                      调试信息:
                    </p>
                    <div className="text-xs text-gray-600 font-mono space-y-1">
                      <p>状态: {jumpState}</p>
                      <p>尝试: {jumpAttempts}/{MAX_JUMP_ATTEMPTS}</p>
                      <p>设备: {isMobile ? '移动端' : '桌面端'}</p>
                      <p>URL: {paymentUrl ? paymentUrl.substring(0, 30) + '...' : '空'}</p>
                      {jumpError && <p className="text-red-500">错误: {jumpError}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}

            {!isMobile && (
              <>
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
            )}
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
