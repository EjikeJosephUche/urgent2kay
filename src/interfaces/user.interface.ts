import { Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  verified: boolean;
}

export default IUser;
