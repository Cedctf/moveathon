"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { markKYCCompleted } from "@/lib/wallet-service";

interface KYCFormProps {
  walletAddress?: string;
  onKYCComplete?: () => void;
}

export function KYCForm({ walletAddress, onKYCComplete }: KYCFormProps) {
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

  // Verification progress variables
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStep, setVerificationStep] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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

    // Reset verification state
    setVerificationProgress(0);
    setVerificationStep("");
    setVerificationSuccess(false);

    console.log("========== FORM SUBMISSION STARTED ==========");
    console.log(`[${new Date().toISOString()}] Form submit triggered`);
    console.log("Form data being submitted:", kycData);

    try {
      // Simulate DID verification process with IOTA Identity
      const verificationSteps = [
        "Initializing verification...",
        "Creating DID document...",
        "Generating verification keys...",
        "Publishing DID to IOTA ledger...",
        "Verifying identity information...",
        "Creating verifiable credentials...",
        "Signing credentials...",
        "Storing credentials securely...",
        "Finalizing verification...",
      ];

      // Simulate each step with a delay
      for (let i = 0; i < verificationSteps.length; i++) {
        setVerificationStep(verificationSteps[i]);
        setVerificationProgress(
          Math.floor((i / verificationSteps.length) * 100)
        );
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Complete verification
      setVerificationProgress(100);
      setVerificationStep("Verification complete!");
      setVerificationSuccess(true);

      console.log(`[${new Date().toISOString()}] KYC Success`);

      // Wait a bit before showing success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Record KYC completion in wallet service if wallet address is provided
      if (walletAddress) {
        markKYCCompleted(walletAddress);
      }
      
      setKycSuccess(true);
      
      // Call the onKYCComplete callback if provided
      if (onKYCComplete) {
        setTimeout(() => {
          onKYCComplete();
        }, 2000);
      }
    } catch (error: any) {
      console.error(
        `[${new Date().toISOString()}] KYC SUBMISSION ERROR:`,
        error
      );
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

  // Verification progress component
  const VerificationProgress = () => {
    if (verificationProgress === 0 && !verificationStep) return null;

    return (
      <div className="my-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          {verificationSuccess ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          )}
          <span className="font-medium text-sm">{verificationStep}</span>
        </div>
        <Progress value={verificationProgress} className="h-2" />
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4">Identity Verification (KYC)</h2>
        <p className="text-gray-600">
          Please provide your details for verification. This information will be
          used to issue a secure, privacy-preserving credential.
        </p>
      </div>

      <form onSubmit={handleKycSubmit} className="space-y-6">
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
                <SelectItem value="driversLicense">Driver's License</SelectItem>
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

        <VerificationProgress />

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
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        )}

        {kycSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4 text-center">
            <p className="text-emerald-700 text-sm font-medium">
              Your identity has been successfully verified! You can now proceed
              to use the platform.
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <Link href="/marketplace">
                <Button size="sm" className="bg-emerald-600">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/account">
                <Button size="sm" variant="outline">
                  Go to Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 