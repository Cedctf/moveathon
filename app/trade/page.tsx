"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client'
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@iota/dapp-kit'
import { Transaction } from '@iota/iota-sdk/transactions'
import { ArrowDown, ArrowUp, Info, Loader2 } from "lucide-react"
import PriceChart from '../../components/price-chart'
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { CountUp } from "@/components/animations/count-up"
import { PriceProvider, usePriceContext } from "@/contexts/PriceContext"
import housePricesData from '@/data/housePrices.json'

// Predefined recipient address from test2/page.tsx
const RECIPIENT_ADDRESS = '0x508b47f23a659fb3cf78adb13b72b647498333f38de6670ef7bc102e40b1b38e'

// Wrapper component to provide price context
function TradePageContent() {
  const [selectedAsset, setSelectedAsset] = useState("")
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState<"long" | "short">("long")
  const [leverage, setLeverage] = useState(1)
  const { prices, loading: priceLoading } = usePriceContext()
  const [selectedLocation, setSelectedLocation] = useState<string>("Manhattan")
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("")

  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [iotaClient, setIotaClient] = useState<IotaClient | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferTxResult, setTransferTxResult] = useState<any>(null)
  // State to hold the details of the "opened" position
  const [activePosition, setActivePosition] = useState<{
    asset: string;
    assetFullName: string;
    positionType: 'long' | 'short';
    entryPrice: number;
    size: number;
    leverage: number;
    liquidationPrice: number | null;
  } | null>(null)

  useEffect(() => {
    try {
      const rpcUrl = getFullnodeUrl('testnet')
      const client = new IotaClient({ url: rpcUrl })
      setIotaClient(client)
    } catch (err) {
      console.error('Failed to initialize IOTA client:', err)
      setTransferError(err instanceof Error ? err.message : 'Failed to initialize IOTA client')
    }
  }, [])

  useEffect(() => {
    if (currentWallet && connectionStatus === 'connected' && currentAccount) {
      setWalletAddress(currentAccount.address || null)
    } else {
      setWalletAddress(null)
    }
  }, [currentWallet, connectionStatus, currentAccount])

  const handleTrade = () => {
    console.log("Original Trade Action Triggered (Short button?)", {
      asset: selectedAsset,
      amount,
      position,
      leverage
    })
  }
  
  const transferTokens = async () => {
    if (!iotaClient || !walletAddress || connectionStatus !== 'connected') {
      setTransferError('Client not initialized or wallet not connected')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setTransferError('Please provide a valid amount')
      return
    }
    
    setTransferLoading(true)
    setTransferError(null)
    setTransferTxResult(null)
    
    try {
      const tx = new Transaction()
      tx.setGasBudget(30000000)
      
      const amountNano = Math.floor(parseFloat(amount) * 10 ** 9)
      
      const coin = tx.splitCoins(tx.gas, [amountNano])
      tx.transferObjects([coin], RECIPIENT_ADDRESS)
      
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Tokens transferred successfully:', result)
            
            // Capture details for the position card
            const entryPrice = selectedAssetPrice // Price at time of confirmation
            const currentLeverage = leverage
            const positionType = position // 'long' or 'short' from state
            const size = parseFloat(amount)
            const assetFullName = getAssetFullName(selectedAsset)

            let liquidationPrice: number | null = null
            if (entryPrice && currentLeverage > 0) {
              if (positionType === 'long') {
                liquidationPrice = entryPrice * (1 - 1 / currentLeverage)
              } else { // short
                liquidationPrice = entryPrice * (1 + 1 / currentLeverage)
              }
            }

            setActivePosition({
              asset: selectedAsset,
              assetFullName: assetFullName,
              positionType: positionType,
              entryPrice: entryPrice ?? 0, // Use 0 if price is null
              size: size,
              leverage: currentLeverage,
              liquidationPrice: liquidationPrice
            })
            setTransferTxResult(result) // Still store tx result if needed elsewhere
            setTransferLoading(false)
            setAmount('')
          },
          onError: (err) => {
            console.error('Failed to transfer tokens:', err)
            setTransferError(err instanceof Error ? err.message : 'Failed to transfer tokens')
            setTransferLoading(false)
          }
        }
      )
    } catch (err) {
      console.error('Transfer setup failed:', err)
      setTransferError(err instanceof Error ? err.message : 'Transfer setup failed')
      setTransferLoading(false)
    }
  }

  const selectedAssetPrice = selectedAsset 
    ? prices.find(p => p.symbol === selectedAsset)?.price 
    : null;

  // Get top neighborhoods for the selected location with currency conversion
  const getTopNeighborhoods = () => {
    if (!housePricesData || !housePricesData.locations) return [];
    
    // Find the selected location
    const location = housePricesData.locations.find(loc => loc.name === selectedLocation);
    if (!location) return [];
    
    // Currency conversion rates to USD (approximate)
    const conversionRates: Record<string, number> = {
      'USD': 1,
      'JPY': 0.0067,
      'EUR': 1.08,
      'IDR': 0.000064
    };
    
    const rate = conversionRates[location.currency as keyof typeof conversionRates] || 1;
    
    // Get neighborhoods from the selected location only with converted prices
    return location.neighborhoodData.map(neighborhood => ({
      ...neighborhood,
      location: location.name,
      originalCurrency: location.currency,
      originalPrice: neighborhood.medianHomePrice,
      usdPrice: neighborhood.medianHomePrice * rate
    }))
    .sort((a, b) => b.medianHomePrice - a.medianHomePrice);
  };
  
  const topNeighborhoods = getTopNeighborhoods();
  
  // Format currency for display
  const formatCurrency = (value: number, currency: string) => {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    
    return currencyFormatter.format(value);
  };

  // Create a list of all neighborhood assets
  const getNeighborhoodAssets = () => {
    if (!housePricesData || !housePricesData.locations) return [];
    
    return housePricesData.locations.flatMap(location => 
      location.neighborhoodData.map(neighborhood => ({
        symbol: `${neighborhood.name}-${location.name}`,
        name: neighborhood.name,
        location: location.name,
        price: neighborhood.medianHomePrice,
        currency: location.currency
      }))
    );
  };

  const neighborhoodAssets = getNeighborhoodAssets();

  // Get the selected asset details
  const getSelectedAssetDetails = () => {
    if (!selectedAsset) return null;
    
    // Parse the asset symbol to extract neighborhood and location
    // The format should be "NeighborhoodName-LocationName"
    const parts = selectedAsset.split('-');
    if (parts.length !== 2) return null;
    
    const neighborhoodName = parts[0];
    const locationName = parts[1];
    
    return { neighborhoodName, locationName };
  };

  // Update selected location and neighborhood when asset is selected
  useEffect(() => {
    const assetDetails = getSelectedAssetDetails();
    if (assetDetails) {
      console.log("Selected asset details:", assetDetails); // Debug log
      setSelectedLocation(assetDetails.locationName);
      setSelectedNeighborhood(assetDetails.neighborhoodName);
    }
  }, [selectedAsset]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real Estate Market Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FadeIn delay={200}>
            <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>House Price Chart</CardTitle>
                    <CardDescription>Historical house price data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <PriceChart 
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedNeighborhood={selectedNeighborhood}
                  />
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
                    {priceLoading ? (
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
                  <CardTitle className="text-lg">Top Real Estate Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceLoading ? (
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
                        {topNeighborhoods.map((neighborhood, index) => (
                          <div key={index} className="flex justify-between items-center group">
                            <div className="flex items-center">
                              <span className="font-medium mr-2 group-hover:text-emerald-600 transition-colors duration-300">
                                {neighborhood.name}
                              </span>
                              <span className="text-xs border rounded px-2 py-0.5">
                                {neighborhood.location}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {formatCurrency(neighborhood.originalPrice, neighborhood.originalCurrency)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {neighborhood.originalCurrency !== 'USD' ? 
                                  `($${Math.round(neighborhood.usdPrice).toLocaleString()} USD)` : 
                                  'Premium Property'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
        
        <div>
          <FadeIn delay={400}>
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle>Trade sRWA</CardTitle>
                <CardDescription>Trade synthetic versions of real-world assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset">Select Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-[300px]">
                        {neighborhoodAssets.map((asset, index) => (
                          <SelectItem 
                            key={index} 
                            value={asset.symbol}
                            className="hover:bg-emerald-50 cursor-pointer"
                          >
                            {asset.name} ({asset.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="amount">Amount (IOTA)</Label>
                      <span className="text-sm text-gray-500">
                        {connectionStatus === 'connected' ? `Balance: Fetching...` : `Balance: Connect Wallet`}
                      </span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="transition-all duration-300 focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-2 w-full gap-2">
                      <button
                        className={`flex items-center justify-center gap-1 p-2 rounded-md transition-colors duration-300 ${
                          position === "long" ? "bg-emerald-600 text-white" : "bg-gray-100"
                        }`}
                        onClick={() => setPosition("long")}
                      >
                        <ArrowUp className="h-4 w-4" /> Long 
                      </button>
                      <button
                        className={`flex items-center justify-center gap-1 p-2 rounded-md transition-colors duration-300 ${
                          position === "short" ? "bg-red-600 text-white" : "bg-gray-100"
                        }`}
                        onClick={() => setPosition("short")}
                      >
                        <ArrowDown className="h-4 w-4" /> Short
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="leverage">Leverage</Label>
                      <span className="font-medium">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      id="leverage"
                      min={1}
                      max={100}
                      step={1}
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1x</span>
                      <span>50x</span>
                      <span>100x</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{position === 'long' ? 'Entry Price' : 'Transfer Details'}</span>
                        <span className="font-medium">
                          {position === 'long' ? `$${selectedAssetPrice ? formatPrice(selectedAssetPrice) : '—'}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{position === 'long' ? 'Fees' : 'Recipient'}</span>
                        <span className="font-medium">
                          {position === 'long' 
                            ? `$${amount ? formatPrice(parseFloat(amount) * 0.0025) : '0.00'} (0.25%)` 
                            : <span className="text-xs truncate max-w-[120px]" title={RECIPIENT_ADDRESS}>{RECIPIENT_ADDRESS}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{position === 'long' ? 'Liquidation Price' : 'Network'}</span>
                        <div className="flex items-center">
                          <span className="font-medium">
                            {position === 'long' 
                              ? (selectedAssetPrice ? `$${formatPrice(selectedAssetPrice * 0.95)}` : '—')
                              : 'IOTA Testnet'}
                          </span>
                          {position === 'long' && <Info className="h-3.5 w-3.5 ml-1 text-gray-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-6">
                {position === 'long' ? (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-md transition-all duration-300"
                    onClick={transferTokens}
                    disabled={transferLoading || !walletAddress || !amount || parseFloat(amount) <= 0}
                  >
                    {transferLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferring...</>
                    ) : (
                      `Long`
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 hover:shadow-md transition-all duration-300"
                    onClick={transferTokens}
                    disabled={transferLoading || !walletAddress || !amount || parseFloat(amount) <= 0}
                  >
                    {transferLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferring...</>
                    ) : (
                      `Short`
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </FadeIn>
          
          {/* Display Active Position Card instead of just Tx Result */}
          {activePosition && (
            <FadeIn delay={100}>
              <Card className="mt-4 transition-all duration-300 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800">Position Opened</CardTitle>
                  <CardDescription>Details of your simulated position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Asset:</span>
                      <span className="font-medium">{activePosition.assetFullName} ({activePosition.asset})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className={`font-medium ${activePosition.positionType === 'long' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {activePosition.positionType === 'long' ? 'Long' : 'Short'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entry Price:</span>
                      <span className="font-medium">${formatPrice(activePosition.entryPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size (IOTA):</span>
                      <span className="font-medium">{activePosition.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Leverage:</span>
                      <span className="font-medium">{activePosition.leverage}x</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-500">Est. Liq. Price:</span>
                      <span className="font-medium">
                        {activePosition.liquidationPrice !== null 
                          ? `$${formatPrice(activePosition.liquidationPrice)}` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
          
          {transferError && (
            <FadeIn delay={100}>
              <div className="bg-red-50 text-red-600 p-4 rounded-md mt-4 transition-all duration-300">
                {transferError}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getAssetCategory(symbol: string) {
  const categories: Record<string, string> = {
    "MANH-APT": "Real Estate",
    "TKY-COM": "Real Estate",
    "VRD-LUX": "Luxury",
    "BDX-VIN": "Agricultural",
    "BER-ART": "Art"
  };
  
  return categories[symbol] || "Other";
}

function getAssetFullName(symbol: string) {
  const names: Record<string, string> = {
    "ETH/USD": "Ethereum",
    "BTC/USD": "Bitcoin",
    "MANH-APT": "Manhattan Apartment",
    "TKY-COM": "Tokyo Commercial Building",
    "VRD-LUX": "Vintage Rolex Daytona",
    "BDX-VIN": "Bordeaux Vineyard",
    "BER-ART": "Berlin Art Collection"
  };
  
  return names[symbol] || symbol;
}

function formatPrice(price: number | null) {
  if (!price && price !== 0) return "—";

  if (isNaN(price)) return "—"; 
  
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + "M";
  } else if (price >= 1000) {
    return (price / 1000).toFixed(2) + "K";
  } else {
    return price.toFixed(2); 
  }
}

function getRandomChange(): string {
  return (Math.random() * 10 - 5).toFixed(2);
}

// Main component with PriceProvider
export default function TradePage() {
  return (
    <PriceProvider>
      <TradePageContent />
    </PriceProvider>
  );
}