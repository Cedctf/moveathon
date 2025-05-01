'use client'

import { useState, useEffect } from 'react'
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client'
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@iota/dapp-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw } from 'lucide-react'
import { Transaction } from '@iota/iota-sdk/transactions'

// Constants
const LIQUIDITY_POOL_PACKAGE_ID = '0x6a4fea4813774d803ac7e6478335d06a38591a695147f2d66d651f59bb354a7f'
const POOL_REGISTRY_ID = '0x7b958e3e2c475b85722e861e002a119ecab324533ede3a294eab21f036ea9abf'

// Pool type definition
interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA?: string;
  reserveB?: string;
  lpTotal?: string;
}

export default function TestPage() {
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  
  const [client, setClient] = useState<IotaClient | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPools, setLoadingPools] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txResult, setTxResult] = useState<any>(null)
  
  // Registry state
  const [registryId, setRegistryId] = useState<string>(POOL_REGISTRY_ID)
  
  // Pool states
  const [tokenAType, setTokenAType] = useState('')
  const [tokenBType, setTokenBType] = useState('')
  const [pools, setPools] = useState<Pool[]>([])

  // Initialize IOTA client
  useEffect(() => {
    try {
      // Use getFullnodeUrl to define Testnet RPC location
      const rpcUrl = getFullnodeUrl('testnet')
      
      // Create a client connected to testnet
      const iotaClient = new IotaClient({ url: rpcUrl })
      setClient(iotaClient)
      
      // We already have the registry ID, so directly fetch pools
      fetchAllPools(iotaClient, POOL_REGISTRY_ID)
    } catch (err) {
      console.error('Failed to initialize IOTA client:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize IOTA client')
    }
  }, [])

  // Update address when wallet connection changes
  useEffect(() => {
    if (currentWallet && connectionStatus === 'connected' && currentAccount) {
      setAddress(currentAccount.address || null)
    } else {
      setAddress(null)
    }
  }, [currentWallet, connectionStatus, currentAccount])
  
  // Fetch all pools from registry
  const fetchAllPools = async (clientInstance: IotaClient | null = null, regId: string | null = null) => {
    const activeClient = clientInstance || client
    const activeRegistryId = regId || registryId
    
    if (!activeClient || !activeRegistryId) {
      console.warn('Cannot fetch pools: client or registry ID not available')
      return
    }
    
    setLoadingPools(true)
    setError(null)
    
    try {
      // Get the registry object directly by ID
      const registry = await activeClient.getObject({
        id: activeRegistryId,
        options: {
          showContent: true
        }
      })
      
      // Safely access content using type assertions
      const content = registry.data?.content as any
      
      if (!content?.fields?.pools) {
        console.warn('Registry has no pools field:', registry)
        setLoadingPools(false)
        return
      }
      
      // Extract pool IDs from the registry
      const poolIds = content.fields.pools.map((idObj: any) => idObj)
      
      // Fetch details for each pool
      const poolDetails: Pool[] = []
      
      for (const poolId of poolIds) {
        try {
          const poolObj = await activeClient.getObject({
            id: poolId,
            options: {
              showContent: true
            }
          })
          
          // Use type assertion to safely access fields
          const fields = (poolObj.data?.content as any)?.fields
          
          if (fields) {
            poolDetails.push({
              id: poolId,
              tokenA: fields.token_a_type || 'Unknown Token A',
              tokenB: fields.token_b_type || 'Unknown Token B',
              reserveA: fields.reserve_a || '0',
              reserveB: fields.reserve_b || '0',
              lpTotal: fields.lp_total || '0'
            })
          }
        } catch (poolErr) {
          console.error(`Failed to fetch pool ${poolId}:`, poolErr)
        }
      }
      
      setPools(poolDetails)
    } catch (err) {
      console.error('Failed to fetch pools from registry:', err)
      setError('Failed to fetch pools from registry')
    } finally {
      setLoadingPools(false)
    }
  }

  // Function to create a liquidity pool
  const createPool = async () => {
    if (!client || !address || connectionStatus !== 'connected') {
      setError('Client not initialized or wallet not connected')
      return
    }
    
    if (!tokenAType || !tokenBType) {
      setError('Please provide both token types')
      return
    }
    
    // Validate token types format (basic check)
    if (!tokenAType.includes('::') || !tokenBType.includes('::')) {
      setError('Token types should be in format: 0x123::module::TYPE')
      return
    }
    
    // Check if tokens are the same
    if (tokenAType === tokenBType) {
      setError('Token A and Token B must be different')
      return
    }
    
    setLoading(true)
    setError(null)
    setTxResult(null)
    
    try {
      // Add these derived from user input strings
      const typeArgA = tokenAType; // This should be a full type path
      const typeArgB = tokenBType; // This should be a full type path
      
      console.log('Creating pool with:', {
        registryId,
        tokenAType,
        tokenBType,
        typeArgA,
        typeArgB
      })
      
      // Create a new transaction
      const tx = new Transaction()
      
      // Set an explicit gas budget to avoid automatic determination issues
      tx.setGasBudget(30000000) // Increasing gas budget
      
      // Call the create_pool function from our smart contract, passing registry as first arg
      const poolObject = tx.moveCall({
        target: `${LIQUIDITY_POOL_PACKAGE_ID}::liquidity_pool::create_pool`,
        arguments: [
          // First argument: registry object
          tx.object(registryId),
          // Token types
          tx.pure.string(tokenAType),
          tx.pure.string(tokenBType)
        ],
        typeArguments: [typeArgA, typeArgB] // Add the type arguments here
      })
      
      // Important: Share the pool object so it can be accessed by anyone
      tx.moveCall({
        target: '0x2::transfer::public_share_object',
        arguments: [poolObject],
        typeArguments: [`${LIQUIDITY_POOL_PACKAGE_ID}::liquidity_pool::Pool<${typeArgA}, ${typeArgB}>`]
      })
      
      // Sign and execute the transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Pool created successfully:', result)
            setTxResult(result)
            setLoading(false)
            
            // Clear form
            setTokenAType('')
            setTokenBType('')
            
            // Implement multiple refresh attempts with increasing delays
            const attemptRefresh = (attempt = 1, maxAttempts = 5) => {
              if (attempt > maxAttempts) return;
              
              const delay = attempt * 2000; // Increasing delay: 2s, 4s, 6s, 8s, 10s
              console.log(`Scheduling pool refresh attempt ${attempt}/${maxAttempts} in ${delay}ms`);
              
              setTimeout(() => {
                console.log(`Executing refresh attempt ${attempt}/${maxAttempts}`);
                fetchAllPools();
                attemptRefresh(attempt + 1, maxAttempts);
              }, delay);
            };
            
            attemptRefresh();
          },
          onError: (err) => {
            console.error('Failed to create pool:', err)
            // Extract the VMVerificationOrDeserializationError details if present
            if (err instanceof Error && err.message.includes('VMVerificationOrDeserialization')) {
              setError(`VM Verification Error: This could be due to incorrect token types or contract issues. Full error: ${err.message}`)
            } else {
              setError(err instanceof Error ? err.message : 'Failed to create pool')
            }
            setLoading(false)
          }
        }
      )
    } catch (err) {
      console.error('Transaction setup failed:', err)
      setError(err instanceof Error ? err.message : 'Transaction setup failed')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">IOTA Liquidity Pools</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
          <CardDescription>Connection status and blockchain information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Client Initialized:</strong> {client ? 'Yes' : 'No'}</p>
            <p><strong>Connected:</strong> {connectionStatus === 'connected' ? 'Yes' : 'No'}</p>
            {connectionStatus === 'connected' && currentWallet && address && (
              <p><strong>Address:</strong> {address}</p>
            )}
            <p><strong>Package ID:</strong> {LIQUIDITY_POOL_PACKAGE_ID}</p>
            <p><strong>Registry ID:</strong> {registryId}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Connect wallet to interact with the blockchain</p>
          <ConnectButton />
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="pools" className="w-full mb-8">
        <TabsList>
          <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="createPool">Create Pool</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pools">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Available Pools</CardTitle>
                    <CardDescription>View all available liquidity pools from registry</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchAllPools()}
                    disabled={loadingPools || !registryId}
                  >
                    {loadingPools ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Pools
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingPools ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : pools.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No liquidity pools found. Create one to get started!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pools.map((pool) => (
                        <div
                          key={pool.id}
                          className="border rounded-lg p-4 hover:border-emerald-600 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="relative mr-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                  {pool.tokenA.split('::').pop()}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-gray-100 absolute -bottom-1 -right-1 flex items-center justify-center text-xs">
                                  {pool.tokenB.split('::').pop()}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-medium">{pool.tokenA.split('::').pop()} / {pool.tokenB.split('::').pop()}</h3>
                                <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                  Pool ID: {pool.id}
                                </div>
                              </div>
                            </div>
                            <div className="hidden md:block text-right">
                              <div className="font-medium">Reserves</div>
                              <div className="text-sm text-gray-500">{pool.reserveA || '0'} / {pool.reserveB || '0'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">LP Tokens</div>
                              <div className="text-sm text-gray-500">{pool.lpTotal || '0'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Create Liquidity Pool</CardTitle>
                  <CardDescription>Create a new liquidity pool with two token types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="tokenAType">Token A Type</Label>
                      <Input 
                        id="tokenAType" 
                        placeholder="e.g., 0x2::iota::IOTA" 
                        value={tokenAType} 
                        onChange={(e) => setTokenAType(e.target.value)} 
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="tokenBType">Token B Type</Label>
                      <Input 
                        id="tokenBType" 
                        placeholder="e.g., 0x2::usdc::USDC" 
                        value={tokenBType} 
                        onChange={(e) => setTokenBType(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createPool} 
                    disabled={loading || !client || !address || !tokenAType || !tokenBType || !registryId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Pool...</> : 'Create Liquidity Pool'}
                  </Button>

                  {connectionStatus !== 'connected' && (
                    <div className="text-center py-4 mt-2">
                      <p className="text-sm text-gray-500 mb-2">Connect your wallet to create pools</p>
                      <ConnectButton />
                    </div>
                  )}
                </CardContent>
              </Card>

              {txResult && (
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Last Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1">Transaction Digest:</div>
                      <div className="text-gray-600 break-all">
                        {txResult.digest || "Unknown"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-8">
          {error}
        </div>
      )}
    </div>
  )
}
