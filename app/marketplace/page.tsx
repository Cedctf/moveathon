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
  Loader2,
  RefreshCw
} from "lucide-react"
import Image from "next/image"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client'
import { ConnectButton, useCurrentWallet, useCurrentAccount } from '@iota/dapp-kit'

// Constants
const LIQUIDITY_POOL_PACKAGE_ID = '0x6a4fea4813774d803ac7e6478335d06a38591a695147f2d66d651f59bb354a7f'
const POOL_REGISTRY_ID = '0x7b958e3e2c475b85722e861e002a119ecab324533ede3a294eab21f036ea9abf'

// Real pool interface - minimal for fetching
interface RealPool {
  id: string;
  tokenA: string;
  tokenB: string;
}

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
      name: "USDC / IOTA",
      totalLiquidity: 4500,
      apr: 12.5,
      userShare: 0.05,
      userLiquidity: 225,
      rewards: 28.12,
      token1: "USDC",
      token2: "IOTA",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "USDT / IOTA",
      totalLiquidity: 8200,
      apr: 9.8,
      userShare: 0.02,
      userLiquidity: 164,
      rewards: 160.72,
      token1: "USDT",
      token2: "IOTA",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "USDT / IOTA",
      totalLiquidity: 9500,
      apr: 18.2,
      userShare: 0.1,
      userLiquidity: 950,
      rewards: 172.9,
      token1: "USDT",
      token2: "IOTA",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "USDC / BDX-VIN",
      totalLiquidity: 1000,
      apr: 11.4,
      userShare: 0.1,
      userLiquidity: 100,
      rewards: 1.14,
      token1: "USDC",
      token2: "BDX-VIN",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "USDC / BER-ART",
      totalLiquidity: 1250,
      apr: 15.7,
      userShare: 0.08,
      userLiquidity: 100,
      rewards: 15.70,
      token1: "USDC",
      token2: "BER-ART",
      token1Logo: "/placeholder.svg?height=40&width=40",
      token2Logo: "/placeholder.svg?height=40&width=40",
    },
  ]

