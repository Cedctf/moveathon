import { IotaPriceServiceConnection } from "@pythnetwork/pyth-iota-js";
import axios from 'axios';
import { useEffect, useState } from 'react';

// Create a React component to fetch price feeds
export function usePriceFeeds() {
  const [contractPrices, setContractPrices] = useState<any[]>([]);

  const fetchPriceFeeds = async () => {
    // Price feed IDs for various assets
    const priceIDs = [
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
    ];

    // Helper function to map price feed IDs to human-readable symbols
    const mapIdToSymbol = (id: string): string => {
      // Remove the "0x" prefix if present for comparison
      const cleanId = id.startsWith("0x") ? id.substring(2) : id;
      
      const symbolMap: Record<string, string> = {
        "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace": "ETH/USD",
        "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43": "BTC/USD",
      };
      
      return symbolMap[cleanId] || "Unknown";
    };

    try {
      // Connect to Pyth Network using the SDK (this approach works)
      console.log("Connecting to Pyth Network via SDK");
      const connection = new IotaPriceServiceConnection("https://hermes.pyth.network");
      const priceFeeds = await connection.getLatestPriceFeeds(priceIDs);
      
      if (priceFeeds && priceFeeds.length > 0) {
        console.log("Successfully fetched price feeds from Pyth Network");
        
        // Format the price data for display
        const formattedPrices = priceFeeds.map((feed: any) => {
          const price = feed.getPriceUnchecked();
          const id = feed.id;
          const symbol = mapIdToSymbol(id);
          
          console.log(`Mapping ID ${id} to symbol ${symbol}`);
          
          return {
            id: id,
            symbol: symbol,
            price: price.price,
            confidence: price.confidence,
            timestamp: new Date(price.publishTime * 1000).toLocaleString(),
            updateData: feed.getVAA(), // Include update data for transactions
          };
        });
        
        return formattedPrices;
      } else {
        throw new Error("No price feeds returned from Pyth Network");
      }
    } catch (error) {
      console.warn("Failed to fetch price feeds from Pyth Network:", error);
      
      // Fallback to simulated data if needed
      console.log("Using simulated data as fallback");
      return [
        {
          id: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
          symbol: "ETH/USD",
          price: 3450 + (Math.random() * 100 - 50),
          confidence: 0.95,
          timestamp: new Date().toLocaleString(),
          source: "Simulated Data"
        },
        {
          id: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
          symbol: "BTC/USD",
          price: 65000 + (Math.random() * 1000 - 500),
          confidence: 0.98,
          timestamp: new Date().toLocaleString(),
          source: "Simulated Data"
        }
      ];
    }
  };

  // Function to update price feeds in a transaction
  const updatePriceFeedsInTransaction = async (wallet: any, updateData: any, priceIDs: string[]) => {
    // Create a transaction
    const tx = new (window as any).TransactionBlock();
    
    // Update the price feeds
    const priceInfoObjectIds = await wallet.updatePriceFeeds(tx, updateData, priceIDs);
    
    return { tx, priceInfoObjectIds };
  };

  // Function to read stored prices from the contract
  const fetchStoredPrices = async (wallet: any) => {
    try {
      if (!wallet) {
        console.warn("Wallet not connected, can't fetch stored prices");
        return [];
      }

      // Call the contract to get the latest stored prices
      const result = await wallet.client.getObject({
        id: "@pyth_price_example", // Your contract address
        options: {
          showContent: true,
        },
      });

      if (result && result.data && result.data.content) {
        const priceStorage = result.data.content.fields.prices;
        
        // Format the stored prices for display
        const storedPrices = priceStorage.map((price: any) => {
          const symbol = new TextDecoder().decode(new Uint8Array(price.fields.symbol));
          return {
            symbol,
            price: Number(price.fields.price_value) / Math.pow(10, Number(price.fields.decimals)),
            decimals: Number(price.fields.decimals),
            timestamp: new Date(Number(price.fields.timestamp) * 1000).toLocaleString(),
            source: "Smart Contract"
          };
        });
        
        setContractPrices(storedPrices);
        return storedPrices;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch stored prices from contract:", error);
      return [];
    }
  };

  return { 
    fetchPriceFeeds, 
    updatePriceFeedsInTransaction, 
    fetchStoredPrices,
    contractPrices
  };
}
