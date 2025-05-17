import { Document, Types } from "mongoose";

export enum UserRole {
  BILL_OWNER = "bill-owner",
  BILL_SPONSOR = "bill-sponsor",
  SERVICE_PROVIDER = "service-provider",
  MERCHANT = "merchant",
  EXPENSE_MANAGER = "expense-manager",
}

export interface IUser extends Document {
  // _id?: Types.ObjectId,
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  email: string;
  password: string;
  verified: boolean;
  notifications: Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export default IUser;
