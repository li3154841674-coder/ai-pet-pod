"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  Copy,
  Check,
  ChevronLeft,
  X,
  User,
  MapPin,
  Phone,
  MessageCircle,
  Image,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react"

const studioName = "Mog Design Lab"

const orderData = {
  id: "ORD7K9M2NPQ",
  product: "专属定制 T 恤",
  amount: 69.9,
  status: "crafting",
  shippingNumber: "SF1428398476129384",
  shippingCompany: "顺丰速运",
  estimateDays: "3-5",
  address: {
    name: "张三",
    phone: "138****0000",
    fullAddress: "广东省深圳市龙华区民治街道梅龙路1001号",
  },
  timeline: [
    { id: 1, title: "AI 创作中", description: "正在提取宠物神态特征", status: "completed", time: "2024-03-18 14:30" },
    { id: 2, title: "手工排产", description: "专业工匠精心制作中", status: "completed", time: "2024-03-18 16:45" },
    { id: 3, title: "质检出库", description: "严格品控，确保完美", status: "current", time: "2024-03-19 09:20" },
    { id: 4, title: "顺丰配送", description: "预计 3-5 个工作日送达", status: "pending", time: "" },
  ],
  logistics: [
    { time: "14:32", date: "今天", status: "快件已到达【南昌转运中心】", location: "江西省南昌市", isNew: true },
    { time: "10:15", date: "今天", status: "快件已发出，正在发往下一站", location: "深圳市宝安区", isNew: false },
    { time: "08:42", date: "今天", status: "顺丰小哥已揽收", location: "深圳市龙华区民治街道", isNew: false },
    { time: "昨日", date: "昨天", status: "订单已生产完成，待发货", location: "工厂仓库", isNew: false },
  ],
}

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
}

function LogisticsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(orderData.shippingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springTransition}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">物流详情</h2>
                <p className="text-sm text-gray-500 mt-1">实时追踪您的订单配送状态</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{orderData.shippingCompany}</span>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">运输中</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-gray-700">{orderData.shippingNumber}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-sm font-medium text-gray-700">物流轨迹</span>
                <span className="text-xs text-gray-400">共 {orderData.logistics.length} 条记录</span>
              </motion.div>

              <div className="space-y-0">
                {orderData.logistics.map((logistic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, ...springTransition }}
                    className="relative flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={logistic.isNew ? {
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0, 0.7],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-3 h-3 rounded-full ${logistic.isNew ? "bg-blue-500" : "bg-gray-300"}`}
                      />
                      {index !== orderData.logistics.length - 1 && (
                        <div className={`w-0.5 flex-1 my-2 ${logistic.isNew ? "bg-blue-200" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${index !== orderData.logistics.length - 1 ? "border-b border-gray-100" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{logistic.date}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{logistic.time}</span>
                        {logistic.isNew && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">最新</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-0.5">{logistic.status}</p>
                      <p className="text-xs text-gray-400">{logistic.location}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const wechatId = "jhe18088442397"

  const handleCopyWechat = useCallback(() => {
    navigator.clipboard.writeText(wechatId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleSaveImage = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={springTransition}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-3xl">🎨</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-14 pb-6 px-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">专属主理人</h3>
                <p className="text-sm text-gray-500">您的私人定制顾问</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="w-40 h-40 mx-auto bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-4xl text-white font-bold">V</span>
                    </div>
                    <p className="text-xs text-gray-500">微信二维码</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">微信号：</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">{wechatId}</span>
                </div>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  您的每一件高定，我们都倾注全力。如有任何疑问，主理人将为您提供一对一专业服务。
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyWechat}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制微信号
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveImage}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      已保存
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      保存图片
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

const provinces = ["广东省", "北京市", "上海市", "浙江省", "江苏省", "四川省", "湖北省", "湖南省"]
const cities: Record<string, string[]> = {
  "广东省": ["深圳市", "广州市", "东莞市", "佛山市"],
  "北京市": ["北京市"],
  "上海市": ["上海市"],
  "浙江省": ["杭州市", "宁波市", "温州市"],
  "江苏省": ["南京市", "苏州市", "无锡市"],
  "四川省": ["成都市", "绵阳市"],
  "湖北省": ["武汉市", "宜昌市"],
  "湖南省": ["长沙市", "株洲市"],
}

function AddressModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState(orderData.address.name)
  const [phone, setPhone] = useState(orderData.address.phone.replace("*", ""))
  const [province, setProvince] = useState(provinces[0])
  const [city, setCity] = useState(cities[provinces[0]][0])
  const [detail, setDetail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || phone.replace(/\s/g, "").length !== 11 || !detail.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    onClose()
    setIsSuccess(false)
  }, [name, phone, detail, onClose])

  const isValid = name.trim() && phone.replace(/\s/g, "").length === 11 && detail.trim()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springTransition}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">修改地址</h2>
                  <p className="text-sm text-gray-500">更新您的收货信息</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  收货人姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入收货人姓名"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  手机号码
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="138 0000 0000"
                  inputMode="numeric"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  所在地区
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value)
                      setCity(cities[e.target.value][0])
                    }}
                    className="px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 focus:border-blue-400 focus:bg-white appearance-none cursor-pointer"
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 focus:border-blue-400 focus:bg-white appearance-none cursor-pointer"
                  >
                    {cities[province].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细地址
                </label>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="街道、门牌号等详细信息"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="p-6 pt-0">
              <motion.button
                whileTap={{ scale: isValid ? 0.98 : 1 }}
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  isValid && !isSubmitting && !isSuccess
                    ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    修改中...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    修改成功
                  </>
                ) : (
                  "确认修改"
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PolicyCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          animate={{ backgroundColor: checked ? "#10B981" : "#E5E7EB" }}
          className="w-5 h-5 rounded-md border-2 border-transparent transition-all duration-200 flex items-center justify-center"
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.div>
      </div>
      <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
        我已了解并同意上述协议
      </span>
    </label>
  )
}

function AftersaleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [reason, setReason] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!reason.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    onClose()
    setIsSuccess(false)
    setPolicyAccepted(false)
    setReason("")
    setImages([])
  }, [reason, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springTransition}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">申请售后</h2>
                <p className="text-sm text-gray-500 mt-1">提交您的售后申请</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50/50 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">关于高定产品的唯一性与售后说明</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <p>本产品系基于 AI 深度学习生成的独一无二艺术创作，每一件都是专属于您的唯一作品。</p>
                  <p className="font-medium text-gray-800">重要说明：</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>一旦进入排产阶段，除重大质量问题外，不接受退换货申请</li>
                    <li>重大质量问题包括：面料破损、印花严重色差等</li>
                    <li>定制商品不支持因个人喜好（如颜色不喜欢、尺寸不合适等）导致的退换</li>
                    <li>如有任何疑问，请先联系主理人协助解决</li>
                  </ul>
                </div>
              </motion.div>

              <PolicyCheckbox checked={policyAccepted} onChange={setPolicyAccepted} />

              <AnimatePresence>
                {policyAccepted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={springTransition}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        问题描述
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="请详细描述您遇到的问题..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        上传凭证（可选）
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center"
                          >
                            <Image className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        ))}
                        {images.length < 3 && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center transition-colors"
                          >
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xl text-gray-500">+</span>
                              </div>
                              <span className="text-xs text-gray-400">添加图片</span>
                            </div>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 pt-0 border-t border-gray-100 flex-shrink-0">
              <motion.button
                whileTap={{ scale: policyAccepted && reason.trim() ? 0.98 : 1 }}
                onClick={handleSubmit}
                disabled={!policyAccepted || !reason.trim() || isSubmitting}
                className={`w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  policyAccepted && reason.trim() && !isSubmitting && !isSuccess
                    ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    提交中...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    提交成功
                  </>
                ) : (
                  "提交售后申请"
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function OrderHub() {
  const [activeModal, setActiveModal] = useState<"logistics" | "contact" | "address" | "aftersale" | null>(null)

  const currentStage = orderData.timeline.find((stage) => stage.status === "current")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <motion.div
          layout
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50"
        >
          <motion.div layout className="p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shadow-sm"
              >
                <img
                  src="/images/hero-shirt.png"
                  alt="定制T恤"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl font-semibold text-gray-900 mb-1"
                >
                  {orderData.product}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-500 mb-2"
                >
                  订单号：{orderData.id}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl md:text-2xl font-bold text-gray-900">¥{orderData.amount}</span>
                  <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {currentStage?.title || "制作中"}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, staggerChildren: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  物流追踪
                </h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("logistics")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  查看详情 →
                </motion.button>
              </div>

              <div className="space-y-0">
                {orderData.timeline.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, ...springTransition }}
                    className="relative flex gap-4 cursor-pointer"
                    onClick={() => setActiveModal("logistics")}
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={stage.status === "current" ? {
                          scale: [1, 1.3, 1],
                          boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 8px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-3 h-3 rounded-full ${
                          stage.status === "completed" ? "bg-blue-500" :
                          stage.status === "current" ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                      {index !== orderData.timeline.length - 1 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                          className={`w-0.5 my-2 ${stage.status !== "pending" ? "bg-blue-500" : "bg-gray-200"}`}
                          style={{ minHeight: "40px" }}
                        />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${index !== orderData.timeline.length - 1 ? "border-b border-gray-100" : ""}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${stage.status !== "pending" ? "text-gray-900" : "text-gray-400"}`}>
                          {stage.title}
                        </span>
                        {stage.status === "completed" && (
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {stage.status === "current" && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">进行中</span>
                        )}
                      </div>
                      <p className={`text-xs ${stage.status === "current" ? "text-gray-600" : "text-gray-400"}`}>
                        {stage.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div layout className="border-t border-gray-100 bg-gray-50/50 p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                需要帮助？
              </h4>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal("contact")}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      联系主理人
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal("address")}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📍</span>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block">修改地址</span>
                      <span className="text-xs text-gray-400">{orderData.address.fullAddress}</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal("aftersale")}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔧</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      申请售后
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-gray-300 mt-8 leading-relaxed"
        >
          Designed by {studioName} in Jiangxi.
          <br />
          每一件作品都是独一无二的艺术。
        </motion.p>
      </motion.div>

      <LogisticsModal isOpen={activeModal === "logistics"} onClose={() => setActiveModal(null)} />
      <ContactModal isOpen={activeModal === "contact"} onClose={() => setActiveModal(null)} />
      <AddressModal isOpen={activeModal === "address"} onClose={() => setActiveModal(null)} />
      <AftersaleModal isOpen={activeModal === "aftersale"} onClose={() => setActiveModal(null)} />
    </div>
  )
}
