import mongoose, { Schema, Types, HydratedDocument, Document } from "mongoose";
import bcrypt from "bcryptjs";
import IUser from "../interfaces/user.interface";

const userSchema: Schema = new Schema(
  {
    // _id: { type: Types.ObjectId },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: [
        "bill-owner",
        "service-provider",
        "bill-sponsor",
        "merchant",
        "expense-manager",
      ],
      required: true,
      default: "bill-owner",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    //added here to sync notification to user profile
    //we will use .populate to get this done
    notifications: [
      {
        type: Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  { timestamps: true }
);

// compare and save password here
userSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser>, next: (err?: Error) => void) {
    if (!this.isModified("password")) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error as Error);
    }
  }
);

userSchema.methods.comparePassword = async function (
  this: HydratedDocument<IUser>,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser & Document>("User", userSchema);
export default User;
