"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePriceFeeds } from '@/components/updatePriceFeeds';

type PriceData = {
  id: string;
  symbol: string;
  price: number | null;
  confidence: number | null;
  timestamp: string | null;
  updateData?: any;
};

type PriceContextType = {
  prices: PriceData[];
  loading: boolean;
  error: Error | null;
  refreshPrices: () => Promise<void>;
};

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchPriceFeeds } = usePriceFeeds();

  const refreshPrices = async () => {
    try {
      setLoading(true);
      const priceData = await fetchPriceFeeds();
      console.log("Fetched price data:", priceData);

      // Process the price data to ensure correct format
      const processedData = priceData.map(item => {
        // Handle price format
        let processedPrice = item.price;
        if (typeof processedPrice === 'string') {
          const priceNum = parseFloat(processedPrice);
          if (!isNaN(priceNum)) {
            // Scale down large prices
            if (priceNum > 1000000) {
              processedPrice = priceNum / 100000000;
            } else {
              processedPrice = priceNum;
            }
          }
        }
        
        return {
          ...item,
          price: processedPrice
        };
      });

      console.log("Processed price data:", processedData);
      setPrices(processedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const priceData = await fetchPriceFeeds();
        console.log("Fetched price data:", priceData);

        // Process the price data to ensure correct format
        const processedData = priceData.map(item => {
          // Handle price format
          let processedPrice = item.price;
          if (typeof processedPrice === 'string') {
            const priceNum = parseFloat(processedPrice);
            if (!isNaN(priceNum)) {
              // Scale down large prices
              if (priceNum > 1000000) {
                processedPrice = priceNum / 100000000;
              } else {
                processedPrice = priceNum;
              }
            }
          }
          
          return {
            ...item,
            price: processedPrice
          };
        });

        console.log("Processed price data:", processedData);
        setPrices(processedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch prices:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, error, refreshPrices }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePriceContext() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePriceContext must be used within a PriceProvider');
  }
  return context;
} 