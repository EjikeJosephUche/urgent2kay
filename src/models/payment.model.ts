import { Schema, model, Document } from "mongoose";
import { IPayment } from "../interfaces/payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    reference: { type: String, required: true, unique: true }, // Paystack ref
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    channel: { type: String }, // e.g. card, bank transfer, etc.
    currency: { type: String, default: "NGN" },

    // Used to associate payment with a bill or a bundle
    bill: { type: Schema.Types.ObjectId, ref: "Bill" },
    bundle: { type: Schema.Types.ObjectId, ref: "BillBundle" },

    // Who made the payment
    payer: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Optional: Save full Paystack response if needed
    metadata: { type: Schema.Types.Mixed },

    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
