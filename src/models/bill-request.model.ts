import mongoose, { Document } from "mongoose";
import { IBillRequest } from "../interfaces/bill.interface";

const billRequestSchema = new mongoose.Schema<IBillRequest & Document>(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bills: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    ],
    sponsors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "partially-funded",
        "fully-funded",
        "paid",
        "cancelled",
      ],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    amountFunded: { type: Number, default: 0 },
    paymentProof: String,
    paymentDate: Date,
    shareableLink: { type: String, required: true, unique: true },
    linkExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const BillRequest = mongoose.model<IBillRequest & Document>(
  "BillRequest",
  billRequestSchema
);
export default BillRequest;
