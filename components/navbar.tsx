"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Trade", href: "/trade" },
  { name: "Account", href: "/account" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
          <Button variant="outline" className="hidden md:flex">
            Connect Wallet
          </Button>
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
                  <Button variant="outline">Connect Wallet</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
