import { IUser } from "./../interfaces/user.interface";
import { RequestHandler } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IAuth from "../interfaces/auth.interface";
import User from "../models/user.model";
import dotenv from "dotenv";
import { JWT_SECRET } from "../utils/env";
import { sendErrorResponse } from "../utils/apiResponse";
import mongoose, { Document } from "mongoose";

dotenv.config();

export interface AuthenticatedRequest extends Request {
  user?:
    | (Document<unknown, {}, IUser> & IUser & { _id: any } & typeof User)
    | any;
  userId?: {
    _id: string;
    email?: string;
    role?: string;
  };
}

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    console.log("=== AUTH MIDDLEWARE TRIGGERED ===");
    console.log("Headers:", req.headers);

    const token = req.header("Authorization")?.replace("Bearer", "").trim();

    console.log("Extracted token:", token);

    if (!token) {
      console.log("No token found");
      res.status(401).json({
        message: "Access denied, token is missing",
      });
      return;
    }
    const decoded = Jwt.verify(token as string, JWT_SECRET as string) as IAuth;

    console.log("Decoded token:", decoded);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "_id" in decoded &&
      "email" in decoded &&
      "role" in decoded
    ) {
      //adding role to the req payload
      const user = await User.findById(decoded._id).select("+role").lean();
      if (!user) {
        res.status(401).json({ message: "User not found 😞" });
        return;
      }

      console.log("User from DB:", user);

      authReq.userId = {
        _id: (decoded as IAuth)._id,
        email: (decoded as IAuth).email,
        role: user.role,
      };
      req.user = user;
      console.log("Attached user:", req.user);
    }

    next();
  } catch (error) {
    console.log("JWT verification failed", error);
    res.status(401).json({
      message: "invalid token",
    });
  }
};

// const authMiddleware: RequestHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     console.log("=== AUTH MIDDLEWARE TRIGGERED ===");

//     // 1. Token Extraction
//     const token = req.header("Authorization")?.replace("Bearer ", "").trim();
//     if (!token) {
//       console.log("No token found");
//       res.status(401).json({ message: "Access denied, token is missing" });
//       return;
//     }

//     // 2. Token Verification
//     const decoded = Jwt.verify(token, JWT_SECRET) as IAuth;
//     console.log("Decoded token:", decoded);

//     // 3. User Lookup
//     console.log("Searching for user with ID:", decoded._id);
//     const user = await User.findById(
//       new mongoose.Types.ObjectId(decoded._id)
//     ).select("+role");
//     console.log("Found user:", user);
//     if (!user) {
//       console.error(`User with ID ${decoded._id} not found in database`);
//       res.status(401).json({
//         message: "User not found",
//         decodedToken: decoded, // For debugging
//         databaseCheck:
//           "Run db.users.find({_id: ObjectId('" + decoded._id + "')})",
//       });
//       return;
//     }

//     console.log("User from DB:", {
//       _id: user._id,
//       email: user.email,
//       role: user.role,
//     });

//     // Add this check in your middleware
//     console.log("ID Types:", {
//       tokenId: decoded.userId,
//       type: typeof decoded.userId,
//       convertedId: new mongoose.Types.ObjectId(decoded._id),
//     });

//     // 4. Request Augmentation
//     (req as AuthenticatedRequest).user = user;
//     req.user = user;

//     const userId = req.user._id;
//     const UserRole = req.user.role;

//     console.log("Attached user:", (req as AuthenticatedRequest).user);
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);
//     res.status(401).json({ message: "Invalid token" });
//     return;
//   }
// };

//though role is optional or will likely not be used in the frontend
//still implimented role based authentication
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    console.log("Full user object:", req.user);
    console.log("User role:", req.user?.role);
    console.log("User role from request:", req.user?.role);
    console.log("Required roles:", roles);

    if (!req.user?.role) {
      console.error("Role missing in user object");
      sendErrorResponse(res, "Missing user role", null, 403);
      return;
    }

    if (
      !roles.includes(req.user.role || userRole) ||
      !userRole ||
      typeof req.user.role !== "string"
    ) {
      console.error(`User role ${req.user.role} not in ${roles}`);
      sendErrorResponse(res, "Unauthorized role", null, 403);
      return;
    }
    next();
  };
};

export default authMiddleware;
