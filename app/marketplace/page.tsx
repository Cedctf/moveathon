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
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [marketplaceTab, setMarketplaceTab] = useState("assets")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
      setFilteredAssets(assets)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let result = [...assets]

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((asset) => asset.subtype.toLowerCase() === selectedType.toLowerCase())
    }

    // Filter by price range
    if (selectedPrice !== "all") {
      const [min, max] = selectedPrice.split("-").map(Number)
      if (max) {
        result = result.filter((asset) => asset.price >= min && asset.price <= max)
      } else {
        result = result.filter((asset) => asset.price >= min)
      }
    }

    // Filter by location
    if (selectedLocation !== "all") {
      result = result.filter((asset) => asset.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    setFilteredAssets(result)
  }, [searchTerm, selectedType, selectedPrice, selectedLocation])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

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

      <Tabs defaultValue="assets" value={marketplaceTab} onValueChange={setMarketplaceTab} className="mb-8 mx-auto">
        <FadeIn delay={200}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="assets" className="data-[state=active]:bg-white">Assets</TabsTrigger>
              <TabsTrigger value="pools" className="data-[state=active]:bg-white">Liquidity Pools</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder={marketplaceTab === "assets" ? "Search assets..." : "Search pools..."}
                  className="pl-8 w-full md:w-[250px] bg-white"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="icon" className="bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FadeIn>

        <TabsContent value="assets" className="mt-0 mx-auto">
          <FadeIn delay={300}>
            <div className="flex flex-wrap gap-4 mb-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="hover:bg-emerald-50 cursor-pointer">All Types</SelectItem>
                  <SelectItem value="residential" className="hover:bg-emerald-50 cursor-pointer">Residential</SelectItem>
                  <SelectItem value="commercial" className="hover:bg-emerald-50 cursor-pointer">Commercial</SelectItem>
                  <SelectItem value="agricultural" className="hover:bg-emerald-50 cursor-pointer">Agricultural</SelectItem>
                  <SelectItem value="watch" className="hover:bg-emerald-50 cursor-pointer">Watches</SelectItem>
                  <SelectItem value="art" className="hover:bg-emerald-50 cursor-pointer">Art</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="hover:bg-emerald-50 cursor-pointer">All Prices</SelectItem>
                  <SelectItem value="0-100000" className="hover:bg-emerald-50 cursor-pointer">
                    <span className="inline-block w-full">$0 - $100,000</span>
                  </SelectItem>
                  <SelectItem value="100000-500000" className="hover:bg-emerald-50 cursor-pointer">
                    <span className="inline-block w-full">$100,000 - $500,000</span>
                  </SelectItem>
                  <SelectItem value="500000-1000000" className="hover:bg-emerald-50 cursor-pointer">
                    <span className="inline-block w-full">$500,000 - $1,000,000</span>
                  </SelectItem>
                  <SelectItem value="1000000-5000000" className="hover:bg-emerald-50 cursor-pointer">
                    <span className="inline-block w-full">$1,000,000 - $5,000,000</span>
                  </SelectItem>
                  <SelectItem value="5000000" className="hover:bg-emerald-50 cursor-pointer">
                    <span className="inline-block w-full">$5,000,000+</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="hover:bg-emerald-50 cursor-pointer">All Locations</SelectItem>
                  <SelectItem value="new york" className="hover:bg-emerald-50 cursor-pointer">North America</SelectItem>
                  <SelectItem value="europe" className="hover:bg-emerald-50 cursor-pointer">Europe</SelectItem>
                  <SelectItem value="tokyo" className="hover:bg-emerald-50 cursor-pointer">Asia</SelectItem>
                  <SelectItem value="bali" className="hover:bg-emerald-50 cursor-pointer">Oceania</SelectItem>
                  <SelectItem value="africa" className="hover:bg-emerald-50 cursor-pointer">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative h-48">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <StaggerItem key={asset.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48">
                      <Image src={asset.image || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                      {asset.verified && (
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full transition-all duration-300 hover:bg-emerald-700">
                          Verified
                        </span>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{asset.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" /> {asset.location}
                          </CardDescription>
                        </div>
                        <span className="ml-2 text-xs border border-gray-200 rounded-full px-2 py-1">
                          {asset.type}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Token Symbol</p>
                          <p className="font-medium">{asset.tokenSymbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-bold">${asset.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all duration-300 hover:border-emerald-600 hover:text-emerald-600"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 hover:shadow text-white"
                      >
                        Trade sRWA
                      </Button>
                    </CardFooter>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </TabsContent>

        <TabsContent value="pools" className="mt-0 mx-auto">
          {/* Pools content will go here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}


