"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface KYCBannerProps {
  walletAddress: string | null
  needsKYC: boolean
}

export function KYCBanner({ walletAddress, needsKYC }: KYCBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!walletAddress || !needsKYC || dismissed) {
    return null
  }

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>KYC Required</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
        <div>
          To access all platform features, please complete the KYC verification process.
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDismissed(true)}
            className="border-yellow-300 hover:border-yellow-400 hover:bg-yellow-100"
          >
            Dismiss
          </Button>
          <Link href="/kyc">
            <Button 
              size="sm" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Complete KYC <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
} 