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
    const [assetDetailsCompleted, setAssetDetailsCompleted] = useState(false)

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
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "asset-details" || assetDetailsCompleted ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {assetDetailsCompleted ? <Check className="h-5 w-5" /> : "2"}
          </div>
          <span className={assetDetailsCompleted ? "text-emerald-600 font-medium" : ""}>Asset Details</span>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeTab === "documents" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            3
          </div>
          <span>Legal Documents</span>
        </div>
      </div>
    </div>
  )
}
