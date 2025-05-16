import mongoose, { Schema, Document } from "mongoose";
import { ITransferRecipient } from "../interfaces/transferRecipient.interface";

export interface ITransferRecipientDocument
  extends ITransferRecipient,
    Document {}

const transferRecipientSchema = new Schema<ITransferRecipientDocument>({
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankCode: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, default: "Payout" },
  recipientCode: { type: String, unique: true },
  transferCode: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
});

const TransferRecipient = mongoose.model<ITransferRecipientDocument>(
  "TransferRecipient",
  transferRecipientSchema
);

export default TransferRecipient;