export default function MarketplacePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedPool, setSelectedPool] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("add")
  const [amount1, setAmount1] = useState("")
  const [amount2, setAmount2] = useState("")
  const [marketplaceTab, setMarketplaceTab] = useState("assets")
  
  // IOTA related states - minimal for fetching pools
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  
  const [client, setClient] = useState<IotaClient | null>(null)
  const [loadingPools, setLoadingPools] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Registry state and pools
  const [registryId, setRegistryId] = useState<string>(POOL_REGISTRY_ID)
  const [realPools, setRealPools] = useState<RealPool[]>([])
  
  // Helper function to get token name from full type
  const getTokenName = (tokenType: string) => {
    if (!tokenType) return '';
    const parts = tokenType.split('::');
    return parts[parts.length - 1];
  }
  
  // Initialize IOTA client and fetch pools
  useEffect(() => {
    try {
      // Use getFullnodeUrl to define Testnet RPC location
      const rpcUrl = getFullnodeUrl('testnet')
      
      // Create a client connected to testnet
      const iotaClient = new IotaClient({ url: rpcUrl })
      setClient(iotaClient)
      
      // Fetch pools
      fetchPools(iotaClient, POOL_REGISTRY_ID)
    } catch (err) {
      console.error('Failed to initialize IOTA client:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize IOTA client')
    }
  }, [])
  
  // Update wallet connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setIsWalletConnected(true)
    } else {
      setIsWalletConnected(false)
    }
  }, [connectionStatus])
  
  // Fetch pools from registry - simplified version
  const fetchPools = async (clientInstance: IotaClient | null = null, regId: string | null = null) => {
    const activeClient = clientInstance || client
    const activeRegistryId = regId || registryId
    
    if (!activeClient || !activeRegistryId) {
      console.warn('Cannot fetch pools: client or registry ID not available')
      return
    }
    
    setLoadingPools(true)
    
    try {
      // Get the registry object directly by ID
      const registry = await activeClient.getObject({
        id: activeRegistryId,
        options: {
          showContent: true
        }
      })
      
      // Safely access content using type assertions
      const content = registry.data?.content as any
      
      if (!content?.fields?.pools) {
        console.warn('Registry has no pools field:', registry)
        setLoadingPools(false)
        return
      }
      
      // Extract pool IDs from the registry
      const poolIds = content.fields.pools.map((idObj: any) => idObj)
      
      // Fetch minimal details for each pool
      const poolDetails: RealPool[] = []
      
      for (const poolId of poolIds) {
        try {
          const poolObj = await activeClient.getObject({
            id: poolId,
            options: {
              showContent: true
            }
          })
          
          // Use type assertion to safely access fields
          const fields = (poolObj.data?.content as any)?.fields
          
          if (fields) {
            poolDetails.push({
              id: poolId,
              tokenA: fields.token_a_type || 'Unknown Token A',
              tokenB: fields.token_b_type || 'Unknown Token B'
            })
          }
        } catch (poolErr) {
          console.error(`Failed to fetch pool ${poolId}:`, poolErr)
        }
      }
      
      setRealPools(poolDetails)
      console.log('Fetched pools:', poolDetails)
    } catch (err) {
      console.error('Failed to fetch pools from registry:', err)
      setError('Failed to fetch pools from registry')
    } finally {
      setLoadingPools(false)
    }
  }

  useEffect(() => {
    // Simulate loading data for assets
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

  const handlePoolSelect = (pool: any) => {
    setSelectedPool(pool)
  }

  const toggleWalletConnection = () => {
    setIsWalletConnected(!isWalletConnected)
  }

  const handleAddLiquidity = () => {
    // Mock adding liquidity
    if (selectedPool) {
      alert(`Added ${amount1} ${selectedPool.token1} and ${amount2} ${selectedPool.token2} to the pool`)
      setSelectedPool(null)
      setAmount1("")
      setAmount2("")
    }
  }

  const handleWithdrawLiquidity = () => {
    // Mock withdrawing liquidity
    alert(`Withdrawn ${amount1} from the pool`)
    setSelectedPool(null)
    setAmount1("")
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto">
            {error && (
              <div className="lg:col-span-3 bg-red-50 text-red-600 p-4 rounded-md mb-4">
                {error}
                <button className="text-xs underline ml-2" onClick={() => setError(null)}>Dismiss</button>
              </div>
            )}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Liquidity Pools</CardTitle>
                    <CardDescription>Provide liquidity to earn rewards from trading fees</CardDescription>
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchPools()}
                      disabled={loadingPools}
                    >
                      {loadingPools ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh Pools
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingPools ? (
                      // Loading skeleton
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="relative mr-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full absolute -bottom-1 -right-1" />
                              </div>
                              <div>
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-5 w-24 mb-1" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : realPools.length === 0 ? (
                      // No pools message
                      <div className="text-center py-8 text-muted-foreground">
                        No liquidity pools found. Create one to get started!
                      </div>
                    ) : (
                      // Map real pools but preserve mock data for UI
                      realPools.map((pool, index) => {
                        // Use real pool data but combine with mock data for UI
                        const mockPool = pools[index % pools.length]; // Cycle through mock pools if there are more real pools
                        return (
                          <div
                            key={pool.id}
                            className="border rounded-lg p-4 hover:border-emerald-600 transition-colors cursor-pointer"
                            onClick={() => handlePoolSelect({
                              ...mockPool, // Keep the mock UI data
                              id: pool.id, // But use the real ID
                              token1: getTokenName(pool.tokenA), // Use real token names
                              token2: getTokenName(pool.tokenB),
                              name: `${getTokenName(pool.tokenA)} / ${getTokenName(pool.tokenB)}`, // Format real name
                              realData: true, // Flag to know this has real data
                            })}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="relative mr-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                    {getTokenName(pool.tokenA)}
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-gray-100 absolute -bottom-1 -right-1 flex items-center justify-center text-xs">
                                    {getTokenName(pool.tokenB)}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-medium">{getTokenName(pool.tokenA)} / {getTokenName(pool.tokenB)}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <span>Pool ID: </span>
                                    <span className="ml-1 truncate max-w-[150px]">{pool.id.substring(0, 10)}...</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                {/* Keep mock data for visual consistency */}
                                <div className="font-medium">${mockPool.totalLiquidity.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Total Liquidity</div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Mock UI for user liquidity */}
                            {mockPool.userLiquidity > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-500">Your Share</span>
                                  <span className="text-sm font-medium">{(mockPool.userShare * 100).toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full" 
                                    style={{ width: `${mockPool.userShare * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <div className="text-sm">
                                    <span className="text-gray-500">Your Liquidity:</span>
                                    <span className="font-medium ml-1">${mockPool.userLiquidity.toLocaleString()}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-500">Rewards:</span>
                                    <span className="font-medium ml-1 text-emerald-600">
                                      ${mockPool.rewards.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Liquidity</CardTitle>
                  <CardDescription>Manage your liquidity positions</CardDescription>
                </CardHeader>
                <CardContent>
                  {connectionStatus === 'connected' ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Total Value</h3>
                          <span className="font-bold text-xl">$21,200</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">Active Pools</div>
                            <div className="font-bold text-lg">3</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">Total Rewards</div>
                            <div className="font-bold text-lg text-emerald-600">$361.74</div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Top Positions</h3>
                        <div className="space-y-3">
                          {pools
                            .filter((pool) => pool.userLiquidity > 0)
                            .sort((a, b) => b.userLiquidity - a.userLiquidity)
                            .slice(0, 3)
                            .map((pool) => (
                              <div key={pool.id} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-6">
                                    {pool.token1}/{pool.token2}
                                  </div>
                                  <span className="text-sm">{pool.name}</span>
                                </div>
                                <span className="font-medium">${pool.userLiquidity.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Connect Your Wallet</h3>
                      <p className="text-gray-500 mb-4">
                        Connect your wallet to view and manage your liquidity positions
                      </p>
                      <ConnectButton />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedPool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPool(null)}>
          <div className="bg-white rounded-lg max-w-[500px] w-full p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Manage Liquidity</h2>
                <p className="text-sm text-gray-500">{selectedPool.name} Pool</p>
              </div>

              <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
                  <TabsTrigger value="add" className="data-[state=active]:bg-white">Add Liquidity</TabsTrigger>
                  <TabsTrigger value="withdraw" className="data-[state=active]:bg-white">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {selectedPool.token1}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gray-100 absolute -bottom-1 -right-1 flex items-center justify-center text-xs">
                          {selectedPool.token2}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedPool.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>APR: </span>
                          <span className="text-emerald-600 font-medium ml-1">{selectedPool.apr}%</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 border border-gray-200 rounded-full text-xs px-2 py-1">
                      <DollarSign className="h-3.5 w-3.5" />${selectedPool.totalLiquidity.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="add-amount1">{selectedPool.token1} Amount</label>
                      <Input
                        id="add-amount1"
                        type="number"
                        placeholder={`Enter ${selectedPool.token1} amount`}
                        value={amount1}
                        onChange={(e) => setAmount1(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-center">
                      <div className="bg-gray-100 p-1 rounded-full">
                        <ChevronsUpDown className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="add-amount2">{selectedPool.token2} Amount</label>
                      <Input
                        id="add-amount2"
                        type="number"
                        placeholder={`Enter ${selectedPool.token2} amount`}
                        value={amount2}
                        onChange={(e) => setAmount2(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Estimated Share</span>
                      <span className="font-medium">0.02%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Estimated APR</span>
                      <span className="font-medium text-emerald-600">{selectedPool.apr}%</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleAddLiquidity}
                    disabled={!amount1 || !amount2}
                  >
                    Add Liquidity
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4 pt-4">
                  {selectedPool.userLiquidity > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Your Position</h3>
                          <div className="text-sm text-gray-500">{selectedPool.name} Pool</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          {(selectedPool.userShare * 100).toFixed(2)}% Share
                        </span>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Your Liquidity</span>
                          <span className="font-medium">${selectedPool.userLiquidity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Earned Rewards</span>
                          <span className="font-medium text-emerald-600">${selectedPool.rewards.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Current APR</span>
                          <span className="font-medium text-emerald-600">{selectedPool.apr}%</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor="withdraw-amount">Withdraw Amount</label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="Enter amount to withdraw"
                          value={amount1}
                          onChange={(e) => setAmount1(e.target.value)}
                        />
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Available: ${selectedPool.userLiquidity.toLocaleString()}
                          </span>
                          <button
                            className="text-sm text-emerald-600 font-medium"
                            onClick={() => setAmount1(selectedPool.userLiquidity.toString())}
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleWithdrawLiquidity}
                        disabled={!amount1}
                      >
                        Withdraw Liquidity
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Percent className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">No Position Found</h3>
                      <p className="text-gray-500 mb-4">You don't have any liquidity in this pool yet.</p>
                      <Button variant="outline" onClick={() => setActiveTab("add")} className="mx-auto">
                        Add Liquidity <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <button 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" 
                onClick={() => setSelectedPool(null)}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


