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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [kycData, setKycData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    idVerificationType: "passport",
    idVerificationNumber: "",
    idExpiryDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setKycData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setKycData((prevData) => ({
      ...prevData,
      idVerificationType: value,
    }));
  };

  const handleKycSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setKycSuccess(false);

    console.log("========== FORM SUBMISSION STARTED ==========");
    console.log(`[${new Date().toISOString()}] Form submit triggered`);
    console.log("Form data being submitted:", kycData);
    console.log("Target API endpoint: /api/user-kyc");

    try {
      console.log(`[${new Date().toISOString()}] Sending fetch request...`);
      const response = await fetch("/api/user-kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kycData),
      });

      console.log(`[${new Date().toISOString()}] Response received`);
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("application/json")) {
        console.error("NON-JSON RESPONSE DETECTED!");
        const textResponse = await response.text();
        console.error(
          "First 500 chars of response:",
          textResponse.substring(0, 500)
        );
        console.error(
          "Response URL (actual endpoint that responded):",
          response.url
        );
        throw new Error(
          `Expected JSON response but got: ${contentType || "unknown"}`
        );
      }

      console.log(`[${new Date().toISOString()}] Parsing JSON response...`);
      const result = await response.json();
      console.log("Parsed JSON result:", result);

      if (!response.ok) {
        console.error("Response not OK despite being JSON");
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      console.log(`[${new Date().toISOString()}] KYC Success:`, result);
      setKycSuccess(true);
      alert("KYC Verification Successful!");
    } catch (error: any) {
      console.error(
        `[${new Date().toISOString()}] KYC SUBMISSION ERROR:`,
        error
      );
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      setErrorMessage(
        error.message || "Failed to submit KYC data. Please try again."
      );
    } finally {
      console.log(
        `[${new Date().toISOString()}] Form submission process complete`
      );
      console.log("========== FORM SUBMISSION ENDED ==========");
      setIsLoading(false);
    }
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
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
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
            <form
              onSubmit={handleKycSubmit}
              className="space-y-6 bg-white p-8 rounded-lg shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John A. Smith"
                    value={kycData.fullName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.smith@example.com"
                    value={kycData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1-555-123-4567"
                  value={kycData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="1234 Market Street, Apt 567, San Francisco, CA 94103, USA"
                  value={kycData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="idVerificationType">ID Type</Label>
                  <Select
                    name="idVerificationType"
                    value={kycData.idVerificationType}
                    onValueChange={handleSelectChange}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driversLicense">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="nationalId">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idVerificationNumber">ID Number</Label>
                  <Input
                    id="idVerificationNumber"
                    name="idVerificationNumber"
                    type="text"
                    placeholder="P12345678"
                    value={kycData.idVerificationNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="idExpiryDate">ID Expiry Date</Label>
                  <Input
                    id="idExpiryDate"
                    name="idExpiryDate"
                    type="date"
                    value={kycData.idExpiryDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Submit for Verification"}
                </Button>
              </div>

              {errorMessage && (
                <p className="text-red-600 text-sm text-center">
                  {errorMessage}
                </p>
              )}
              {kycSuccess && (
                <p className="text-green-600 text-sm text-center">
                  KYC Verification Successful! You can now proceed.
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="link"
                    className="text-emerald-600 pl-1"
                  >
                    Go to Dashboard
                  </Button>
                </p>
              )}
            </form>
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
    </div>
  );
}
