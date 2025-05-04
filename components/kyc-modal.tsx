"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KYCForm } from "./kyc-form";

interface KYCModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
  onKYCComplete?: () => void;
}

export function KYCModal({ 
  isOpen, 
  onOpenChange, 
  walletAddress, 
  onKYCComplete 
}: KYCModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">Complete KYC</DialogTitle>
          <DialogDescription className="text-center">
            Complete the KYC process to access all platform features.
          </DialogDescription>
        </DialogHeader>
        <KYCForm 
          walletAddress={walletAddress} 
          onKYCComplete={() => {
            if (onKYCComplete) onKYCComplete();
            onOpenChange(false);
          }} 
        />
      </DialogContent>
    </Dialog>
  );
} 