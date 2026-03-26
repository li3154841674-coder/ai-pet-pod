'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGate() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => password.trim().length > 0 && !isSubmitting, [password, isSubmitting])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `登录失败 (${res.status})`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-xs tracking-[0.25em] text-gray-400">ADMIN</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">订单管理后台</h1>
          <p className="mt-2 text-sm text-gray-500">请输入管理密码以继续</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ADMIN_SECRET_KEY"
            autoFocus
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base outline-none ring-0 focus:border-gray-400"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              'w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              canSubmit ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isSubmitting ? '验证中…' : '进入后台'}
          </button>

          {error && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 text-xs text-gray-400 leading-relaxed">
          为了安全，密码只会发送到本站后端校验，且会写入 HttpOnly Cookie，不会暴露在前端代码里。
        </div>
      </div>
    </div>
  )
}

