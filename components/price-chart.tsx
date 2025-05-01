"use client"

import { useEffect, useState } from 'react'
import { usePriceContext } from '@/contexts/PriceContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PriceChart({ symbol = "ETH/USD" }) {
  const { prices, loading, error } = usePriceContext()
  const [selectedAsset, setSelectedAsset] = useState(symbol)
  const [chartData, setChartData] = useState<any[]>([])

  // Update selected asset when symbol prop changes
  useEffect(() => {
    setSelectedAsset(symbol)
  }, [symbol])

  // Find the price data for the selected asset
  const assetPrice = prices.find(p => p.symbol === selectedAsset)

  // Generate chart data when asset price changes or when prices array changes
  useEffect(() => {
    console.log("Generating chart data for", selectedAsset);
    console.log("Available prices:", prices);
    
    if (prices.length === 0) return;
    
    // Find the asset price
    const foundAssetPrice = prices.find(p => p.symbol === selectedAsset);
    
    if (!foundAssetPrice) {
      console.warn(`No price found for ${selectedAsset}`);
      return;
    }
    
    console.log("Found price:", foundAssetPrice);
    
    // Base price from the API - handle different price formats
    let basePrice = 2500; // Default fallback
    if (foundAssetPrice) {
      if (typeof foundAssetPrice.price === 'number') {
        basePrice = foundAssetPrice.price;
      } else if (typeof foundAssetPrice.price === 'string') {
        // Convert string price to number and handle potential scaling
        // Pyth prices are often in a fixed-point format with many decimal places
        const priceNum = parseFloat(foundAssetPrice.price);
        if (!isNaN(priceNum)) {
          // If price is very large (like 186585000000), it might need scaling
          if (priceNum > 1000000) {
            basePrice = priceNum / 100000000; // Scale down to a reasonable value
          } else {
            basePrice = priceNum;
          }
        }
      }
    }
    
    console.log("Using base price:", basePrice);
    
    // Generate sample data for demonstration
    const currentDate = new Date();
    const data = [];
    
    // Generate 30 days of historical data
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      
      // Generate random price data based on the current price
      // More recent days have less deviation from the current price
      const volatility = basePrice * 0.02 * (i / 30); // Higher volatility for older dates
      const randomFactor = (Math.random() - 0.5) * 2; // Between -1 and 1
      const price = basePrice + (randomFactor * volatility);
      
      data.push({
        date: date.toLocaleDateString(),
        price: price,
      });
    }
    
    console.log("Generated chart data:", data);
    setChartData(data);
  }, [prices, selectedAsset]);

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full flex-col">
          <p className="text-red-500 mb-2">Error loading price data</p>
          <p className="text-sm text-gray-500">Unable to connect to Pyth Network. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No price data available for {selectedAsset}</p>
        </div>
      ) : (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
