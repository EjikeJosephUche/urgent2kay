import mongoose, { Schema, Document } from "mongoose";
import { IBill, BillStatus } from "../interfaces/bill.interface";

const billSchema: Schema = new Schema<IBill>(
  {
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    }, //here ⚠️⚠️⚠️
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.PENDING,
    },
    description: { type: String },
    referenceNumber: { type: String, required: true },
    merchantBankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
    }, //here ⚠️⚠️⚠️
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    //just added these lines ⚠️⚠️⚠️
    category: {
      type: String,
      enum: ["rent", "utility", "e-com", "others"],
      required: true,
    },
    priority: { type: String, enum: ["high", "medium", "low"], default: "low" },
  },
  { timestamps: true }
);

export default mongoose.model<IBill>("Bill", billSchema);
