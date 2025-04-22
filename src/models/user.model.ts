import mongoose, { Schema, Document } from "mongoose";
import IUser from "../interfaces/user.interface";

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
