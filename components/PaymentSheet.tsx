"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, Smartphone, Monitor } from "lucide-react"
import AlipayQRModal from "./AlipayQRModal"
import { useToast } from "@/components/ui/toast"

const springTransition: { type: "spring"; stiffness: number; damping: number } = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

interface ShippingData {
  name: string
  phone: string
  address: string
}

interface PaymentSheetProps {
  isOpen: boolean
  onClose: () => void
  total: number
  generatedImageUrl?: string | null
}

interface PaymentResponse {
  orderId: string
  payUrl: string
  qrCode: string
  status: string
}

function TShirtPreview({ 
  petImage, 
  tshirtColor = "white" 
}: { 
  petImage?: string | null
  tshirtColor?: "white" | "black" | "navy"
}) {
  const isLight = tshirtColor === "white"
  
  const bgColor = {
    white: "bg-white",
    black: "bg-gray-900",
    navy: "bg-blue-900"
  }[tshirtColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={`relative w-64 h-72 ${bgColor} rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-gray-200/20`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      
      <div className="absolute inset-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springTransition, delay: 0.2 }}
          className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg"
        >
          {petImage ? (
            <img src={petImage} alt="宠物图案" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <span className="text-4xl">🐱</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className={`text-[8px] ${isLight ? "text-gray-300" : "text-gray-600"}`}>
          G-PHOTO STUDIO
        </span>
      </div>
    </motion.div>
  )
}

function ShippingView({ 
  shippingData, 
  onShippingDataChange, 
  onPhoneChange, 
  phoneError, 
  onContinue, 
  inputRef,
  onColorChange,
  tshirtColor,
  generatedImageUrl
}: ShippingViewProps & {
  onColorChange?: (color: "white" | "black" | "navy") => void
  tshirtColor?: "white" | "black" | "navy"
  generatedImageUrl?: string | null
}) {
  return (
    <div className="px-4 md:px-6 pb-6 md:pb-8 pt-2 md:pt-4">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-6 md:mb-8"
      >
        定制详情
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ...springTransition }}
        className="flex justify-center mb-6"
      >
        <TShirtPreview 
          petImage={generatedImageUrl}
          tshirtColor={tshirtColor}
        />
      </motion.div>

      <div className="flex justify-center gap-3 mb-6">
        {(["white", "black", "navy"] as const).map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorChange?.(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              tshirtColor === color 
                ? "border-blue-500 shadow-lg scale-110" 
                : "border-gray-200 hover:border-gray-300"
            } ${
              color === "white" ? "bg-white" :
              color === "black" ? "bg-gray-900" :
              "bg-blue-900"
            }`}
          />
        ))}
      </div>

      <div className="space-y-3 md:space-y-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springTransition }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">收货人姓名</label>
          <input
            type="text"
            autoComplete="name"
            value={shippingData.name}
            onChange={(e) => onShippingDataChange({ ...shippingData, name: e.target.value })}
            placeholder="请输入收货人姓名"
            className="w-full px-4 py-3.5 md:py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 text-base"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ...springTransition }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
          <input
            ref={inputRef}
            type="tel"
            autoComplete="tel"
            value={shippingData.phone}
            onChange={onPhoneChange}
            placeholder="请输入手机号码"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full px-4 py-3.5 md:py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 text-base"
          />
          {phoneError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1.5"
            >
              {phoneError}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springTransition }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
          <input
            type="text"
            autoComplete="street-address"
            value={shippingData.address}
            onChange={(e) => onShippingDataChange({ ...shippingData, address: e.target.value })}
            placeholder="省、市、区、街道、门牌号"
            className="w-full px-4 py-3.5 md:py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 text-base"
          />
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ...springTransition }}
        onClick={onContinue}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-md mx-auto mt-6 md:mt-8 py-4 md:py-4.5 bg-gray-900 text-white rounded-2xl font-medium text-base hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/20"
        style={{ touchAction: 'manipulation' }}
      >
        继续选择支付方式
      </motion.button>

      <p className="text-center text-sm text-gray-400 mt-4">
        请准确填写配送信息
      </p>
    </div>
  )
}

interface ShippingViewProps {
  shippingData: ShippingData
  onShippingDataChange: (data: ShippingData) => void
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  phoneError: string
  onContinue: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

function PaymentView({ selectedPayment, onSelectPayment, onContinue, total, isProcessing }: PaymentViewProps) {
  return (
    <div className="px-4 md:px-6 pb-6 md:pb-8 pt-2 md:pt-4">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-6 md:mb-8"
      >
        选择支付方式
      </motion.h2>

      <div className="space-y-3 md:space-y-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...springTransition }}
        >
          <PaymentOption
            type="wechat"
            label="微信支付"
            isSelected={selectedPayment === "wechat"}
            onSelect={() => onSelectPayment("wechat")}
            icon={
              <svg viewBox="0 0 24 24" className="w-7 h-7">
                <defs>
                  <linearGradient id="wechatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#07C160" />
                    <stop offset="100%" stopColor="#06AD56" />
                  </linearGradient>
                </defs>
                <path fill="url(#wechatGradient)" d="M12.011 2C6.48 2 2 6.025 2 10.978c0 2.29 1.11 4.352 2.87 5.761a.56.56 0 0 1 .213.638l-.39 1.477c-.02.07-.048.14-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM7.611 6.513c.54 0 .978.449.978 1.003 0 .554-.438 1.003-.978 1.003-.54 0-.978-.449-.978-1.003 0-.554.438-1.003.978-1.003zm5.813 0c.54 0 .978.449.978 1.003 0 .554-.438 1.003-.978 1.003-.54 0-.978-.449-.978-1.003 0-.554.438-1.003.978-1.003z"/>
              </svg>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...springTransition }}
        >
          <PaymentOption
            type="alipay"
            label="支付宝"
            isSelected={selectedPayment === "alipay"}
            onSelect={() => onSelectPayment("alipay")}
            icon={
              <svg viewBox="0 0 24 24" className="w-7 h-7">
                <defs>
                  <linearGradient id="alipayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1677FF" />
                    <stop offset="100%" stopColor="#0958DB" />
                  </linearGradient>
                </defs>
                <path fill="url(#alipayGradient)" d="M21.59 8.735a2.94 2.94 0 0 0-.6-1.153 2.84 2.84 0 0 0-1.098-.66A8.77 8.77 0 0 0 17.1 6.5c-1.14-.2-2.31-.3-3.49-.3-2.94 0-5.85.5-8.56 1.44-.38.13-.77.26-1.15.4A2.52 2.52 0 0 0 2.4 9.82a2.33 2.33 0 0 0 .57 2.16c.39.46.88.8 1.43 1.01.35.13.71.24 1.07.33.33.08.67.15 1.01.21.47.08.94.15 1.42.2a24.9 24.9 0 0 0 4.01.26c.55 0 1.1-.01 1.65-.04.35-.02.7-.04 1.04-.07l.96-.08a9.43 9.43 0 0 0 2.85-.69c.53-.24 1.04-.53 1.51-.87.25-.18.48-.37.7-.58a3.22 3.22 0 0 0 .98-1.51 2.7 2.7 0 0 0 .08-.74z"/>
              </svg>
            }
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, ...springTransition }}
        className="mt-6 md:mt-8 p-4 bg-gray-50 rounded-2xl max-w-md mx-auto"
      >
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>定制 T 恤</span>
          <span>¥69.9</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>顺丰包邮</span>
          <span>¥0</span>
        </div>
        <div className="flex justify-between text-base md:text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
          <span>合计</span>
          <span>¥{total}</span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...springTransition }}
        onClick={onContinue}
        disabled={!selectedPayment || isProcessing}
        whileTap={selectedPayment && !isProcessing ? { scale: 0.97 } : {}}
        className={`w-full max-w-md mx-auto mt-6 py-4 md:py-4.5 rounded-2xl font-medium text-base transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
          selectedPayment && !isProcessing
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            正在创建订单...
          </>
        ) : (
          "确认支付"
        )}
      </motion.button>
    </div>
  )
}

