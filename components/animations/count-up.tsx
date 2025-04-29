"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  delay?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
  className?: string
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const countRef = useRef<number>(start)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startAnimation = () => {
      startTimeRef.current = Date.now()
      countRef.current = start

      const step = () => {
        const now = Date.now()
        const elapsed = now - (startTimeRef.current || 0)
        const progress = Math.min(elapsed / duration, 1)

        countRef.current = start + (end - start) * easeOutQuart(progress)
        setCount(countRef.current)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step)
        }
      }

      frameRef.current = requestAnimationFrame(step)
    }

    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [start, end, duration, delay])

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return `${prefix}${parts.join(".")}${suffix}`
  }

  return <span className={className}>{formatNumber(count)}</span>
}

// Easing function for smooth animation
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4)
}
