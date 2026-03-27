"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle } from "lucide-react"

interface AlipayQRModalProps {
  isOpen: boolean
  onClose: () => void
  paymentUrl: string
  orderId: string
  onPaymentSuccess: () => void
}

export default function AlipayQRModal({
  isOpen,
  onClose,
  paymentUrl,
  orderId,
  onPaymentSuccess,
}: AlipayQRModalProps) {
  const qrCodeUrl = useMemo(() => {
    if (!paymentUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(paymentUrl)}`
  }, [paymentUrl])

  if (!isOpen) return null

  const hasUrl = Boolean(paymentUrl)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />

      <motion.div
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
              <h3 className="text-xl font-semibold text-gray-900">请扫码支付</h3>
              <p className="mt-2 text-sm text-gray-500">请使用支付宝/微信扫码，金额以收银台显示为准</p>

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
                    <div className="rounded-2xl border border-gray-200 p-3 bg-white">
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
                      className="py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
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
