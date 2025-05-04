"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConnectButton, useAccounts } from "@iota/dapp-kit"
import { KYCModal } from "./kyc-modal"
import { hasCompletedKYC } from "@/lib/wallet-service"

const navLinks = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Trade", href: "/trade" },
  { name: "Account", href: "/account" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)
  const [hasKYC, setHasKYC] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const accounts = useAccounts()
  const isConnected = accounts.length > 0
  const currentAccount = accounts[0]
  const address = currentAccount?.address
  
  // Check if wallet has completed KYC when connected
  useEffect(() => {
    if (address) {
      const completed = hasCompletedKYC(address)
      setHasKYC(completed)
    } else {
      setHasKYC(false)
    }
  }, [address, isConnected])
  
  // This function will be exported and can be used by other components
  const handleGetStarted = () => {
    if (!isConnected) {
      // If not connected, show KYC modal
      setIsKYCModalOpen(true)
    } else if (!hasKYC) {
      // If connected but hasn't completed KYC, show KYC modal
      setIsKYCModalOpen(true)
    } else {
      // If connected and has completed KYC, go to account page
      router.push('/account')
    }
  }

  const handleKYCComplete = () => {
    setHasKYC(true)
    // Close the modal with a slight delay to allow animation
    setTimeout(() => {
      setIsKYCModalOpen(false)
      // Navigate to account page
      router.push('/account')
    }, 500)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block h-6 w-6 bg-emerald-600 rounded-full"></span>
            <span className="font-bold text-xl">Asseta</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600",
                  pathname === link.href ? "text-emerald-600" : "text-foreground/60",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <ConnectButton />
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] bg-white">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-emerald-600",
                      pathname === link.href ? "text-emerald-600" : "text-foreground/60",
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4">
                  <ConnectButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* KYC Modal */}
      <KYCModal 
        isOpen={isKYCModalOpen} 
        onOpenChange={setIsKYCModalOpen}
        walletAddress={address ?? undefined}
        onKYCComplete={handleKYCComplete}
      />
    </header>
  )
}
