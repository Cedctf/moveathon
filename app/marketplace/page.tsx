"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Filter,
  MapPin,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronsUpDown,
  DollarSign,
  Percent,
  PlusCircle,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Mock data for assets
const assets = [
    {
      id: 1,
      name: "Luxury Apartment in Manhattan",
      type: "Real Estate",
      subtype: "Residential",
      location: "New York, USA",
      price: 2500000,
      tokenSymbol: "MANH-APT",
      image: "/placeholder.svg?height=300&width=400",
      verified: true,
    },
    {
      id: 2,
      name: "Commercial Building in Tokyo",
      type: "Real Estate",
      subtype: "Commercial",
      location: "Tokyo, Japan",
      price: 8750000,
      tokenSymbol: "TKY-COM",
      image: "/placeholder.svg?height=300&width=400",
      verified: true,
    },
    {
      id: 3,
      name: "Vineyard Estate in Bordeaux",
      type: "Real Estate",
      subtype: "Agricultural",
      location: "Bordeaux, France",
      price: 4200000,
      tokenSymbol: "BDX-VIN",
      image: "/placeholder.svg?height=300&width=400",
      verified: false,
    },
    {
      id: 4,
      name: "Beachfront Villa in Bali",
      type: "Real Estate",
      subtype: "Residential",
      location: "Bali, Indonesia",
      price: 1850000,
      tokenSymbol: "BAL-VIL",
      image: "/placeholder.svg?height=300&width=400",
      verified: true,
    },
  ]

  const pools = [
    {
      id: 1,
      name: "USDC / MANH-APT",
      totalLiquidity: 4500000,
      apr: 12.5,
      userShare: 0.05,
      userLiquidity: 225000,
      rewards: 28125,
      token1: "USDC",
      token2: "MANH-APT",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "USDC / TKY-COM",
      totalLiquidity: 8200000,
      apr: 9.8,
      userShare: 0.02,
      userLiquidity: 164000,
      rewards: 16072,
      token1: "USDC",
      token2: "TKY-COM",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "USDC / VRD-LUX",
      totalLiquidity: 950000,
      apr: 18.2,
      userShare: 0.1,
      userLiquidity: 95000,
      rewards: 17290,
      token1: "USDC",
      token2: "VRD-LUX",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "USDC / BDX-VIN",
      totalLiquidity: 3800000,
      apr: 11.4,
      userShare: 0,
      userLiquidity: 0,
      rewards: 0,
      token1: "USDC",
      token2: "BDX-VIN",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "USDC / BER-ART",
      totalLiquidity: 1250000,
      apr: 15.7,
      userShare: 0.08,
      userLiquidity: 100000,
      rewards: 15700,
      token1: "USDC",
      token2: "BER-ART",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
  ]

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
            <p className="text-gray-500">Discover, invest, and provide liquidity for tokenized assets</p>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}


