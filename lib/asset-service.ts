"use client";

// Interface for asset data
export interface AssetData {
  id: string;
  name: string;
  symbol: string; 
  type: string;
  location?: string;
  value: number;
  ownership: number;
  status: "pending" | "active" | "rejected";
  description?: string;
  imageUrl?: string;
  createdAt: string;
  walletAddress: string;
}

// Get all assets for a wallet address
export const getWalletAssets = (walletAddress: string): AssetData[] => {
  try {
    // Get assets from localStorage
    const assetsString = localStorage.getItem('walletAssets');
    if (!assetsString) return [];
    
    const allAssets: Record<string, AssetData[]> = JSON.parse(assetsString);
    return allAssets[walletAddress] || [];
  } catch (error) {
    console.error("Failed to get wallet assets:", error);
    return [];
  }
};

// Save a new asset for a wallet
export const saveAsset = (walletAddress: string, asset: Omit<AssetData, 'id' | 'walletAddress' | 'createdAt'>): AssetData => {
  try {
    // Create a new asset with generated ID and timestamp
    const newAsset: AssetData = {
      ...asset,
      id: generateId(),
      walletAddress,
      createdAt: new Date().toISOString(),
    };
    
    // Get existing assets
    const assetsString = localStorage.getItem('walletAssets');
    const allAssets: Record<string, AssetData[]> = assetsString 
      ? JSON.parse(assetsString) 
      : {};
    
    // Add new asset to wallet's assets array
    const walletAssets = allAssets[walletAddress] || [];
    allAssets[walletAddress] = [...walletAssets, newAsset];
    
    // Save back to localStorage
    localStorage.setItem('walletAssets', JSON.stringify(allAssets));
    
    return newAsset;
  } catch (error) {
    console.error("Failed to save asset:", error);
    throw new Error("Failed to save asset");
  }
};

// Update an existing asset
export const updateAsset = (walletAddress: string, assetId: string, updates: Partial<AssetData>): AssetData | null => {
  try {
    // Get existing assets
    const assetsString = localStorage.getItem('walletAssets');
    if (!assetsString) return null;
    
    const allAssets: Record<string, AssetData[]> = JSON.parse(assetsString);
    const walletAssets = allAssets[walletAddress] || [];
    
    // Find and update the asset
    const assetIndex = walletAssets.findIndex(asset => asset.id === assetId);
    if (assetIndex === -1) return null;
    
    // Update asset data
    walletAssets[assetIndex] = {
      ...walletAssets[assetIndex],
      ...updates
    };
    
    // Save back to localStorage
    allAssets[walletAddress] = walletAssets;
    localStorage.setItem('walletAssets', JSON.stringify(allAssets));
    
    return walletAssets[assetIndex];
  } catch (error) {
    console.error("Failed to update asset:", error);
    return null;
  }
};

// Delete an asset
export const deleteAsset = (walletAddress: string, assetId: string): boolean => {
  try {
    // Get existing assets
    const assetsString = localStorage.getItem('walletAssets');
    if (!assetsString) return false;
    
    const allAssets: Record<string, AssetData[]> = JSON.parse(assetsString);
    const walletAssets = allAssets[walletAddress] || [];
    
    // Filter out the asset to delete
    allAssets[walletAddress] = walletAssets.filter(asset => asset.id !== assetId);
    
    // Save back to localStorage
    localStorage.setItem('walletAssets', JSON.stringify(allAssets));
    
    return true;
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return false;
  }
};

// Generate a unique ID for assets
const generateId = (): string => {
  return 'asset_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}; 