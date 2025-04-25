import mongoose, { Document } from "mongoose";
import { IBill } from "../interfaces/bill.interface";

const billSchema = new mongoose.Schema<IBill & Document>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { types: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "partially-paid", "paid", "overdue"],
      default: "pending",
    },
    serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      required: true,
      enum: ["education", "utility", "rent", "health", "other"],
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model<IBill & Document>("Bill", billSchema);
export default Bill;
