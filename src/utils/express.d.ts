import { Request } from "express";
import { User } from "../models/UserModel";
import IUser from "../interfaces/IUser";
import IAuth from "../interfaces/IAuth";

declare global {
  namespace Express {
    interface Request {
      user?: IAuth;
    }
  }
}
