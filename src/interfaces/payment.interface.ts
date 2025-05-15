import { Types } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  reference: string;
  amount: number;
  status: "pending" | "successful" | "failed";
  channel?: string;
  currency?: string;
  bill?: Types.ObjectId;
  bundle?: Types.ObjectId;
  payer: Types.ObjectId;
  metadata?: any;
  paidAt?: Date;
}
