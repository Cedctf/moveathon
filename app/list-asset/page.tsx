"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Check, AlertCircle, FileText, ImageIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ListAssetPage() {
  const [activeTab, setActiveTab] = useState("kyc")
  const [kycCompleted, setKycCompleted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedIdType, setSelectedIdType] = useState("passport")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      simulateUpload()
    }
  }

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate KYC verification
    setTimeout(() => {
      setKycCompleted(true)
    }, 1500)
  }

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">List Your Asset</h1>
        <p className="text-gray-500">Tokenize your real-world asset on IOTA's Tangle</p>
      </div>

      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "kyc" || kycCompleted ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {kycCompleted ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <span className={kycCompleted ? "text-emerald-600 font-medium" : ""}>KYC Verification</span>
        </div>
      </div>

      <div className="max-w-9xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>Complete our zero-knowledge KYC process to verify your identity</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleKycSubmit}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter your full name" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" required />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Enter your phone number" required />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="Enter your address" required />
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
                                onChange={(e) => setSelectedIdType(e.target.value)}
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
                                onChange={(e) => setSelectedIdType(e.target.value)}
                                className="h-4 w-4 text-emerald-600"
                              />
                              <Label htmlFor="drivers-license">Driver's License</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="national-id"
                                name="idType"
                                value="national-id"
                                checked={selectedIdType === "national-id"}
                                onChange={(e) => setSelectedIdType(e.target.value)}
                                className="h-4 w-4 text-emerald-600"
                              />
                              <Label htmlFor="national-id">National ID</Label>
                            </div>
                          </div>
                        </div>

                        <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-500">Upload your ID document</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e, setSelectedFile)}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button variant="outline" size="sm" type="button" onClick={() => handleFileSelect(fileInputRef)} className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                            Select File
                          </Button>
                          {selectedFile && (
                            <p className="text-sm text-gray-600 mt-1">
                              Selected: {selectedFile.name}
                            </p>
                          )}
                          {uploadProgress > 0 && (
                            <div className="w-full mt-2">
                              <Progress value={uploadProgress} className="w-full" />
                              {uploadProgress < 100 && (
                                <p className="text-sm text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                              )}
                            </div>
                          )}
                          {uploadProgress === 100 && (
                            <p className="text-sm text-emerald-600 flex items-center gap-1">
                              <Check className="h-4 w-4" /> File uploaded successfully
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
                        <h4 className="font-semibold text-emerald-800">Zero-Knowledge KYC</h4>
                        <p className="text-sm text-emerald-700">
                          Our KYC process uses zero-knowledge proofs to verify your identity without storing your personal
                          data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Submit KYC
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
