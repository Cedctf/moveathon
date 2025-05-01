"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, Info } from "lucide-react"
import PriceChart from "@/components/price-chart"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { CountUp } from "@/components/animations/count-up"
import { PriceProvider, usePriceContext } from "@/contexts/PriceContext"

// Wrapper component to provide price context
function TradePageContent() {
  const [selectedAsset, setSelectedAsset] = useState("")
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState("long")
  const [leverage, setLeverage] = useState(1)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const { prices, loading } = usePriceContext()

  const handleTrade = () => {
    // Trade logic will be implemented here
    console.log({
      asset: selectedAsset,
      amount,
      position,
      leverage
    })
  }

  // Get the price for the selected asset
  const selectedAssetPrice = selectedAsset 
    ? prices.find(p => p.symbol === selectedAsset)?.price 
    : null;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Trade</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FadeIn delay={200}>
            <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Price Chart</CardTitle>
                    <CardDescription>Real-time price data from Pyth oracle</CardDescription>
                  </div>
                  <Select defaultValue="1d">
                    <SelectTrigger className="w-[80px] bg-white">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1h" className="hover:bg-emerald-50 cursor-pointer">1H</SelectItem>
                      <SelectItem value="4h" className="hover:bg-emerald-50 cursor-pointer">4H</SelectItem>
                      <SelectItem value="1d" className="hover:bg-emerald-50 cursor-pointer">1D</SelectItem>
                      <SelectItem value="1w" className="hover:bg-emerald-50 cursor-pointer">1W</SelectItem>
                      <SelectItem value="1m" className="hover:bg-emerald-50 cursor-pointer">1M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <PriceChart symbol={selectedAsset || "ETH/USD"} />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StaggerItem>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">24h Volume</span>
                          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Open Interest</span>
                          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Long/Short Ratio</span>
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Funding Rate</span>
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">24h Volume</span>
                          <span className="font-medium">
                            $<CountUp end={1245678} />
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Open Interest</span>
                          <span className="font-medium">
                            $<CountUp end={8765432} />
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Long/Short Ratio</span>
                          <span className="font-medium">
                            <CountUp end={1.45} decimals={2} />
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Funding Rate</span>
                          <span className="font-medium text-emerald-600 flex items-center">
                            +0.01% <div className="ml-1 h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></div>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top sRWA Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mr-2"></div>
                            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {prices
                          .filter(p => p.symbol !== "ETH/USD" && p.symbol !== "BTC/USD")
                          .slice(0, 4)
                          .map((asset, index) => (
                            <div key={index} className="flex justify-between items-center group">
                              <div className="flex items-center">
                                <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                                  {asset.symbol}
                                </span>
                                <span className="text-xs border rounded px-2 py-0.5">
                                  {getAssetCategory(asset.symbol)}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium">${formatPrice(asset.price)}</span>
                                <span className={`text-xs ${parseFloat(getRandomChange()) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {parseFloat(getRandomChange()) >= 0 ? '+' : ''}{getRandomChange()}%
                                </span>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
        
        <div>
          <FadeIn delay={400}>
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle>Trade sRWA</CardTitle>
                <CardDescription>Trade synthetic versions of real-world assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset">Select Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {prices.map((asset, index) => (
                          <SelectItem 
                            key={index} 
                            value={asset.symbol} 
                            className="hover:bg-emerald-50 cursor-pointer"
                          >
                            {asset.symbol} ({getAssetFullName(asset.symbol)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <span className="text-sm text-gray-500">Balance: $10,000</span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="transition-all duration-300 focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-2 w-full gap-2">
                      <button
                        className={`flex items-center justify-center gap-1 p-2 rounded-md transition-colors duration-300 ${
                          position === "long" ? "bg-emerald-600 text-white" : "bg-gray-100"
                        }`}
                        onClick={() => setPosition("long")}
                      >
                        <ArrowUp className="h-4 w-4" /> Long
                      </button>
                      <button
                        className={`flex items-center justify-center gap-1 p-2 rounded-md transition-colors duration-300 ${
                          position === "short" ? "bg-red-600 text-white" : "bg-gray-100"
                        }`}
                        onClick={() => setPosition("short")}
                      >
                        <ArrowDown className="h-4 w-4" /> Short
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="leverage">Leverage</Label>
                      <span className="font-medium">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      id="leverage"
                      min={1}
                      max={10}
                      step={1}
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1x</span>
                      <span>5x</span>
                      <span>10x</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Entry Price</span>
                        <span className="font-medium">
                          ${selectedAssetPrice ? formatPrice(selectedAssetPrice) : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fees</span>
                        <span className="font-medium">
                          ${amount ? formatPrice(parseFloat(amount) * 0.0025) : '0.00'} (0.25%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Liquidation Price</span>
                        <div className="flex items-center">
                          <span className="font-medium">
                            {selectedAssetPrice && position === "long" 
                              ? '$' + formatPrice(selectedAssetPrice * 0.95) 
                              : selectedAssetPrice && position === "short"
                              ? '$' + formatPrice(selectedAssetPrice * 1.05)
                              : '—'}
                          </span>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className={`w-full transition-all duration-300 ${
                    position === "long" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  } hover:shadow-md`}
                  onClick={handleTrade}
                  disabled={!isWalletConnected || !selectedAsset || !amount}
                >
                  {position === "long" ? "Long" : "Short"} {selectedAsset || "Asset"}
                </Button>

                {!isWalletConnected && (
                  <p className="text-sm text-gray-500 text-center">Please connect your wallet to start trading</p>
                )}
              </CardFooter>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getAssetCategory(symbol: string) {
  const categories: Record<string, string> = {
    "MANH-APT": "Real Estate",
    "TKY-COM": "Real Estate",
    "VRD-LUX": "Luxury",
    "BDX-VIN": "Agricultural",
    "BER-ART": "Art"
  };
  
  return categories[symbol] || "Other";
}

function getAssetFullName(symbol: string) {
  const names: Record<string, string> = {
    "ETH/USD": "Ethereum",
    "BTC/USD": "Bitcoin",
    "MANH-APT": "Manhattan Apartment",
    "TKY-COM": "Tokyo Commercial Building",
    "VRD-LUX": "Vintage Rolex Daytona",
    "BDX-VIN": "Bordeaux Vineyard",
    "BER-ART": "Berlin Art Collection"
  };
  
  return names[symbol] || symbol;
}

function formatPrice(price: number | null) {
  if (!price) return "0.00";
  
  // Format based on price magnitude
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + "M";
  } else if (price >= 1000) {
    return (price / 1000).toFixed(2) + "K";
  } else {
    return price.toFixed(2);
  }
}

function getRandomChange(): string {
  return (Math.random() * 10 - 5).toFixed(2);
}

// Main component with PriceProvider
export default function TradePage() {
  return (
    <PriceProvider>
      <TradePageContent />
    </PriceProvider>
  );
}