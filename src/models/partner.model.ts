import { MerchantDocument } from "../interfaces/partner.interface";
import mongoose, { Schema } from "mongoose";

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
      }, //if you make file optional, also make it optional in the backend
      agreedToTerms: { type: Boolean, required: true },
    },
    status: { type: String, default: "pending" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  { timestamps: true }
);

const indexes: [Record<string, any>, Record<string, any>][] =
  MerchantSchema.indexes();

indexes.forEach(([fields]) => {
  if (fields["user_1"]) {
    MerchantSchema.index({ user_1: 1 }, { unique: false });
  }
});

export const Merchant = mongoose.model<MerchantDocument>(
  "Merchant",
  MerchantSchema
);
