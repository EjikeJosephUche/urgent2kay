import { IUser } from "./../interfaces/user.interface";
import { RequestHandler } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IAuth } from "../interfaces/auth.interface";
import User from "../models/user.model";
import dotenv from "dotenv";
import { JWT_SECRET } from "../utils/env";
import { sendErrorResponse } from "../utils/apiResponse";
// import mongoose, { Document } from "mongoose";

dotenv.config();

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // const authReq = req as AuthenticatedRequest;
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      console.log("No token found");
      res.status(401).json({
        message: "Access denied, token is missing",
      });
      return;
    }
    const decoded = Jwt.verify(token as string, JWT_SECRET as string) as {
      userId: string;
      email: string;
      role: string;
    };

    // Find the user and attach to request
    const user = await User.findById(decoded.userId).select("+role");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.authUser = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
};

//though role is optional or will likely not be used in the frontend
//still implimented role based authentication
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
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
