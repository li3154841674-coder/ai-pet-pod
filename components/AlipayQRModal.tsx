"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle } from "lucide-react"

interface AlipayQRModalProps {
  isOpen: boolean
  onClose: () => void
  paymentUrl: string
  orderId: string
  paymentMethod: 'alipay' | 'wechat'
  onPaymentSuccess: () => void
}

export default function AlipayQRModal({
  isOpen,
  onClose,
  paymentUrl,
  orderId,
  paymentMethod,
  onPaymentSuccess,
}: AlipayQRModalProps) {
  const qrCodeUrl = useMemo(() => {
    if (!paymentUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(paymentUrl)}`
  }, [paymentUrl])

  if (!isOpen) return null

  const hasUrl = Boolean(paymentUrl)
  const isWechat = paymentMethod === 'wechat'
  const themeColor = isWechat ? 'text-[#07C160]' : 'text-[#1677FF]'
  const themeButtonClass = isWechat
    ? 'py-3 rounded-xl bg-[#07C160] text-white hover:bg-[#06AD56] transition-colors'
    : 'py-3 rounded-xl bg-[#1677FF] text-white hover:bg-[#0958DB] transition-colors'
  const themeBorderClass = isWechat ? 'border-[#07C160]/30' : 'border-[#1677FF]/30'

  return (
    <AnimatePresence>
      <motion.div
        key="alipay-qr-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />

      <motion.div
        key="alipay-qr-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none"
      >
        <div className="pointer-events-auto relative" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-[92vw] max-w-md">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center">
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isWechat ? 'bg-[#E6F7EF]' : 'bg-[#E8F1FF]'}`}>
                {isWechat ? (
                  <svg viewBox="0 0 24 24" className="h-7 w-7">
                    <defs>
                      <linearGradient id="wechatModalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#07C160" />
                        <stop offset="100%" stopColor="#06AD56" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#wechatModalGradient)" d="M12.011 2C6.48 2 2 6.025 2 10.978c0 2.29 1.11 4.352 2.87 5.761a.56.56 0 0 1 .213.638l-.39 1.477c-.02.07-.048.14-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM7.611 6.513c.54 0 .978.449.978 1.003 0 .554-.438 1.003-.978 1.003-.54 0-.978-.449-.978-1.003 0-.554.438-1.003.978-1.003zm5.813 0c.54 0 .978.449.978 1.003 0 .554-.438 1.003-.978 1.003-.54 0-.978-.449-.978-1.003 0-.554.438-1.003.978-1.003z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-7 w-7">
                    <defs>
                      <linearGradient id="alipayModalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1677FF" />
                        <stop offset="100%" stopColor="#0958DB" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#alipayModalGradient)" d="M21.59 8.735a2.94 2.94 0 0 0-.6-1.153 2.84 2.84 0 0 0-1.098-.66A8.77 8.77 0 0 0 17.1 6.5c-1.14-.2-2.31-.3-3.49-.3-2.94 0-5.85.5-8.56 1.44-.38.13-.77.26-1.15.4A2.52 2.52 0 0 0 2.4 9.82a2.33 2.33 0 0 0 .57 2.16c.39.46.88.8 1.43 1.01.35.13.71.24 1.07.33.33.08.67.15 1.01.21.47.08.94.15 1.42.2a24.9 24.9 0 0 0 4.01.26c.55 0 1.1-.01 1.65-.04.35-.02.7-.04 1.04-.07l.96-.08a9.43 9.43 0 0 0 2.85-.69c.53-.24 1.04-.53 1.51-.87.25-.18.48-.37.7-.58a3.22 3.22 0 0 0 .98-1.51 2.7 2.7 0 0 0 .08-.74z"/>
                  </svg>
                )}
              </div>
              <h3 className={`text-xl font-semibold ${themeColor}`}>
                {isWechat ? '微信扫码支付' : '支付宝扫码支付'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">请使用对应 App 扫码，金额以收银台显示为准</p>

              {!hasUrl ? (
                <div className="mt-8 rounded-2xl bg-red-50 border border-red-100 p-5 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700">支付链接生成失败</p>
                      <p className="text-xs text-red-600 mt-1">请关闭后重新点击“确认支付”</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex justify-center">
                    <div className={`rounded-2xl border p-3 bg-white ${themeBorderClass}`}>
                      <img src={qrCodeUrl} alt="支付二维码" className="w-64 h-64 rounded-xl" />
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    订单号：<span className="font-mono">{orderId || '-'}</span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={onPaymentSuccess}
                      className={themeButtonClass}
                    >
                      我已完成支付
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
