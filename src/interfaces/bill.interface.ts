import { Document, Types } from "mongoose";

//📐 extend document and comment out _id 
export interface IBill {
  _id?: string;
  owner: Types.ObjectId; //ref to a User @EjikeJosephUche
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
  status: "pending" | "partially-paid" | "paid" | "over-due";
  serviceProvider?: Types.ObjectId; //ref to service provider @EjikeJosephUche
  category: "education" | "utility" | "rent" | "health" | "other";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBillRequest {
  _id?: string;
  request: Types.ObjectId; //ref to bill owner @EjikeJosephUche
  bills: Types.ObjectId[];
  sponsors: Types.ObjectId[];
  status:
    | "pending"
    | "partially-funded"
    | "fully-funded"
    | "paid"
    | "cancelled";
  totalAmount: number;
  amountFunded: number;
  paymentProof?: string;
  paymentDate?: Date;
  shareableLink: string;
  linkExpiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

//@6lackboy042, refer here to update your Ipayment interface ⚠️
// export interface IPayment {
//   _id?: string;
//   billRequest: Types.ObjectId; //ref to BillRequest
//   sponsor: Types.ObjectId[]; //refs to User
//   status: "pending" | "successful" | "failed";
//   amount: number;
//   reference: string;
//   paymentMethod: "paystack" | "bank-transfer" | "other";
//   paymentDate?: Date;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
