"use client";

// Interface for KYC data
export interface KYCData {
  name: string;
  email: string;
  phone: string;
  country: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  documentType: "passport" | "driverLicense" | "idCard";
  documentId: string;
  verified: boolean;
  verificationDate?: string;
  joinDate: string;
  avatar?: string;
}

// Interface for storing wallet and KYC records
interface WalletKYCRecord {
  address: string;
  kycData: KYCData | null;
  kycCompleted: boolean;
  lastConnected: string;
}

// Default empty KYC data
export const emptyKYCData: KYCData = {
  name: "",
  email: "",
  phone: "",
  country: "",
  dateOfBirth: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
  },
  documentType: "passport",
  documentId: "",
  verified: false,
  joinDate: new Date().toISOString(),
  avatar: "",
};

// Get all wallet records
export const getWalletRecords = (): Record<string, WalletKYCRecord> => {
  try {
    const records = localStorage.getItem('walletKYCRecords');
    return records ? JSON.parse(records) : {};
  } catch (error) {
    console.error("Failed to get wallet records:", error);
    return {};
  }
};

// Save wallet and KYC data
export const saveWalletKYCRecord = (
  address: string, 
  kycData: KYCData | null = null, 
  kycCompleted: boolean = false
): void => {
  try {
    // Get existing records
    const existingRecords = getWalletRecords();
    
    // Update or create record
    existingRecords[address] = {
      address,
      kycData,
      kycCompleted,
      lastConnected: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('walletKYCRecords', JSON.stringify(existingRecords));
  } catch (error) {
    console.error('Failed to save wallet KYC record:', error);
  }
};

// Get KYC data for a specific wallet
export const getWalletKYCData = (address: string): KYCData | null => {
  try {
    const records = getWalletRecords();
    return records[address]?.kycData || null;
  } catch (error) {
    console.error("Failed to get KYC data:", error);
    return null;
  }
};

// Update KYC data for a wallet
export const updateKYCData = (address: string, kycData: KYCData): void => {
  try {
    const records = getWalletRecords();
    
    if (records[address]) {
      records[address].kycData = kycData;
      records[address].kycCompleted = true;
      records[address].lastConnected = new Date().toISOString();
    } else {
      records[address] = {
        address,
        kycData,
        kycCompleted: true,
        lastConnected: new Date().toISOString()
      };
    }
    
    localStorage.setItem('walletKYCRecords', JSON.stringify(records));
  } catch (error) {
    console.error("Failed to update KYC data:", error);
  }
};

// Mark KYC as completed with verification
export const markKYCVerified = (address: string): void => {
  try {
    const records = getWalletRecords();
    
    if (records[address] && records[address].kycData) {
      records[address].kycData.verified = true;
      records[address].kycData.verificationDate = new Date().toISOString();
      records[address].kycCompleted = true;
      localStorage.setItem('walletKYCRecords', JSON.stringify(records));
    }
  } catch (error) {
    console.error("Failed to mark KYC as verified:", error);
  }
};

// Check if wallet exists and has completed KYC
export const hasWalletCompletedKYC = (address: string): boolean => {
  try {
    const records = getWalletRecords();
    return records[address]?.kycCompleted === true;
  } catch (error) {
    console.error("Failed to check KYC status:", error);
    return false;
  }
};

// Hook to handle wallet KYC status and data
export const useWalletKYCData = (address: string | null): { 
  needsKYC: boolean;
  kycData: KYCData | null;
  isVerified: boolean;
} => {
  if (!address) {
    return { 
      needsKYC: true, 
      kycData: null,
      isVerified: false
    };
  }
  
  const records = getWalletRecords();
  const walletRecord = records[address];
  
  if (!walletRecord || !walletRecord.kycCompleted) {
    return { 
      needsKYC: true, 
      kycData: null,
      isVerified: false
    };
  }
  
  return {
    needsKYC: false,
    kycData: walletRecord.kycData,
    isVerified: walletRecord.kycData?.verified || false
  };
}; 