// import { Document, Model } from "mongoose";
// import { Request } from "express";
// import { User } from "../models/UserModel";
// import IUser from "../interfaces/IUser";
// import IAuth from "../interfaces/IAuth";

// declare global {
//   namespace Express {
//     interface Request {
//       file?: File;
//       files?: File[];
//       user?: {
//         id: string;
//         role: string;
//       } & Partial<IUser>; //hopefully these work together ⚠️
//       userId?: IAuth;
//       userId?: IUser;
//       user?: Document<unknown, {}, IUser> & IUser & { _id: any };
//     }
//   }
// }

// // declare global {
// //   namespace Express {
// //     interface Request {
// //       user?: IUser;
// //     }
// //   }
// // }

// export {};


// src/types/express.d.ts
import { Document } from 'mongoose';
import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: Document<unknown, {}, IUser> & IUser & { _id: any };
      userId?: {
        _id: string;
        email?: string;
        role?: string;
      };
    }
  }
}
