import Jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IAuth from "../interfaces/auth.interface";
import dotenv from "dotenv";
import { JWT_SECRET } from "../utils/env";
dotenv.config();

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
    const decoded = Jwt.verify(token as string, JWT_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "_id" in decoded &&
      "email" in decoded
    ) {
      req.user = decoded as IAuth;
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
