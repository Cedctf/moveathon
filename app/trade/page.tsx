"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PriceChart from "@/components/price-chart"

export default function TradePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <PriceChart />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Trade</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Trade form will be added here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
