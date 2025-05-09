import { Document, Schema, Types, model } from "mongoose";

interface MerchantBankDetail {
  billId: Types.ObjectId;
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  category: string;
}

export interface IBillBundle extends Document {
  title: string;
  description?: string;
  bills: Schema.Types.ObjectId[]; //array of bill IDs
  totalAmount: number;
  status: "pending" | "partially-funded" | "fully-funded" | "paid";
  uniqueLink: string; //shareable link
  owner: Schema.Types.ObjectId;
  sponsors: {
    user: Types.ObjectId;
    amount: number;
    status: "pending" | "paid" | "declined";
  }[];
  merchantBankDetails: MerchantBankDetail[];
}
