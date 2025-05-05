import { MerchantDocument } from "../interfaces/merchant";
import mongoose from "mongoose";

const MerchantSchema = new mongoose.Schema<MerchantDocument>(
  {
    business: {
      businessName: { type: String, required: true },
      typeOfBusiness: { type: String, required: true },
      businessRegNumber: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    personal: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      email: { type: String, required: true },
      phone1: { type: String, required: true },
      phone2: { type: String, required: true },
      role: { type: String, required: true },
    },
    bank: {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ownershipProof: {
        path: String,
        filename: String,
        mimetype: String,
      }, //if you make ownershipProof optional, also make it optional in the frontend
      agreedToTerms: { type: Boolean, required: true },
    },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export const Merchant = mongoose.model<MerchantDocument>(
  "Merchant",
  MerchantSchema
);
