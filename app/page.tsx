"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Coins,
  Globe,
} from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import React, { useState } from "react";
import { KYCForm } from "@/components/kyc-form";
import { useAccounts } from "@iota/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasCompletedKYC } from "@/lib/wallet-service";
import { KYCModal } from "@/components/kyc-modal";

export default function Home() {
  const router = useRouter();
  const accounts = useAccounts();
  const isConnected = accounts.length > 0;
  const currentAccount = accounts[0];
  const address = currentAccount?.address;
  const [hasKYC, setHasKYC] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

  // Check if wallet has completed KYC when connected
  useEffect(() => {
    if (address) {
      const completed = hasCompletedKYC(address);
      setHasKYC(completed);
    } else {
      setHasKYC(false);
    }
  }, [address, isConnected]);

  const handleGetStarted = () => {
    if (!isConnected) {
      // If not connected, show KYC modal
      setIsKYCModalOpen(true);
    } else if (!hasKYC) {
      // If connected but hasn't completed KYC, show KYC modal
      setIsKYCModalOpen(true);
    } else {
      // If connected and has completed KYC, go to account page
      router.push('/account');
    }
  };

  const handleKYCComplete = () => {
    setHasKYC(true);
    // Close the modal with a slight delay to allow animation
    setTimeout(() => {
      setIsKYCModalOpen(false);
      // Navigate to account page
      router.push('/account');
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="object-cover w-full h-full"
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <FadeIn delay={300} duration={800}>
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm px-3 py-1 text-sm font-medium mb-6">
              <span className="text-emerald-500 mr-1">•</span> Powered by IOTA's
              Tangle
            </div>
          </FadeIn>

          <FadeIn delay={500} duration={800}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-white drop-shadow-md">
              Bringing Real-World Assets to IOTA's Tangle
            </h1>
          </FadeIn>

          <FadeIn delay={700} duration={800}>
            <p className="max-w-[700px] text-lg md:text-xl text-white/90 mb-8 drop-shadow">
              Tokenize, trade, and invest in real-world assets on the most
              secure and scalable distributed ledger.
            </p>
          </FadeIn>

          <FadeIn delay={900} duration={800}>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                onClick={handleGetStarted}
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
             
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

      {/* KYC Form Section */}
      <section id="kyc-form" className="py-20 bg-gray-100">
        <div className="container px-4 mx-auto max-w-2xl">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Identity Verification (KYC)
              </h2>
              <p className="text-gray-600">
                Please provide your details for verification. This information
                will be used to issue a secure, privacy-preserving credential.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <KYCForm 
              walletAddress={address} 
              onKYCComplete={handleKYCComplete} 
            />
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tokenize Any Real-World Asset
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From real estate to luxury items, Asseta enables the
                tokenization and synthetic trading of any real-world asset on
                IOTA's secure Tangle.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <StaggerItem>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Tokenize Real Estate
                </h3>
                <p className="text-gray-600 mb-4">
                  Convert property ownership into digital tokens for fractional
                  investment and trading.
                </p>
                <Link
                  href="/account"
                  className="text-emerald-600 font-medium inline-flex items-center"
                >
                  Explore Properties <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Synthetic Trading
                </h3>
                <p className="text-gray-600 mb-4">
                  Trade synthetic versions of real-world assets without owning
                  the underlying asset.
                </p>
                <Link
                  href="/trade"
                  className="text-emerald-600 font-medium inline-flex items-center"
                >
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
                  Access global liquidity pools and earn rewards by providing
                  liquidity to asset pairs.
                </p>
                <Link
                  href="/marketplace"
                  className="text-emerald-600 font-medium inline-flex items-center"
                >
                  View Pools <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Asseta Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A simple process to tokenize, trade, and invest in real-world
                assets on IOTA's Tangle.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500 hover:scale-110">
                  <span className="text-2xl font-bold text-emerald-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">KYC Verification</h3>
                <p className="text-gray-600">
                  Complete our zero-knowledge KYC process to verify your
                  identity.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500 hover:scale-110">
                  <span className="text-2xl font-bold text-emerald-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">List Your Asset</h3>
                <p className="text-gray-600">
                  Submit your asset details and documentation for verification.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500 hover:scale-110">
                  <span className="text-2xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Mint Tokens</h3>
                <p className="text-gray-600">
                  Once approved, mint ERC3643 tokens representing your asset.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500 hover:scale-110">
                  <span className="text-2xl font-bold text-emerald-600">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Trade or Invest</h3>
                <p className="text-gray-600">
                  Trade synthetic versions or invest in tokenized assets.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
      
      {/* KYC Modal */}
      <KYCModal 
        isOpen={isKYCModalOpen} 
        onOpenChange={setIsKYCModalOpen}
        walletAddress={address ?? undefined}
        onKYCComplete={handleKYCComplete}
      />
    </div>
  );
}
