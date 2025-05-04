'use client'

import { useState, useEffect } from 'react'
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client'
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@iota/dapp-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { Transaction } from '@iota/iota-sdk/transactions'

// Predefined recipient address
const RECIPIENT_ADDRESS = '0x508b47f23a659fb3cf78adb13b72b647498333f38de6670ef7bc102e40b1b38e'

export default function TransferPage() {
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  
  const [client, setClient] = useState<IotaClient | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txResult, setTxResult] = useState<any>(null)

  // Initialize IOTA client
  useEffect(() => {
    try {
      // Use getFullnodeUrl to define Testnet RPC location
      const rpcUrl = getFullnodeUrl('testnet')
      
      // Create a client connected to testnet
      const iotaClient = new IotaClient({ url: rpcUrl })
      setClient(iotaClient)
    } catch (err) {
      console.error('Failed to initialize IOTA client:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize IOTA client')
    }
  }, [])

  // Update address when wallet connection changes
  useEffect(() => {
    if (currentWallet && connectionStatus === 'connected' && currentAccount) {
      setAddress(currentAccount.address || null)
      fetchBalance(currentAccount.address)
    } else {
      setAddress(null)
      setBalance('0')
    }
  }, [currentWallet, connectionStatus, currentAccount])

  // Fetch balance
  const fetchBalance = async (walletAddress: string | null | undefined) => {
    if (!client || !walletAddress) return
    
    try {
      // Get the account balance
      const accountBalance = await client.getBalance({
        owner: walletAddress
      })
      
      // Format the balance (convert from nano - 10^9)
      const formattedBalance = (parseInt(accountBalance.totalBalance || '0') / 10 ** 9).toString()
      setBalance(formattedBalance)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
    }
  }

  // Function to transfer tokens to the predefined address
  const transferTokens = async () => {
    if (!client || !address || connectionStatus !== 'connected') {
      setError('Client not initialized or wallet not connected')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please provide a valid amount')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Create a new transaction
      const tx = new Transaction()
      
      // Set gas budget
      tx.setGasBudget(30000000)
      
      // Convert amount to nano (10^9)
      const amountNano = Math.floor(parseFloat(amount) * 10 ** 9)
      
      // Split coins for the amount
      const coin = tx.splitCoins(tx.gas, [amountNano])
      
      // Transfer the coin to the recipient
      tx.transferObjects([coin], RECIPIENT_ADDRESS)
      
      // Sign and execute the transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Tokens transferred successfully:', result)
            setTxResult(result)
            setLoading(false)
            
            // Clear form field after successful transfer
            setAmount('')
            
            // Refresh balance after transfer
            fetchBalance(address)
          },
          onError: (err) => {
            console.error('Failed to transfer tokens:', err)
            setError(err instanceof Error ? err.message : 'Failed to transfer tokens')
            setLoading(false)
          }
        }
      )
    } catch (err) {
      console.error('Transfer setup failed:', err)
      setError(err instanceof Error ? err.message : 'Transfer setup failed')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">IOTA Wallet Transfer</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
          <CardDescription>Connection status and wallet information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Client Initialized:</strong> {client ? 'Yes' : 'No'}</p>
            <p><strong>Connected:</strong> {connectionStatus === 'connected' ? 'Yes' : 'No'}</p>
            {connectionStatus === 'connected' && currentWallet && address && (
              <>
                <p><strong>Address:</strong> {address}</p>
                <p><strong>Balance:</strong> {balance} IOTA</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchBalance(address)}
                  className="mt-2"
                >
                  Refresh Balance
                </Button>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Connect wallet to transfer tokens</p>
          <ConnectButton />
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>Send tokens to the predefined recipient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input 
                id="recipientAddress" 
                value={RECIPIENT_ADDRESS} 
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">This is the predefined recipient address</p>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount to Send</Label>
              <Input 
                id="amount" 
                type="number" 
                step="any"
                min="0"
                placeholder="Enter amount of IOTA" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={transferTokens} 
            disabled={loading || !client || !address || !amount || parseFloat(amount) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferring Tokens...</> : 'Transfer Tokens'}
          </Button>

          {connectionStatus !== 'connected' && (
            <div className="text-center py-4 mt-2">
              <p className="text-sm text-gray-500 mb-2">Connect your wallet to transfer tokens</p>
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
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mt-6">
          {error}
        </div>
      )}
    </div>
  )
} 