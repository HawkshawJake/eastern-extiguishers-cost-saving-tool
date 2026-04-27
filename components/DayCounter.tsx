'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/calculations'

function useCountUp(target: number) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target <= 0) { setCurrent(0); return }
    const duration = 1800
    const startTime = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return current
}

export default function DayCounter() {
  const [mounted, setMounted] = useState(false)
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/total-saving')
      const json = await res.json()
      setTotal(json.total ?? 0)
      setCount(json.count ?? 0)
      setMounted(true)
    }
    load()

    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const animatedTotal = useCountUp(total)

  if (!mounted) {
    return (
      <div className="bg-brand-dark w-full py-8">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <div className="h-4 w-48 bg-white/10 rounded mx-auto mb-3" />
          <div className="h-14 w-64 bg-white/10 rounded mx-auto mb-2" />
          <div className="h-4 w-32 bg-white/10 rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark w-full py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-5 text-center">
        <p className="font-body text-white/40 uppercase tracking-widest text-xs mb-3">
          Total savings calculated today
        </p>
        <p className="font-heading font-black text-5xl md:text-6xl text-brand-red-light tabular-nums leading-none">
          {formatCurrency(animatedTotal)}
        </p>
        <p className="font-body text-white/50 text-sm mt-3">
          across{' '}
          <span className="text-white/70 font-semibold">{count}</span>{' '}
          {count === 1 ? 'business' : 'businesses'}
        </p>
      </div>
    </div>
  )
}
