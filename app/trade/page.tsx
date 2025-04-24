"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/animations/fade-in"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PriceChart from "@/components/price-chart"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { CountUp } from "@/components/animations/count-up"

export default function TradePage() {
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
            <h1 className="text-3xl font-bold mb-2">Synthetic Trading</h1>
            <p className="text-gray-500">Trade synthetic versions of real-world assets (sRWAs)</p>
          </div>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FadeIn delay={200}>
            <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Price Chart</CardTitle>
                    <CardDescription>Real-time price data from oracle</CardDescription>
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
                  <PriceChart />
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
                        <div className="flex justify-between items-center group">
                          <div className="flex items-center">
                            <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                              MANH-APT
                            </span>
                            <span className="text-xs border rounded px-2 py-0.5">
                              Real Estate
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">$2,500,000</span>
                            <span className="text-xs text-emerald-600">+2.4%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center group">
                          <div className="flex items-center">
                            <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                              TKY-COM
                            </span>
                            <span className="text-xs border rounded px-2 py-0.5">
                              Real Estate
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">$8,750,000</span>
                            <span className="text-xs text-red-600">-0.8%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center group">
                          <div className="flex items-center">
                            <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                              VRD-LUX
                            </span>
                            <span className="text-xs border rounded px-2 py-0.5">
                              Luxury
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">$125,000</span>
                            <span className="text-xs text-emerald-600">+5.2%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center group">
                          <div className="flex items-center">
                            <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                              BDX-VIN
                            </span>
                            <span className="text-xs border rounded px-2 py-0.5">
                              Agricultural
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">$4,200,000</span>
                            <span className="text-xs text-emerald-600">+1.7%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
        
        <div>
          {/* Trade form will go here */}
        </div>
      </div>
    </div>
  )
}