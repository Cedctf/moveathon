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
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-gray-500">Manage your profile and assets</p>
          </div>
          {/* Wallet button removed */}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto">
        <div className="lg:mx-auto w-full">
          <FadeIn delay={200}>
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center text-center mb-6">
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-6 w-24 mt-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-24 w-24 mb-4 animate-fadeIn rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-semibold">{userData.name.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl">{userData.name}</h3>
                    <p className="text-gray-500">{userData.email}</p>
                    <div className="flex items-center mt-2">
                      <span className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 text-sm px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" /> KYC Verified
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Wallet Address</div>
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <code className="text-xs truncate max-w-[180px]">{userData.walletAddress}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-600"
                          onClick={() => copyToClipboard(userData.walletAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Member Since</div>
                    {loading ? <Skeleton className="h-5 w-24" /> : <div className="text-sm">{userData.joinDate}</div>}
                  </div>

                  <hr className="border-t border-gray-200 my-4" />

                  <div className="pt-2">
                    <div className="text-sm font-medium mb-3">Security Level</div>
                    <Progress value={loading ? 0 : securityProgress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Basic</span>
                      <span>Advanced</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="text-sm">Two-Factor Authentication</span>
                          </div>
                          <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full transition-all duration-300 hover:bg-emerald-700">
                            Enabled
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="text-sm">KYC Verification</span>
                          </div>
                          <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full transition-all duration-300 hover:bg-emerald-700">
                            Completed
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">Payment Method</span>
                          </div>
                          <span className="text-xs border border-gray-300 px-2 py-1 rounded-full transition-all duration-300 hover:border-emerald-600">
                            Not Added
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <div className="lg:col-span-2 w-full mx-auto">
          <FadeIn delay={300}>
            <Tabs defaultValue="assets" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                <TabsTrigger value="assets" className="data-[state=active]:bg-white">My Assets</TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-white">Transactions</TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-white">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="assets" className="mt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Your Tokenized Assets</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all duration-300 hover:border-emerald-600 hover:text-emerald-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> List New Asset
                    </Button>
                  </div>

                  {loading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Card key={index} className="transition-all duration-300 hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div>
                                <Skeleton className="h-5 w-40 mb-2" />
                                <div className="flex items-center gap-2 mt-1">
                                  <Skeleton className="h-5 w-16" />
                                  <Skeleton className="h-5 w-20" />
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-6 w-24 mb-1" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full mb-2" />
                            <div className="flex justify-between">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <StaggerContainer>
                      {assets.map((asset) => (
                        <StaggerItem key={asset.id}>
                          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    {asset.type === "Real Estate" ? (
                                      <Building2 className="h-6 w-6 text-gray-500" />
                                    ) : (
                                      <Coins className="h-6 w-6 text-gray-500" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{asset.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span 
                                        className="text-xs border rounded px-2 py-0.5 transition-all duration-300 hover:border-emerald-600"
                                      >
                                        {asset.symbol}
                                      </span>
                                      <span
                                        className="text-xs border rounded px-2 py-0.5 transition-all duration-300 hover:border-emerald-600"
                                      >
                                        {asset.type}
                                      </span>
                                      {asset.status === "pending" && (
                                        <span
                                          className="text-xs border rounded px-2 py-0.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                                        >
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    $<CountUp end={asset.value} />
                                  </div>
                                  <div className="text-sm text-gray-500">Total Value</div>
                                </div>
                              </div>

                              <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-500">Your Ownership</span>
                                  <span className="font-medium">{(asset.ownership * 100).toFixed(2)}%</span>
                                </div>
                                <Progress
                                  value={asset.ownership * 100}
                                  className="h-2 mb-2 transition-all duration-1000"
                                />
                                <div className="flex justify-between text-sm">
                                  <span>
                                    Your Value:{" "}
                                    <span className="font-medium">
                                      $<CountUp end={asset.value * asset.ownership} />
                                    </span>
                                  </span>
                                  <Link
                                    href="#"
                                    className="text-emerald-600 flex items-center transition-all duration-300 hover:text-emerald-700"
                                  >
                                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  )}

                  <FadeIn delay={600}>
                    <Card className="transition-all duration-300 hover:shadow-md">
                      <CardHeader>
                        <CardTitle>Portfolio Summary</CardTitle>
                        <CardDescription>Overview of your tokenized assets</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Total Value</div>
                            {loading ? (
                              <Skeleton className="h-8 w-24" />
                            ) : (
                              <div className="font-bold text-2xl">
                                $<CountUp end={150000} />
                              </div>
                            )}
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Assets</div>
                            {loading ? (
                              <Skeleton className="h-8 w-16" />
                            ) : (
                              <div className="font-bold text-2xl">
                                <CountUp end={2} />
                              </div>
                            )}
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Earnings (YTD)</div>
                            {loading ? (
                              <Skeleton className="h-8 w-24" />
                            ) : (
                              <div className="font-bold text-2xl text-emerald-600">
                                $<CountUp end={12500} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Asset Allocation</h4>
                          {loading ? (
                            <>
                              <Skeleton className="h-8 w-full mb-3" />
                              <div className="flex gap-4">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-32" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-8 w-full rounded-full overflow-hidden bg-gray-100 flex">
                                <div
                                  className="h-full bg-emerald-600 transition-all duration-1000"
                                  style={{ width: "0%" }}
                                  id="real-estate-bar"
                                ></div>
                                <div
                                  className="h-full bg-blue-500 transition-all duration-1000"
                                  style={{ width: "0%" }}
                                  id="luxury-bar"
                                ></div>
                              </div>
                              <div className="flex gap-4 mt-3">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                                  <span className="text-sm">Real Estate (83.3%)</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  <span className="text-sm">Luxury Items (16.7%)</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full transition-all duration-300 hover:border-emerald-600 hover:text-emerald-600"
                        >
                          <Download className="h-4 w-4 mr-2" /> Export Portfolio Report
                        </Button>
                      </CardFooter>
                    </Card>
                  </FadeIn>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-6">
                {/* Transactions content will go here */}
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                {/* Documents content will go here */}
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}