import { Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  role?: "bill-owner" | "service-provider" | "bill-sponsor" | "expense-manager"; //expense-manager
  email: string;
  password: string;
  verified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export default IUser;
