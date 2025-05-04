"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowRight, CheckCircle, ChevronRight, Clock, Shield, Wallet2, Upload, Check, ImageIcon } from "lucide-react"
import { useCurrentWallet, useCurrentAccount } from '@iota/dapp-kit'
import { KYCData, emptyKYCData, updateKYCData, getWalletKYCData, markKYCVerified } from "@/lib/kyc-service"
import { FadeIn } from "@/components/animations/fade-in"
import { Progress } from "@/components/ui/progress"

export default function KYCPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const [walletAddress, setWalletAddress] = useState("")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<KYCData>(emptyKYCData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check wallet connection
    if (currentWallet && connectionStatus === 'connected' && currentAccount) {
      const address = currentAccount.address || "";
      setWalletAddress(address);
      setWalletLoading(false);
      
      // Check if wallet already has KYC data
      const existingData = getWalletKYCData(address);
      if (existingData) {
        setFormData(existingData);
        if (existingData.avatar) {
          setAvatarPreview(existingData.avatar);
        }
        if (existingData.verified) {
          // If already verified, redirect to account page
          toast({
            title: "Already verified",
            description: "Your KYC has already been verified. Redirecting to account.",
            duration: 5000,
          });
          setTimeout(() => {
            router.push("/account");
          }, 2000);
        }
      }
    } else {
      setWalletAddress("");
      setWalletLoading(false);
    }
  }, [currentWallet, connectionStatus, currentAccount, router, toast]);

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

  const handleFileSelect = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData as any)[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      simulateUpload();
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      simulateUpload();
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        // Update form data with avatar URL (data URL in this case)
        setFormData({
          ...formData,
          avatar: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a complete KYC data record
      const completeFormData: KYCData = {
        ...formData,
        joinDate: formData.joinDate || new Date().toISOString(),
        verified: false // Verification will be done by admin/backend
      };
      
      // Save to localStorage
      updateKYCData(walletAddress, completeFormData);
      
      // Simulate API call for verification
      setTimeout(() => {
        // In a real application, this would be done by an admin after reviewing documents
        markKYCVerified(walletAddress);
        
        toast({
          title: "KYC Submitted Successfully",
          description: "Your KYC has been verified. You can now access all platform features.",
        });
        
        setIsSubmitting(false);
        
        // Redirect to account page
        setTimeout(() => {
          router.push("/account");
        }, 2000);
      }, 3000);
    } catch (error) {
      console.error("KYC submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your KYC information. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container py-8 px-4 mx-auto max-w-3xl">
      <FadeIn>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-gray-500">Complete your identity verification to access all platform features</p>
        </div>

        {!walletAddress && !walletLoading ? (
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Please connect your wallet to continue with KYC verification</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Wallet2 className="h-16 w-16 text-gray-400" />
                </div>
                <p className="mb-6 text-gray-600">
                  You need to connect your wallet first to access the KYC verification process.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > 1 ? <CheckCircle className="h-5 w-5" /> : 1}
                  </div>
                  <div className={`h-1 w-12 mx-1 ${
                    step > 1 ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > 2 ? <CheckCircle className="h-5 w-5" /> : 2}
                  </div>
                  <div className={`h-1 w-12 mx-1 ${
                    step > 2 ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > 3 ? <CheckCircle className="h-5 w-5" /> : 3}
                  </div>
                </div>
                <div className="text-sm text-gray-500">Step {step} of 3</div>
              </div>
            </div>

            {step === 1 && (
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Please provide your basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Enter your legal name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="Enter your phone number" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        name="dateOfBirth" 
                        type="date" 
                        value={formData.dateOfBirth} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country of Residence</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="sg">Singapore</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <div className="border border-dashed rounded-lg p-6 mt-2 flex flex-col items-center justify-center gap-2">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Upload your profile picture</p>
                      <p className="text-xs text-gray-400">PNG, JPG or WEBP (max. 5MB)</p>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleFileSelect(avatarInputRef)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                      
                      {uploadProgress > 0 && avatarFile && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="w-full h-2" />
                          {uploadProgress < 100 && (
                            <p className="text-sm text-gray-500 mt-1 text-center">
                              Uploading... {uploadProgress}%
                            </p>
                          )}
                        </div>
                      )}
                      
                      {uploadProgress === 100 && avatarFile && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                          <Check className="h-4 w-4" /> Image uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Please provide your residential address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input 
                      id="street" 
                      name="address.street" 
                      placeholder="Enter your street address" 
                      value={formData.address.street} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="address.city" 
                        placeholder="Enter your city" 
                        value={formData.address.city} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        name="address.state" 
                        placeholder="Enter your state/province" 
                        value={formData.address.state} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal/ZIP Code</Label>
                    <Input 
                      id="postalCode" 
                      name="address.postalCode" 
                      placeholder="Enter your postal/ZIP code" 
                      value={formData.address.postalCode} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>Please provide your identity document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select 
                      value={formData.documentType} 
                      onValueChange={(value) => handleSelectChange("documentType", value as "passport" | "driverLicense" | "idCard")}
                    >
                      <SelectTrigger id="documentType">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="driverLicense">Driver's License</SelectItem>
                        <SelectItem value="idCard">National ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="documentId">Document ID Number</Label>
                    <Input 
                      id="documentId" 
                      name="documentId" 
                      placeholder="Enter your document ID number" 
                      value={formData.documentId} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="documentUpload">Upload Document Copy</Label>
                    <div className="border border-dashed rounded-lg p-6 mt-2 flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Upload a clear photo or scan of your identity document
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG (max. 10MB)</p>
                      <input
                        type="file"
                        ref={documentInputRef}
                        onChange={handleDocumentUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleFileSelect(documentInputRef)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Select File
                      </Button>
                      
                      {documentFile && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {documentFile.name}
                        </p>
                      )}
                      
                      {uploadProgress > 0 && documentFile && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="w-full h-2" />
                          {uploadProgress < 100 && (
                            <p className="text-sm text-gray-500 mt-1 text-center">
                              Uploading... {uploadProgress}%
                            </p>
                          )}
                        </div>
                      )}
                      
                      {uploadProgress === 100 && documentFile && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                          <Check className="h-4 w-4" /> Document uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md mt-4 border border-yellow-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Important Notes</p>
                        <ul className="text-sm text-yellow-700 mt-1 pl-4 list-disc">
                          <li>Make sure all corners of your document are visible</li>
                          <li>All text must be clearly readable</li>
                          <li>Your information should match the details provided above</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing <Clock className="ml-2 h-4 w-4 animate-spin" /></>
                    ) : (
                      <>Submit <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}

        <div className="mt-8 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
            <div>
              <p className="text-gray-800 font-medium">Privacy & Security</p>
              <p className="text-sm text-gray-600 mt-1">
                Your information is securely stored and will only be used for verification purposes. 
                We do not share your personal data with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  )
} 