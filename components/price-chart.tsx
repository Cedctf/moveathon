"use client"

import React, { useState, useEffect } from 'react'
import { usePriceContext } from '@/contexts/PriceContext'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import housePricesData from '@/data/housePrices.json'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, ChartLegend)

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
    priceHistory: Array<{
      date: string;
      medianHomePrice: number;
    }>;
  }>;
};

type PriceChartProps = {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedNeighborhood?: string;
};

export default function PriceChart({ selectedLocation, setSelectedLocation, selectedNeighborhood }: PriceChartProps) {
  const { prices, loading, error } = usePriceContext()
  const [chartData, setChartData] = useState<any>(null)
  const [locations, setLocations] = useState<LocationData[]>([])

  useEffect(() => {
    // Load the house price data
    if (housePricesData && housePricesData.locations) {
      setLocations(housePricesData.locations as LocationData[])
    }
  }, [])

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

  useEffect(() => {
    // Find the selected location data
    const locationData = housePricesData.locations.find(
      location => location.name === selectedLocation
    )
    
    if (!locationData) return
    
    // Format dates for x-axis
    const labels = locationData.priceData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
    
    // Get median home prices for the location
    const locationPrices = locationData.priceData.map(item => item.medianHomePrice)
    
    // Get neighborhood data if a neighborhood is selected
    let neighborhoodPrices: number[] = []
    let neighborhoodName = ''
    
    if (selectedNeighborhood) {
      const neighborhood = locationData.neighborhoodData.find(
        n => n.name === selectedNeighborhood
      )
      
      if (neighborhood && neighborhood.priceHistory) {
        neighborhoodName = neighborhood.name
        
        // Create a map of dates to prices for the neighborhood
        const neighborhoodPriceMap = new Map(
          neighborhood.priceHistory.map(item => [item.date, item.medianHomePrice])
        )
        
        // Map the neighborhood prices to the same dates as the location data
        neighborhoodPrices = locationData.priceData.map(item => {
          // Find exact date match or use the closest previous date
          const exactMatch = neighborhoodPriceMap.get(item.date)
          if (exactMatch) return exactMatch
          
          // If no exact match, find the closest previous date
          const dates = neighborhood.priceHistory.map(h => h.date)
          const closestDate = dates
            .filter(date => date <= item.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          
          return closestDate ? neighborhoodPriceMap.get(closestDate) || 0 : 0
        })
      }
    }
    
    // Create chart data
    setChartData({
      labels,
      datasets: [
        {
          label: `${selectedLocation} Median Home Price`,
          data: locationPrices,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
        ...(selectedNeighborhood && neighborhoodPrices.length > 0 ? [
          {
            label: `${neighborhoodName} Home Price`,
            data: neighborhoodPrices,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
          }
        ] : [])
      ]
    })
  }, [selectedLocation, selectedNeighborhood])
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const locationData = housePricesData.locations.find(
              location => location.name === selectedLocation
            )
            if (!locationData) return context.raw
            
            // Format based on currency
            if (locationData.currency === 'USD') {
              return `${context.dataset.label}: $${context.raw.toLocaleString()}`
            } else if (locationData.currency === 'JPY') {
              return `${context.dataset.label}: ¥${context.raw.toLocaleString()}`
            } else if (locationData.currency === 'EUR') {
              return `${context.dataset.label}: €${context.raw.toLocaleString()}`
            } else if (locationData.currency === 'IDR') {
              return `${context.dataset.label}: Rp${context.raw.toLocaleString()}`
            }
            return `${context.dataset.label}: ${context.raw}`
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            const locationData = housePricesData.locations.find(
              location => location.name === selectedLocation
            )
            if (!locationData) return value
            
            if (locationData.currency === 'USD') {
              return `$${(value / 1000).toFixed(0)}k`
            } else if (locationData.currency === 'JPY') {
              return `¥${(value / 1000000).toFixed(1)}M`
            } else if (locationData.currency === 'EUR') {
              return `€${(value / 1000).toFixed(0)}k`
            } else if (locationData.currency === 'IDR') {
              return `Rp${(value / 1000000000).toFixed(1)}B`
            }
            return value
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-full">
      {chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )}
    </div>
  )
}
