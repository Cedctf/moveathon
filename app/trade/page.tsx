"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PriceChart from "@/components/price-chart"
import { FadeIn } from "@/components/animations/fade-in"


export default function TradePage() {
  return (
<div className="container py-8 px-4">
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
          </div>
          </div>
          </div>
          
  )
}
