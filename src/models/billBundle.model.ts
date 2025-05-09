import crypto from "crypto";
import { IBillBundle } from "../interfaces/billBundle.interface";
import Bill from "./bill.model";
import { Document, Schema, model } from "mongoose";

export const BillBundleSchema = new Schema<IBillBundle>(
  {
    title: { type: String, required: true },
    description: { type: String },
    bills: [{ type: Schema.ObjectId, ref: "Bill", required: true }],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "partially-paid", "fully-paid", "paid"],
      default: "pending",
    },
    uniqueLink: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    }, //generated here ⚠️⚠️⚠️
    owner: { type: Schema.ObjectId, ref: "User", required: true },
    sponsors: [
      {
        user: { type: Schema.ObjectId, ref: "User" },
        amount: { type: Number },
        status: {
          type: String,
          enum: ["pending", "paid", "declined"],
          default: "pending",
        },
      },
    ],
    merchantBankDetails: [
      {
        billId: { type: Schema.Types.ObjectId, required: true },
        bankName: { type: String, required: true },
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        amount: { type: Number, required: true },
        category: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

//get totalAmount before saving
BillBundleSchema.pre("save", async function (next) {
  if (this.isModified("bills")) {
    const bills = await Bill.find({ _id: { $in: this.bills } });
    this.totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  }
  next();
});

export const BillBundle = model<IBillBundle & Document>(
  "BillBundle",
  BillBundleSchema
);
