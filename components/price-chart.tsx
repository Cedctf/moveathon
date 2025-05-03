"use client"

import React, { useState, useEffect } from 'react'
import { usePriceContext } from '@/contexts/PriceContext'
import dynamic from 'next/dynamic'
import housePricesData from '@/data/housePrices.json'

// Dynamically import ApexCharts with no SSR to avoid build errors
const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  )
})

type LocationData = {
  name: string;
  country: string;
  currency: string;
  priceData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    yearOverYearChange: number;
  }>;
  neighborhoodData: Array<{
    name: string;
    medianHomePrice: number;
    priceHistory: Array<{
      date: string;
      open?: number;
      high?: number;
      low?: number;
      close?: number;
      volume?: number;
      medianHomePrice?: number;
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
  const [chartOptions, setChartOptions] = useState<any>(null)
  const [locations, setLocations] = useState<LocationData[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    
    // Load the house price data
    if (housePricesData && housePricesData.locations) {
      setLocations(housePricesData.locations as LocationData[])
    }
    
    // Initialize chart data and options
    updateChartData()
  }, []) // Empty dependency array to run only once on mount

  // Update chart data when location or neighborhood changes
  useEffect(() => {
    if (isClient) {
      updateChartData()
    }
  }, [selectedLocation, selectedNeighborhood, isClient])

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'JPY': return '¥'
      case 'IDR': return 'Rp'
      default: return '$'
    }
  }

  // Separate function to update chart data
  const updateChartData = () => {
    try {
      // Find the selected location data
      const locationData = housePricesData.locations.find(
        location => location.name === selectedLocation
      )
      
      if (!locationData) return
      
      // Get neighborhood data if a neighborhood is selected
      let neighborhoodCandleData: any[] = []
      let neighborhoodName = ''
      
      if (selectedNeighborhood) {
        const neighborhood = locationData.neighborhoodData.find(
          n => n.name === selectedNeighborhood
        )
        
        if (neighborhood) {
          neighborhoodName = neighborhood.name
          
          // Process neighborhood price history
          neighborhoodCandleData = neighborhood.priceHistory.map(item => {
            // Handle both old and new data formats
            if ('open' in item && 'high' in item && 'low' in item && 'close' in item) {
              return {
                x: new Date(item.date).getTime(),
                y: [item.open, item.high, item.low, item.close]
              }
            } else if ('medianHomePrice' in item) {
              // For old format data, create simulated OHLC data
              const price = item.medianHomePrice as number
              const volatility = price * 0.02
              return {
                x: new Date(item.date).getTime(),
                y: [
                  price - volatility,
                  price + volatility/2,
                  price - volatility,
                  price
                ]
              }
            }
            return null
          }).filter(Boolean)
        }
      }
      
      // Prepare data for the candlestick chart
      const candleData = selectedNeighborhood && neighborhoodCandleData.length > 0
        ? neighborhoodCandleData
        : locationData.priceData.map(item => ({
            x: new Date(item.date).getTime(),
            y: [item.open, item.high, item.low, item.close]
          }))
      
      // Create trend line data (moving average)
      const lineData = candleData.map(candle => ({
        x: candle.x,
        y: candle.y[3] * 1.005 // Add 0.5% to move the line up slightly
      }))
      
      // Set chart data with both candlestick and line series
      setChartData([
        {
          name: selectedNeighborhood 
            ? `${neighborhoodName} Prices` 
            : `${selectedLocation} Prices`,
          type: 'candlestick',
          data: candleData
        },
        {
          name: 'Trend Line',
          type: 'line',
          data: lineData,
          color: '#F7CA18', // Yellow color similar to the image
          width: 2
        }
      ])
      
      // Set chart options
      const currencySymbol = getCurrencySymbol(locationData.currency)
      
      setChartOptions({
        chart: {
          type: 'candlestick',
          height: 400,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
          }
        },
        stroke: {
          width: [1, 2], // Width for candlestick and line
          curve: 'smooth' // Make the line smooth
        },
        title: {
          text: selectedNeighborhood 
            ? `${neighborhoodName} Price Chart` 
            : `${selectedLocation} Price Chart`,
          align: 'left'
        },
        tooltip: {
          enabled: true,
          theme: 'light',
          shared: true,
          custom: function({ seriesIndex, dataPointIndex, w }: any) {
            if (seriesIndex === 0) { // Only for candlestick series
              const o = w.globals.seriesCandleO[0][dataPointIndex];
              const h = w.globals.seriesCandleH[0][dataPointIndex];
              const l = w.globals.seriesCandleL[0][dataPointIndex];
              const c = w.globals.seriesCandleC[0][dataPointIndex];
              const date = new Date(w.globals.seriesX[0][dataPointIndex]).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              });
              
              return (
                '<div class="apexcharts-tooltip-candlestick">' +
                '<div>' + date + '</div>' +
                '<div>Open: <span class="value">' + currencySymbol + o.toLocaleString() + '</span></div>' +
                '<div>High: <span class="value">' + currencySymbol + h.toLocaleString() + '</span></div>' +
                '<div>Low: <span class="value">' + currencySymbol + l.toLocaleString() + '</span></div>' +
                '<div>Close: <span class="value">' + currencySymbol + c.toLocaleString() + '</span></div>' +
                '</div>'
              );
            }
            return '';
          }
        },
        grid: {
          borderColor: '#f1f1f1',
          row: {
            colors: ['transparent', 'transparent'],
            opacity: 0.2
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            formatter: function(value: any) {
              return new Date(value).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })
            }
          },
          axisBorder: {
            show: true,
            color: '#e0e0e0'
          },
          crosshairs: {
            show: true,
            width: 1,
            position: 'back',
            opacity: 0.9,
            stroke: {
              color: '#b6b6b6',
              width: 1,
              dashArray: 0,
            }
          }
        },
        yaxis: {
          tooltip: {
            enabled: true
          },
          labels: {
            formatter: function(value: number) {
              if (locationData.currency === 'USD') {
                return `$${(value / 1000).toFixed(0)}k`
              } else if (locationData.currency === 'JPY') {
                return `¥${(value / 1000000).toFixed(1)}M`
              } else if (locationData.currency === 'EUR') {
                return `€${(value / 1000).toFixed(0)}k`
              } else if (locationData.currency === 'IDR') {
                return `Rp${(value / 1000000000).toFixed(1)}B`
              }
              return `${value}`
            }
          },
          crosshairs: {
            show: true,
            position: 'back',
            stroke: {
              color: '#b6b6b6',
              width: 1,
              dashArray: 0,
            }
          }
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: '#10b981', // Green for price increases
              downward: '#ef4444'  // Red for price decreases
            },
            wick: {
              useFillColor: true,
            },
            rangeColors: ['#f1f1f1'],
            wickLength: '50%' // Make wicks shorter (default is 80%)
          }
        },
        annotations: {
          xaxis: [
            {
              x: new Date().getTime(),
              borderColor: '#999',
              yAxisIndex: 0,
              label: {
                show: true,
                text: 'Current',
                style: {
                  color: '#fff',
                  background: '#775DD0'
                }
              }
            }
          ]
        }
      })
    } catch (error) {
      console.error("Error updating chart data:", error)
    }
  }

  // Show loading state if not on client or data is loading
  if (!isClient || !chartData || !chartOptions) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {isClient && (
        <ReactApexChart 
          options={chartOptions}
          series={chartData}
          type="candlestick"
          height={400}
        />
      )}
    </div>
  )
}
