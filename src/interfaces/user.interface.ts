import { Document } from "mongoose";

export enum UserRole {
  BILL_OWNER = "bill_owner",
  BILL_SPONSOR = "bill_sponsor",
  SERVICE_PROVIDER = "service_provider",
  MERCHANT = "merchant",
  EXPENSE_MANAGER = "expense_manager",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  role?: UserRole; 
  email: string;
  password: string;
  verified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export default IUser;
