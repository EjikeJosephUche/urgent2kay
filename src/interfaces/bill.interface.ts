import { Document, Types } from "mongoose";
import { MerchantDocument } from "./merchant";

export enum BillStatus {
  PENDING = "pending",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export interface IBill extends Document {
  _id: Types.ObjectId;
  merchant: Types.ObjectId | string | MerchantDocument; //Reference to merchant ⚠️⚠️⚠️
  amount: number;
  dueDate?: Date;
  status: BillStatus;
  description?: string;
  referenceNumber: string;
  merchantBankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  }; //here ⚠️⚠️⚠️
  owner: Types.ObjectId;
  //just added these lines now to redo Bundel entirely ⚠️⚠️⚠️
  category: "rent" | "utility" | "e-com" | "others";
  priority: "high" | "meduim" | "low";
}
