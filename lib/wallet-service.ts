"use client";

import { useEffect } from 'react';

// Interface for wallet record
interface WalletRecord {
  address: string;
  kycCompleted: boolean;
  lastConnected: string;
}

// Function to save wallet record
export const saveWalletRecord = (address: string, kycCompleted: boolean = false): void => {
  try {
    // Get existing records
    const existingRecordsString = localStorage.getItem('walletRecords');
    const existingRecords: Record<string, WalletRecord> = existingRecordsString 
      ? JSON.parse(existingRecordsString) 
      : {};
    
    // Update or create record
    existingRecords[address] = {
      address,
      kycCompleted,
      lastConnected: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('walletRecords', JSON.stringify(existingRecords));
  } catch (error) {
    console.error('Failed to save wallet record:', error);
  }
};

// Function to check if wallet has completed KYC
export const hasCompletedKYC = (address: string): boolean => {
  try {
    const existingRecordsString = localStorage.getItem('walletRecords');
    if (!existingRecordsString) return false;
    
    const existingRecords: Record<string, WalletRecord> = JSON.parse(existingRecordsString);
    return existingRecords[address]?.kycCompleted === true;
  } catch (error) {
    console.error('Failed to check KYC status:', error);
    return false;
  }
};

// Function to mark KYC as completed
export const markKYCCompleted = (address: string): void => {
  if (!address) return;
  saveWalletRecord(address, true);
};

// Hook to check if wallet needs KYC
export const useWalletKYCStatus = (address: string | null): { needsKYC: boolean } => {
  const needsKYC = !address || !hasCompletedKYC(address);
  return { needsKYC };
}; 