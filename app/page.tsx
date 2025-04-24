import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, ChevronRight, Coins, Globe } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <FadeIn delay={300} duration={800}>
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm px-3 py-1 text-sm font-medium mb-6">
              <span className="text-emerald-500 mr-1">•</span> Powered by IOTA's Tangle
            </div>
          </FadeIn>

          <FadeIn delay={500} duration={800}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-white drop-shadow-md">
              Bringing Real-World Assets to IOTA's Tangle
            </h1>
          </FadeIn>

          <FadeIn delay={700} duration={800}>
            <p className="max-w-[700px] text-lg md:text-xl text-white/90 mb-8 drop-shadow">
              Tokenize, trade, and invest in real-world assets on the most secure and scalable distributed ledger.
            </p>
          </FadeIn>

          <FadeIn delay={900} duration={800}>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/list-asset">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 w-full sm:w-auto"
                >
                  List Asset
                </Button>
              </Link>
              <Link href="/trade">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 w-full sm:w-auto"
                >
                  Trade sRWA
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tokenize Any Real-World Asset</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From real estate to luxury items, Asseta enables the tokenization and synthetic trading of any
                real-world asset on IOTA's secure Tangle.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tokenize Real Estate</h3>
                <p className="text-gray-600 mb-4">
                  Convert property ownership into digital tokens for fractional investment and trading.
                </p>
                <Link href="/dashboard" className="text-emerald-600 font-medium inline-flex items-center">
                  Explore Properties <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Synthetic Trading</h3>
                <p className="text-gray-600 mb-4">
                  Trade synthetic versions of real-world assets without owning the underlying asset.
                </p>
                <Link href="/trade" className="text-emerald-600 font-medium inline-flex items-center">
                  Start Trading <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Liquidity</h3>
                <p className="text-gray-600 mb-4">
                  Access global liquidity pools and earn rewards by providing liquidity to asset pairs.
                </p>
                <Link href="/pools" className="text-emerald-600 font-medium inline-flex items-center">
                  View Pools <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      
    </div>
  )
}
