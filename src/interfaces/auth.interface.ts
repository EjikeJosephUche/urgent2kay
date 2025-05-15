
import { Request } from "express";
import IUser from "./user.interface";
import mongoose, {Document} from 'mongoose';
export interface IAuth extends Request {
  _id: string;
  email: string;
  password: string;
  role: string;
}

// declare global {
//   namespace Express {
//     interface Request {
//       user?: IUser & mongoose.Document;
//       authUser?: IAuth;
//     }
//   }
// }
