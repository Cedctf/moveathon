"use client"

import { useEffect, useState, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card } from "@/components/ui/card"

// Generate mock price data
const generateMockData = () => {
  const data = []
  const now = new Date()
  const basePrice = 2500000

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate a random price with a slight upward trend
    const randomFactor = 0.98 + Math.random() * 0.04
    const price = basePrice * (1 + (30 - i) * 0.005) * randomFactor

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(price),
      volume: Math.round(Math.random() * 500000 + 200000),
    })
  }

  return data
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function PriceChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)

      // Start animation
      let start: number | null = null
      const animate = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / 1500, 1)
        setAnimationProgress(progress)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }, 1000)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return `${(value / 1000).toFixed(0)}K`
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 border shadow-sm bg-background">
          <p className="font-medium">{label}</p>
          <p className="text-emerald-600">Price: ${payload[0].value.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Volume: ${(payload[1].value / 1000).toFixed(0)}K</p>
        </Card>
      )
    }

    return null
  }

  // Calculate the visible portion of the data based on animation progress
  const visibleData = loading ? [] : data.slice(0, Math.ceil(data.length * animationProgress))

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading chart data...</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={visibleData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
        <YAxis
          yAxisId="left"
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          tickMargin={10}
          domain={["auto", "auto"]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          tick={{ fontSize: 12 }}
          tickMargin={10}
          domain={[0, "dataMax + 100000"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="price"
          stroke="#10b981"
          activeDot={{ r: 8 }}
          name="Price (USD)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false} // We're handling our own animation
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="volume"
          stroke="#6b7280"
          name="Volume (USD)"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false} // We're handling our own animation
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
