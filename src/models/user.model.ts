import mongoose, { Schema, HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import IUser from "../interfaces/user.interface";

const userSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: [
        "bill-owner",
        "service-provider",
        "bill-sponsor",
        "expense-manager", 
      ],
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

const User = mongoose.model<IUser>("User", userSchema);
export default User;
