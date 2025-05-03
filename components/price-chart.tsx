"use client"

import React, { useState, useEffect } from 'react'
import { usePriceContext } from '@/contexts/PriceContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import housePricesData from '@/data/housePrices.json'

type LocationData = {
  name: string;
  country: string;
  currency: string;
  priceData: Array<{
    date: string;
    averagePricePerSqFt?: number;
    averagePricePerSqM?: number;
    medianHomePrice: number;
    yearOverYearChange: number;
  }>;
  neighborhoodData: Array<{
    name: string;
    medianHomePrice: number;
  }>;
};

type PriceChartProps = {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
};

export default function PriceChart({ selectedLocation, setSelectedLocation }: PriceChartProps) {
  const { prices, loading, error } = usePriceContext()
  const [timeframe, setTimeframe] = useState<string>("1D")
  const [chartData, setChartData] = useState<any[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])

  useEffect(() => {
    // Load the house price data
    if (housePricesData && housePricesData.locations) {
      setLocations(housePricesData.locations)
      
      // Set initial chart data
      const initialLocation = housePricesData.locations.find(loc => loc.name === selectedLocation) || housePricesData.locations[0]
      setChartData(initialLocation.priceData)
    }
  }, [])

  useEffect(() => {
    // Update chart data when selected location changes
    const locationData = locations.find(loc => loc.name === selectedLocation)
    if (locationData) {
      setChartData(locationData.priceData)
    }
  }, [selectedLocation, locations])

  const formatCurrency = (value: number, currency: string) => {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    })
    
    return currencyFormatter.format(value)
  }

  const getCurrencySymbol = (locationName: string) => {
    const location = locations.find(loc => loc.name === locationName)
    return location ? location.currency : 'USD'
  }

  const getPriceMetric = (locationName: string) => {
    const location = locations.find(loc => loc.name === locationName)
    if (!location) return 'Price per sq ft'
    
    if (location.priceData[0].averagePricePerSqFt) {
      return 'Price per sq ft'
    } else if (location.priceData[0].averagePricePerSqM) {
      return 'Price per sq m'
    }
    return 'Median price'
  }

  const getYAxisDataKey = (locationName: string) => {
    const location = locations.find(loc => loc.name === locationName)
    if (!location) return 'medianHomePrice'
    
    if (location.priceData[0].averagePricePerSqFt) {
      return 'averagePricePerSqFt'
    } else if (location.priceData[0].averagePricePerSqM) {
      return 'averagePricePerSqM'
    }
    return 'medianHomePrice'
  }

  return (
    <div className="bg-white">
      <div className="flex space-x-2 mb-4 justify-end">
        <select 
          className="border rounded-md p-2"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map((location) => (
            <option key={location.name} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
        <select 
          className="border rounded-md p-2"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1D">1 Year</option>
          <option value="1W">All Data</option>
        </select>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => {
                return formatCurrency(value, getCurrencySymbol(selectedLocation))
              }}
            />
            <Tooltip 
              formatter={(value: number) => [
                formatCurrency(value, getCurrencySymbol(selectedLocation)),
                getPriceMetric(selectedLocation)
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={getYAxisDataKey(selectedLocation)} 
              stroke="#10b981" 
              activeDot={{ r: 8 }} 
              name={getPriceMetric(selectedLocation)}
            />
            <Line 
              type="monotone" 
              dataKey="medianHomePrice" 
              stroke="#3b82f6" 
              name="Median Home Price" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Neighborhood data section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Neighborhood Prices in {selectedLocation}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locations.find(loc => loc.name === selectedLocation)?.neighborhoodData.map((neighborhood) => (
            <div key={neighborhood.name} className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{neighborhood.name}</p>
              <p className="text-gray-700">
                {formatCurrency(neighborhood.medianHomePrice, getCurrencySymbol(selectedLocation))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
