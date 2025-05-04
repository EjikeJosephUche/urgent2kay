import Jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IAuth from "../interfaces/auth.interface";
import dotenv from "dotenv";
import { JWT_SECRET } from "../utils/env";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: {
        _id: string;
        email?: string;
      };
    }
  }
}
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer", "").trim();
  if (!token) {
    res.status(401).json({
      message: "Access denied, token is missing",
    });
  }

  try {
    const decoded = Jwt.verify(token as string, JWT_SECRET) as IAuth;

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "_id" in decoded &&
      "email" in decoded
    ) {
      req.userId = {
        _id: (decoded as IAuth)._id,
        email: (decoded as IAuth).email,
      };
    }

    next();
  } catch (error) {
    console.log("JWT verification failed", error);
    res.status(401).json({
      message: "invalid token",
    });
  }
};

export default authMiddleware;
