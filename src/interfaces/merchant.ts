import mongoose, { Document } from "mongoose";

export interface MerchantDocument extends Document {
  business: {
    businessName: string;
    typeOfBusiness: string;
    businessRegNumber: string;
    email: string;
    address: string;
    phone: string;
  };
  personal: {
    firstname: string;
    lastname: string;
    email: string;
    phone1: string;
    phone2: string;
    role: string;
  };
  bank: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ownershipProof: File | null;
    agreedToTerms: boolean;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
