"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...newToast, id }])
    
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg",
              toast.variant === "destructive" && "border-red-500 bg-red-50"
            )}
          >
            <div className="font-semibold">{toast.title}</div>
            {toast.description && <div className="text-sm text-gray-500">{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
