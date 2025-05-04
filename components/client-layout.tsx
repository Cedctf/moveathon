'use client'

import { ReactNode, useState } from "react"
import { createNetworkConfig, IotaClientProvider, WalletProvider } from '@iota/dapp-kit'
import { getFullnodeUrl } from '@iota/iota-sdk/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create network config for IOTA connections
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  testnet: { url: getFullnodeUrl('testnet') },
})

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Create a client-side QueryClient instance 
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider 
          persistConnection={true} 
          autoConnect={true}
          autoReconnect={true}
        >
          {children}
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  )
} 