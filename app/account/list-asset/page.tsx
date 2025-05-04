"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Check,
  AlertCircle,
  FileText,
  ImageIcon,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function ListAssetPage() {
  const [activeTab, setActiveTab] = useState("kyc");
  const [kycCompleted, setKycCompleted] = useState(false);
  const [assetDetailsCompleted, setAssetDetailsCompleted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedIdType, setSelectedIdType] = useState("passport");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File | null>(null);
  const [selectedTitleDeed, setSelectedTitleDeed] = useState<File | null>(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState<File | null>(null);
  const [selectedAdditionalDocs, setSelectedAdditionalDocs] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycError, setKycError] = useState("");
  const router = useRouter();

  // Asset details state
  const [assetDetails, setAssetDetails] = useState({
    name: "",
    type: "real-estate-residential",
    location: "",
    valuation: "",
    tokenSymbol: "",
    description: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const titleDeedInputRef = useRef<HTMLInputElement>(null);
  const appraisalInputRef = useRef<HTMLInputElement>(null);
  const additionalDocsInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    idVerificationMethod: "passport",
  });

  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStep, setVerificationStep] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleFileSelect = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    console.log(`Updating field ${id} with value: ${value}`);
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleAssetInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    
    console.log(`Input changed - id: ${id}, value: ${value}`);
    
    // Create a copy of the state to update
    const updatedDetails = { ...assetDetails };
    
    // Map the input IDs to the state property names
    if (id === "asset-name") {
      updatedDetails.name = value;
    } else if (id === "token-symbol") {
      updatedDetails.tokenSymbol = value;
    } else if (id === "description") {
      updatedDetails.description = value;
    } else if (id === "location") {
      updatedDetails.location = value;
    } else if (id === "valuation") {
      updatedDetails.valuation = value;
    }
    
    // Update the state with the new values
    setAssetDetails(updatedDetails);
    
    console.log('Updated assetDetails state:', updatedDetails);
  };

  const handleAssetTypeChange = (value: string) => {
    setAssetDetails({
      ...assetDetails,
      type: value,
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIdType(e.target.value);
    setFormData({
      ...formData,
      idVerificationMethod: e.target.value,
    });
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setKycError("");

    console.log("========== SIMULATED KYC VERIFICATION STARTED ==========");
    console.log(
      `[${new Date().toISOString()}] KYC verification simulation triggered`
    );

    try {
      // Simulate verification steps with progress
      const steps = [
        "Initializing verification...",
        "Creating DID document...",
        "Generating verification keys...",
        "Publishing DID to ledger...",
        "Verifying identity information...",
        "Creating verifiable credentials...",
        "Signing credentials...",
        "Storing credentials securely...",
        "Finalizing verification...",
      ];

      // Simulate each step with a delay to make it look realistic
      for (let i = 0; i < steps.length; i++) {
        setVerificationStep(steps[i]);
        setVerificationProgress(Math.floor((i / steps.length) * 100));

        // Show each step for a realistic amount of time
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Simulation complete
      setVerificationProgress(100);
      setVerificationStep("Verification complete!");

      // Show success indicator
      setVerificationSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark KYC as completed and move to next step
      setKycCompleted(true);
      setActiveTab("asset-details");
    } catch (error) {
      console.error("Simulated KYC error:", error);
      setKycError("An unexpected error occurred during verification.");
    } finally {
      setIsSubmitting(false);
      setVerificationProgress(0);
      setVerificationStep("");
      setVerificationSuccess(false);
      console.log("========== SIMULATED KYC VERIFICATION ENDED ==========");
    }
  };

  const handleAssetDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("========== SIMULATED ASSET VERIFICATION STARTED ==========");
    console.log(
      `[${new Date().toISOString()}] Asset verification simulation triggered`
    );

    // Get form data from the asset details form
    const assetForm = e.target as HTMLFormElement;

    // Update assetDetails with form values
    const assetName = (assetForm.querySelector("#asset-name") as HTMLInputElement)?.value || "Unnamed Asset";
    const assetType = document.querySelector("select")?.value || "real-estate-residential";
    const location = (assetForm.querySelector("#location") as HTMLInputElement)?.value || "Unknown Location";
    const valuation = (assetForm.querySelector("#valuation") as HTMLInputElement)?.value || "10000";
    const tokenSymbol = (assetForm.querySelector("#token-symbol") as HTMLInputElement)?.value || "TOKEN";
    const description = (assetForm.querySelector("#description") as HTMLTextAreaElement)?.value || "";

    setAssetDetails({
      name: assetName,
      type: assetType,
      location: location,
      valuation: valuation,
      tokenSymbol: tokenSymbol,
      description: description
    });

    console.log("Asset data collected:", {
      assetName,
      assetType,
      location,
      valuation,
      tokenSymbol,
    });

    try {
      // Reset state
      setVerificationSuccess(false);
      setVerificationProgress(0);

      // Simulate verification steps with progress
      const steps = [
        "Initializing asset verification...",
        "Creating asset DID document...",
        "Generating ZKP-enabled verification keys...",
        "Publishing asset DID to IOTA ledger...",
        "Creating asset metadata...",
        "Generating token contract address...",
        "Creating zero-knowledge proof credentials...",
        "Signing asset credentials...",
        "Finalizing asset verification...",
      ];

      // Simulate each step with a delay
      for (let i = 0; i < steps.length; i++) {
        setVerificationStep(steps[i]);
        setVerificationProgress(Math.floor((i / steps.length) * 100));

        // Show each step for a realistic amount of time
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Simulation complete
      setVerificationProgress(100);
      setVerificationStep("Asset verification complete!");

      // Show success indicator
      setVerificationSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark asset details as completed and move to documents tab
      setAssetDetailsCompleted(true);
      setActiveTab("documents");

      console.log("Asset verification simulation successful");
    } catch (error) {
      console.error("Simulated asset verification error:", error);

      // For demo purposes, still allow continuing
      setVerificationSuccess(true);
      setAssetDetailsCompleted(true);
      setTimeout(() => {
        setActiveTab("documents");
      }, 1000);
    } finally {
      console.log("========== SIMULATED ASSET VERIFICATION ENDED ==========");
    }
  };

  const handleDocumentsSubmit = async () => {
    setIsSubmitting(true);
    console.log("========== SIMULATED DOCUMENTS SUBMISSION STARTED ==========");
    
    try {
      // Reset state
      setVerificationSuccess(false);
      setVerificationProgress(0);

      // Simulate verification steps with progress
      const steps = [
        "Uploading documents to secure storage...",
        "Verifying document authenticity...",
        "Creating document hashes...",
        "Registering documents on-chain...",
        "Linking documents to asset DID...",
        "Finalizing document verification...",
      ];

      // Simulate each step with a delay
      for (let i = 0; i < steps.length; i++) {
        setVerificationStep(steps[i]);
        setVerificationProgress(Math.floor((i / steps.length) * 100));

        // Show each step for a realistic amount of time
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Simulation complete
      setVerificationProgress(100);
      setVerificationStep("Documents submitted successfully!");

      // Show success indicator
      setVerificationSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create the new asset object
      const newAsset = {
        id: Date.now(), // Use timestamp as a unique ID
        name: assetDetails.name || "New Asset",
        symbol: assetDetails.tokenSymbol || "TOKEN",
        type: assetDetails.type === "real-estate-residential" || assetDetails.type === "real-estate-commercial" 
          ? "Real Estate" 
          : "Collectible",
        value: parseInt(assetDetails.valuation) || 10000,
        ownership: 1.0, // Full ownership for newly listed assets
        status: "pending", // New assets start as pending
      };

      // Store the new asset in localStorage
      const existingAssets = localStorage.getItem('userAssets');
      let assetsArray = existingAssets ? JSON.parse(existingAssets) : [];
      assetsArray.push(newAsset);
      localStorage.setItem('userAssets', JSON.stringify(assetsArray));

      // Create a transaction for the listing
      const newTransaction = {
        id: Date.now(),
        type: "list_asset",
        asset: newAsset.name,
        amount: "1",
        value: newAsset.value,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: "completed",
      };

      // Store the new transaction in localStorage
      const existingTransactions = localStorage.getItem('userTransactions');
      let transactionsArray = existingTransactions ? JSON.parse(existingTransactions) : [];
      transactionsArray.push(newTransaction);
      localStorage.setItem('userTransactions', JSON.stringify(transactionsArray));

      // Redirect to the account page after successful submission
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/account');
      
    } catch (error) {
      console.error("Simulated document submission error:", error);
    } finally {
      setIsSubmitting(false);
      console.log("========== SIMULATED DOCUMENTS SUBMISSION ENDED ==========");
    }
  };

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
    <div className="container py-8 px-4 mx-auto">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold mb-2">List Your Asset</h1>
        <p className="text-gray-500">
          Tokenize your real-world asset on IOTA's Tangle
        </p>
      </div>

      <div className="flex justify-start items-center mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "kyc" || kycCompleted
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {kycCompleted ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <span className={kycCompleted ? "text-emerald-600 font-medium" : ""}>
            KYC Verification
          </span>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "asset-details" || assetDetailsCompleted
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {assetDetailsCompleted ? <Check className="h-5 w-5" /> : "2"}
          </div>
          <span
            className={
              assetDetailsCompleted ? "text-emerald-600 font-medium" : ""
            }
          >
            Asset Details
          </span>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "documents"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            3
          </div>
          <span>Legal Documents</span>
        </div>
      </div>

      <div className="max-w-9xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger value="asset-details">Asset Details</TabsTrigger>
            <TabsTrigger value="documents">Legal Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>
                  Complete our zero-knowledge KYC process to verify your
                  identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleKycSubmit}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-white text-black border-gray-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white text-black border-gray-200"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-white text-black border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="bg-white text-black border-gray-200"
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label>ID Verification</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="passport"
                                name="idType"
                                value="passport"
                                checked={selectedIdType === "passport"}
                                onChange={handleRadioChange}
                                className="h-4 w-4 text-emerald-600"
                              />
                              <Label htmlFor="passport">Passport</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="drivers-license"
                                name="idType"
                                value="drivers-license"
                                checked={selectedIdType === "drivers-license"}
                                onChange={handleRadioChange}
                                className="h-4 w-4 text-emerald-600"
                              />
                              <Label htmlFor="drivers-license">
                                Driver's License
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="national-id"
                                name="idType"
                                value="national-id"
                                checked={selectedIdType === "national-id"}
                                onChange={handleRadioChange}
                                className="h-4 w-4 text-emerald-600"
                              />
                              <Label htmlFor="national-id">National ID</Label>
                            </div>
                          </div>
                        </div>

                        <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Upload your ID document
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) =>
                              handleFileChange(e, setSelectedFile)
                            }
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => handleFileSelect(fileInputRef)}
                            className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                          >
                            Select File
                          </Button>
                          {selectedFile && (
                            <p className="text-sm text-gray-600 mt-1">
                              Selected: {selectedFile.name}
                            </p>
                          )}
                          {uploadProgress > 0 && (
                            <div className="w-full mt-2">
                              <Progress
                                value={uploadProgress}
                                className="w-full"
                              />
                              {uploadProgress < 100 && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Uploading... {uploadProgress}%
                                </p>
                              )}
                            </div>
                          )}
                          {uploadProgress === 100 && (
                            <p className="text-sm text-emerald-600 flex items-center gap-1">
                              <Check className="h-4 w-4" /> File uploaded
                              successfully
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the terms of service and privacy policy
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-emerald-800">
                          Zero-Knowledge KYC
                        </h4>
                        <p className="text-sm text-emerald-700">
                          Our KYC process uses zero-knowledge proofs to verify
                          your identity without storing your personal data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <VerificationProgress />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asset-details">
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
                <CardDescription>
                  Provide information about the asset you want to tokenize
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssetDetailsSubmit}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="asset-name">Asset Name</Label>
                      <Input
                        id="asset-name"
                        placeholder="Enter asset name"
                        required
                        className="bg-white text-black border-gray-200"
                        value={assetDetails.name}
                        onChange={handleAssetInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="asset-type">Asset Type</Label>
                        <Select 
                          required
                          value={assetDetails.type}
                          onValueChange={handleAssetTypeChange}
                        >
                          <SelectTrigger className="bg-white text-black border-gray-200">
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem
                              value="real-estate-residential"
                              className="hover:bg-emerald-50 cursor-pointer"
                            >
                              Real Estate - Residential
                            </SelectItem>
                            <SelectItem
                              value="real-estate-commercial"
                              className="hover:bg-emerald-50 cursor-pointer"
                            >
                              Real Estate - Commercial
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter asset location"
                          required
                          className="bg-white text-black border-gray-200"
                          value={assetDetails.location}
                          onChange={handleAssetInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="valuation">Valuation (USD)</Label>
                        <Input
                          id="valuation"
                          type="number"
                          placeholder="Enter asset valuation"
                          required
                          className="bg-white text-black border-gray-200"
                          value={assetDetails.valuation}
                          onChange={handleAssetInputChange}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="token-symbol">Token Symbol</Label>
                        <Input
                          id="token-symbol"
                          placeholder="e.g., NYC-APT"
                          required
                          className="bg-white text-black border-gray-200"
                          value={assetDetails.tokenSymbol}
                          onChange={handleAssetInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="description">Asset Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your asset in detail"
                        rows={4}
                        required
                        className="bg-white text-black border-gray-200"
                        value={assetDetails.description}
                        onChange={handleAssetInputChange}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label>Asset Images</Label>
                      <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Upload images of your asset
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG or WEBP (max. 10MB)
                        </p>
                        <input
                          type="file"
                          ref={imagesInputRef}
                          onChange={(e) =>
                            handleFileChange(e, setSelectedImages)
                          }
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.webp"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleFileSelect(imagesInputRef)}
                          className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                        >
                          Select Files
                        </Button>
                        {selectedImages && (
                          <p className="text-sm text-gray-600 mt-1">
                            Selected: {selectedImages.name}
                          </p>
                        )}
                        {uploadProgress > 0 && (
                          <div className="w-full mt-2">
                            <Progress
                              value={uploadProgress}
                              className="w-full"
                            />
                            {uploadProgress < 100 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Uploading... {uploadProgress}%
                              </p>
                            )}
                          </div>
                        )}
                        {uploadProgress === 100 && (
                          <p className="text-sm text-emerald-600 flex items-center gap-1">
                            <Check className="h-4 w-4" /> Files uploaded
                            successfully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <VerificationProgress />

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("kyc")}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Back
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>
                  Upload legal documents to verify ownership and complete the
                  tokenization process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label>Title Deed / Proof of Ownership</Label>
                    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Upload title deed or proof of ownership
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOCX (max. 10MB)
                      </p>
                      <input
                        type="file"
                        ref={titleDeedInputRef}
                        onChange={(e) =>
                          handleFileChange(e, setSelectedTitleDeed)
                        }
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleFileSelect(titleDeedInputRef)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        Select File
                      </Button>
                      {selectedTitleDeed && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {selectedTitleDeed.name}
                        </p>
                      )}
                      {uploadProgress > 0 && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="w-full" />
                          {uploadProgress < 100 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Uploading... {uploadProgress}%
                            </p>
                          )}
                        </div>
                      )}
                      {uploadProgress === 100 && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> File uploaded
                          successfully
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label>Appraisal Document</Label>
                    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Upload asset appraisal document
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOCX (max. 10MB)
                      </p>
                      <input
                        type="file"
                        ref={appraisalInputRef}
                        onChange={(e) =>
                          handleFileChange(e, setSelectedAppraisal)
                        }
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleFileSelect(appraisalInputRef)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        Select File
                      </Button>
                      {selectedAppraisal && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {selectedAppraisal.name}
                        </p>
                      )}
                      {uploadProgress > 0 && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="w-full" />
                          {uploadProgress < 100 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Uploading... {uploadProgress}%
                            </p>
                          )}
                        </div>
                      )}
                      {uploadProgress === 100 && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> File uploaded
                          successfully
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label>Additional Documents</Label>
                    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Upload any additional supporting documents
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOCX (max. 10MB)
                      </p>
                      <input
                        type="file"
                        ref={additionalDocsInputRef}
                        onChange={(e) =>
                          handleFileChange(e, setSelectedAdditionalDocs)
                        }
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleFileSelect(additionalDocsInputRef)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        Select Files
                      </Button>
                      {selectedAdditionalDocs && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {selectedAdditionalDocs.name}
                        </p>
                      )}
                      {uploadProgress > 0 && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="w-full" />
                          {uploadProgress < 100 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Uploading... {uploadProgress}%
                            </p>
                          )}
                        </div>
                      )}
                      {uploadProgress === 100 && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Files uploaded
                          successfully
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-6 mt-4">
                    <h3 className="font-semibold mb-4">Tokenization Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="erc3643"
                          defaultChecked
                          className="h-4 w-4 text-emerald-600 rounded border-gray-300 mt-1"
                        />
                        <div>
                          <label
                            htmlFor="erc3643"
                            className="font-medium text-sm"
                          >
                            Mint token via ERC3643 standard
                          </label>
                          <p className="text-sm text-gray-500">
                            The ERC3643 standard is designed for security tokens
                            and complies with regulatory requirements.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="synthetic"
                          className="h-4 w-4 text-emerald-600 rounded border-gray-300 mt-1"
                        />
                        <div>
                          <label
                            htmlFor="synthetic"
                            className="font-medium text-sm"
                          >
                            Enable synthetic trading (sRWA)
                          </label>
                          <p className="text-sm text-gray-500">
                            Allow traders to create synthetic versions of your
                            asset for trading without owning the underlying
                            asset.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="liquidity"
                          className="h-4 w-4 text-emerald-600 rounded border-gray-300 mt-1"
                        />
                        <div>
                          <label
                            htmlFor="liquidity"
                            className="font-medium text-sm"
                          >
                            Create liquidity pool
                          </label>
                          <p className="text-sm text-gray-500">
                            Create a liquidity pool for your asset to enable
                            trading and earn rewards from trading fees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-emerald-800">
                          Verification Process
                        </h4>
                        <p className="text-sm text-emerald-700">
                          After submission, our team will verify your documents
                          and asset details. This process typically takes 2-3
                          business days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms-documents"
                      required
                      className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="terms-documents"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that all information and documents provided are
                      accurate and legally valid
                    </label>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("asset-details")}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleDocumentsSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
