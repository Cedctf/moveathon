"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  History,
  Landmark,
  Shield,
  User,
  Wallet,
  PlusCircle,
} from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { CountUp } from "@/components/animations/count-up"
import { Skeleton } from "@/components/ui/skeleton"

// Mock user data
const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  kycStatus: "verified",
  joinDate: "Jan 15, 2023",
  avatar: "/placeholder.svg?height=100&width=100",
}

// Mock assets data
const assets = [
  {
    id: 1,
    name: "Manhattan Apartment",
    symbol: "MANH-APT",
    type: "Real Estate",
    value: 2500000,
    ownership: 0.05,
    status: "active",
  },
  {
    id: 2,
    name: "Vintage Rolex Daytona",
    symbol: "VRD-LUX",
    type: "Luxury Item",
    value: 125000,
    ownership: 0.2,
    status: "pending",
  },
]

// Mock transactions data
const transactions = [
  {
    id: 1,
    type: "buy",
    asset: "MANH-APT",
    amount: "0.05",
    value: 125000,
    date: "Mar 15, 2023",
    status: "completed",
  },
  {
    id: 2,
    type: "add_liquidity",
    asset: "USDC/MANH-APT",
    amount: "50000",
    value: 50000,
    date: "Mar 10, 2023",
    status: "completed",
  },
  {
    id: 3,
    type: "buy",
    asset: "VRD-LUX",
    amount: "0.2",
    value: 25000,
    date: "Feb 28, 2023",
    status: "completed",
  },
  {
    id: 4,
    type: "withdraw_rewards",
    asset: "USDC/MANH-APT",
    amount: "2500",
    value: 2500,
    date: "Feb 15, 2023",
    status: "completed",
  },
  {
    id: 5,
    type: "list_asset",
    asset: "Vintage Rolex Daytona",
    amount: "1",
    value: 125000,
    date: "Feb 10, 2023",
    status: "completed",
  },
]

export default function AccountPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(true)
  const [loading, setLoading] = useState(true)
  const [securityProgress, setSecurityProgress] = useState(0)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    // Animate security progress
    const progressTimer = setTimeout(() => {
      const animateProgress = () => {
        setSecurityProgress((prev) => {
          if (prev >= 80) return 80
          return prev + 1
        })
      }

      const interval = setInterval(animateProgress, 20)
      return () => clearInterval(interval)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(progressTimer)
    }
  }, [])

  const toggleWalletConnection = () => {
    setIsWalletConnected(!isWalletConnected)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="container py-8 px-4">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-gray-500">Manage your profile and assets</p>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          {/* Profile section will go here */}
        </div>

        <div className="lg:col-span-2">
          {/* Tabs section will go here */}
        </div>
      </div>
    </div>
  )
}