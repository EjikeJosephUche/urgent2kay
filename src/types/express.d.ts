import { Request } from "express";
import { User } from "../models/UserModel";
import IUser from "../interfaces/IUser";
import IAuth from "../interfaces/IAuth";

declare global {
  namespace Express {
    interface Request {
      file?: File;
      files?: File[];
      user: {
        id: string;
        role: string;
      } & Partial<IUser>;  //hopefully these work together ⚠️
      userId?: IAuth;
      user?: IUser; // Added user property to the Request interface
    }
  }
}



