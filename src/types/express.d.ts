import { Document } from "mongoose";
import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      // user?: Document<unknown, {}, IUser> & IUser & { _id: any };
      authUser?: {
        _id: string;
        email: string;
        role?: string;
      };
      user?: IUser & Document;
    }
  }
}
