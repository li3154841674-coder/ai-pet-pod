"use client"

import { useEffect, useRef } from "react"
import "./Galaxy.css"

export default function Galaxy({
  className = "",
  ...rest
}: {
  className?: string
  [key: string]: unknown
}) {
  const ctnDom = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ctnDom.current
    if (!el) return

    let raf = 0
    const animate = () => {
      raf = window.requestAnimationFrame(animate)
    }
    raf = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={ctnDom} className={`galaxy-container ${className}`} {...rest}>
      <div className="galaxy-layer galaxy-layer-1" />
      <div className="galaxy-layer galaxy-layer-2" />
      <div className="galaxy-layer galaxy-layer-3" />
    </div>
  )
}