interface PaymentViewProps {
  selectedPayment: "wechat" | "alipay" | null
  onSelectPayment: (payment: "wechat" | "alipay") => void
  onContinue: () => void
  total: number
  isProcessing?: boolean
}

function PaymentOption({
  type,
  label,
  icon,
  isSelected,
  onSelect,
}: {
  type: "wechat" | "alipay"
  label: string
  icon: React.ReactNode
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`relative w-full p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springTransition}
          className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10"
        />
      )}

      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-11 h-11 md:w-12 md:h-12 ${type === "wechat" ? "bg-green-500" : "bg-blue-600"} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-base md:text-lg font-medium text-gray-900">{label}</span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl border-2 border-blue-400"
          style={{
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          }}
        />
      )}
    </motion.button>
  )
}

function PaymentQRView({ qrCode, paymentMethod, orderId, onCancel, isPolling }: {
  qrCode: string
  paymentMethod: "wechat" | "alipay"
  orderId: string
  onCancel: () => void
  isPolling: boolean
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 md:px-6 pb-6 md:pb-8 pt-2 md:pt-4"
      >
        <motion.div
          animate={{
            rotate: isPolling ? [0, 360] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 mb-6"
        >
          <Loader2 className="w-16 h-16 text-blue-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-semibold text-gray-900 mb-2"
        >
          正在跳转支付...
        </motion.h2>

        <p className="text-gray-500 text-center mb-6">
          请在支付页面完成付款
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          取消支付
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="px-4 md:px-6 pb-6 md:pb-8 pt-2 md:pt-4">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-6 md:mb-8"
      >
        请扫码支付
      </motion.h2>

      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, ...springTransition }}
          className="relative p-6 bg-white rounded-3xl shadow-xl"
        >
          <div className="absolute inset-0 rounded-3xl backdrop-blur-sm bg-white/50" />
          <div className="relative">
            <img
              src={qrCode}
              alt="支付二维码"
              className="w-48 h-48 rounded-2xl"
            />

            {isPolling && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/60" />
                <div className="relative flex flex-col items-center">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 mb-2"
                  >
                    <Loader2 className="w-12 h-12 text-blue-500" />
                  </motion.div>
                  <p className="text-gray-600 text-sm font-medium">等待支付中...</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-6 p-4 bg-gray-50 rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 font-medium">
              请使用{paymentMethod === "wechat" ? "微信" : "支付宝"}扫码
            </p>
            <p className="text-xs text-gray-500">订单号: {orderId}</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="mt-6 px-6 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          取消支付
        </motion.button>
      </div>
    </div>
  )
}

function SuccessView({ onClose }: { onClose: () => void }) {
  const [orderId] = useState(() => `ORD${Math.random().toString(36).substr(2, 9).toUpperCase()}`)

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 md:px-6 pb-6 md:pb-8 pt-2 md:pt-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, ...springTransition }}
        className="relative w-28 h-28 md:w-32 md:h-32 mb-6 md:mb-8"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, ...springTransition }}
        />
        <motion.div
          className="absolute inset-3 md:inset-4 rounded-full bg-green-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, ...springTransition }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, ...springTransition }}
        >
          <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ...springTransition }}
        className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3 text-center"
      >
        支付成功
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, ...springTransition }}
        className="text-gray-500 text-center mb-2 text-sm md:text-base"
      >
        订单已排产
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, ...springTransition }}
        className="text-gray-900 font-medium text-center mb-6 md:mb-8 text-sm md:text-base"
      >
        订单正在处理中
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, ...springTransition }}
        className="w-full max-w-sm p-4 bg-gray-50 rounded-2xl mb-6 md:mb-8"
      >
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>订单编号</span>
          <span className="font-mono">{orderId}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>预计发货</span>
          <span>3-5 个工作日</span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, ...springTransition }}
        onClick={onClose}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-sm py-4 md:py-4.5 bg-gray-900 text-white rounded-2xl font-medium text-base hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/20"
        style={{ touchAction: 'manipulation' }}
      >
        完成
      </motion.button>
    </div>
  )
}

export default function PaymentSheet({ isOpen, onClose, total, generatedImageUrl }: PaymentSheetProps) {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState<"shipping" | "payment" | "qr" | "success">("shipping")
  const [direction, setDirection] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<"wechat" | "alipay" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingData>({
    name: "",
    phone: "",
    address: "",
  })
  const [phoneError, setPhoneError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [tshirtColor, setTshirtColor] = useState<"white" | "black" | "navy">("white")
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentPaymentUrl, setCurrentPaymentUrl] = useState("")
  const [currentOrderId, setCurrentOrderId] = useState("")

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const formatPhone = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }, [])

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setShippingData({ ...shippingData, phone: formatted })

    if (formatted.replace(/\D/g, "").length === 11) {
      setPhoneError("")
    }
  }, [shippingData, formatPhone])

  const validateShipping = useCallback(() => {
    if (!shippingData.name.trim()) {
      return false
    }
    if (shippingData.phone.replace(/\D/g, "").length !== 11) {
      setPhoneError("请输入正确的手机号码")
      return false
    }
    if (!shippingData.address.trim()) {
      return false
    }
    return true
  }, [shippingData])

  const handleContinueToPayment = useCallback(() => {
    if (validateShipping()) {
      setDirection(1)
      setCurrentView("payment")
    }
  }, [validateShipping])

  const handleBack = useCallback(() => {
    if (currentView === "qr") {
      setDirection(-1)
      setCurrentView("payment")
      setIsPolling(false)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    } else if (currentView === "payment") {
      setDirection(-1)
      setCurrentView("shipping")
    }
  }, [currentView])

  const pollOrderStatus = useCallback((orderId: string) => {
    let attempts = 0
    const maxAttempts = 60

    pollingIntervalRef.current = setInterval(async () => {
      attempts++

      if (attempts >= maxAttempts) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        setIsPolling(false)
        return
      }

      const mockPaymentSuccess = Math.random() < 0.1
      
      if (mockPaymentSuccess) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        setIsPolling(false)
        setDirection(1)
        setCurrentView("success")
      }
    }, 2000)
  }, [])

  const handleContinueToQR = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log("🎯 [DEBUG] handleContinueToQR 被调用")
    console.log("📋 [DEBUG] selectedPayment:", selectedPayment)
    
    if (!selectedPayment) {
      console.log("❌ [DEBUG] 没有选择支付方式")
      return
    }

    console.log("⏳ [DEBUG] 设置 isProcessing 为 true")
    setIsProcessing(true)

    try {
      console.log("🚀 [DEBUG] 开始请求 /api/payment/create")
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "观象高定宠物服装",
          totalFee: 69.9,
        }),
      })

      console.log("📡 [DEBUG] 收到响应，状态码:", response.status)
      const data = await response.json()
      console.log("📦 [DEBUG] 响应数据:", data)

      console.log("🔍 [DEBUG] 检查 errcode:", data.errcode)
      
      if (data.errcode === 0 && data.url) {
        console.log("✅ [DEBUG] 虎皮椒返回成功，准备跳转到:", data.url)
        setIsProcessing(false)
        
        console.log("🚀 [DEBUG] 执行 window.location.href 跳转...")
        window.location.href = data.url
        return
      }

      if (data.errcode !== 0) {
        throw new Error(data.errmsg || data.error || "创建支付订单失败")
      }

      if (!data.url) {
        throw new Error("支付链接缺失")
      }

      console.log("✅ [DEBUG] 创建订单成功")
      setIsProcessing(false)
      
      setCurrentPaymentUrl(data.paymentUrl || data.url)
      setCurrentOrderId(data.orderId)
      console.log("🔄 [DEBUG] 设置 showQRModal 为 true")
      setShowQRModal(true)

    } catch (error) {
      console.error("❌ [DEBUG] 创建支付订单错误:", error)
      setIsProcessing(false)
      toast({
        title: "创建订单失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }, [selectedPayment, toast])

  const handlePaymentSuccess = useCallback(() => {
    setShowQRModal(false)
    setDirection(1)
    setCurrentView("success")
  }, [])

  const handleCancelPayment = useCallback(() => {
    setIsPolling(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    handleBack()
  }, [handleBack])

  const handleClose = useCallback(() => {
    onClose()
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    setTimeout(() => {
      setCurrentView("shipping")
      setSelectedPayment(null)
      setShippingData({ name: "", phone: "", address: "" })
      setPhoneError("")
      setIsProcessing(false)
      setIsPolling(false)
      setPaymentData(null)
    }, 500)
  }, [onClose])

  if (!isOpen) return null

  const renderCurrentView = () => {
    switch (currentView) {
      case "shipping":
        return (
          <ShippingView
            shippingData={shippingData}
            onShippingDataChange={setShippingData}
            onPhoneChange={handlePhoneChange}
            phoneError={phoneError}
            onContinue={handleContinueToPayment}
            inputRef={inputRef}
            onColorChange={setTshirtColor}
            tshirtColor={tshirtColor}
            generatedImageUrl={generatedImageUrl}
          />
        )
      case "payment":
        return (
          <PaymentView
            selectedPayment={selectedPayment}
            onSelectPayment={setSelectedPayment}
            onContinue={handleContinueToQR}
            total={total}
            isProcessing={isProcessing}
          />
        )
      case "qr":
        if (!paymentData) return null
        return (
          <PaymentQRView
            qrCode={paymentData.qrCode}
            paymentMethod={selectedPayment || "wechat"}
            orderId={paymentData.orderId}
            onCancel={handleCancelPayment}
            isPolling={isPolling}
          />
        )
      case "success":
        return <SuccessView onClose={handleClose} />
      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springTransition}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white/80 backdrop-blur-2xl rounded-t-3xl md:rounded-t-[2rem] shadow-2xl pointer-events-auto"
            style={{ maxHeight: isMobile ? "88vh" : "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col" style={{ maxHeight: isMobile ? "88vh" : "92vh" }}>
              <div className="flex items-center justify-center pt-4 pb-2 md:pt-3">
                <motion.div
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100) {
                      handleClose()
                    }
                  }}
                  className="w-12 h-1.5 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
                />
              </div>

              <div className="relative px-2">
                {currentView !== "success" && currentView !== "shipping" && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className="absolute top-0 left-2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors z-10 active:scale-95"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentView}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={springTransition}
                  >
                    {renderCurrentView()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-6 md:h-0" />
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
              <p className="text-[10px] text-gray-300">Designed by G-PHOTO in Jiangxi.</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      <AlipayQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        paymentUrl={currentPaymentUrl}
        orderId={currentOrderId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
