"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

export interface OrderFinderResult {
  orderId?: string | null
  size?: string | null
  recipientName?: string | null
  contactNumber?: string | null
  address?: string | null
  designPreview?: string | null
  expressCompany?: string | null
  expressNumber?: string | null
  price?: number | null
}

interface OrderFinderProps {
  onOrderFound?: (order: OrderFinderResult) => void
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export default function OrderFinder({ onOrderFound }: OrderFinderProps) {
  const [phone, setPhone] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [foundOrder, setFoundOrder] = useState<OrderFinderResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }, [])

  const handleSearch = useCallback(async () => {
    const rawPhone = phone.replace(/\D/g, "")
    if (rawPhone.length !== 11) return

    setIsSearching(true)
    setHasSearched(false)
    setError(null)
    setFoundOrder(null)

    try {
      const res = await fetch("/api/get-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || "未找到相关订单")

      const mapped = payload?.mapped || {}
      const result: OrderFinderResult = {
        orderId: payload?.order?.id || payload?.order?.order_id || null,
        size: mapped.size || null,
        recipientName: mapped.recipientName || null,
        contactNumber: mapped.contactNumber || null,
        address: mapped.address || null,
        designPreview: mapped.designPreview || null,
        expressCompany: mapped.expressCompany || null,
        expressNumber: mapped.expressNumber || null,
        price: typeof payload?.order?.amount === "number" ? payload.order.amount : typeof payload?.order?.total_fee === "number" ? payload.order.total_fee : null,
      }

      setFoundOrder(result)
      onOrderFound?.(result)
      setHasSearched(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "未找到相关订单"
      setError(message)
      setFoundOrder(null)
      onOrderFound?.({})
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }, [onOrderFound, phone])

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div layout className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
        <motion.button
          layout
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-900">查找订单</h3>
              <p className="text-sm text-gray-500">通过手机号查询您的订单</p>
            </div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden">
              <div className="px-6 pb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="请输入下单时的手机号码"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {phone.length > 0 && (
                          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setPhone("")} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSearch}
                    disabled={phone.replace(/\D/g, "").length !== 11 || isSearching}
                    className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 ${phone.replace(/\D/g, "").length === 11 && !isSearching ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  >
                    {isSearching ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        搜索中...
                      </span>
                    ) : (
                      "查询订单"
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {hasSearched && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />
                      {error ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 mb-1">{error}</p>
                          <p className="text-xs text-gray-400">请确认手机号码是否正确</p>
                        </div>
                      ) : foundOrder ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">找到订单</h4>
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">已查询</span>
                              <span className="text-xs text-gray-400">{foundOrder.orderId || "-"}</span>
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-1">专属定制 T 恤</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 font-mono">{foundOrder.contactNumber || phone}</span>
                              <span className="text-sm font-semibold text-gray-900">¥{foundOrder.price ?? "69.9"}</span>
                            </div>
                          </motion.div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
