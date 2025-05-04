"use client"

import { useEffect, useState } from 'react';
import { usePriceFeeds } from '@/components/updatePriceFeeds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ContractPrices() {
  const { fetchStoredPrices, contractPrices } = usePriceFeeds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshContractPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if wallet is available
      const wallet = (window as any).wallet;
      if (!wallet) {
        setError("Wallet not connected. Please connect your wallet to view contract prices.");
        return;
      }
      
      await fetchStoredPrices(wallet);
    } catch (err) {
      console.error("Failed to fetch contract prices:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to fetch prices on component mount, but don't show error on initial load
    const wallet = (window as any).wallet;
    if (wallet) {
      refreshContractPrices();
    }
    
    // Set up a refresh interval (every 60 seconds) only if wallet is connected
    let intervalId: NodeJS.Timeout | null = null;
    if (wallet) {
      intervalId = setInterval(refreshContractPrices, 60000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [(window as any).wallet]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Smart Contract Prices</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshContractPrices}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
            {error}
          </div>
        ) : contractPrices.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {loading ? 'Loading prices...' : 'No prices stored in contract yet'}
          </div>
        ) : (
          <div className="space-y-4">
            {contractPrices.map((price, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-lg">{price.symbol}</span>
                  <span className="text-emerald-600 font-bold text-xl">
                    ${price.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Last Updated:</span>
                  <span>{price.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 