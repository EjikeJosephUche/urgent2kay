import { Request, Response, NextFunction } from "express";
import { BillBundle } from "../models/billBundle.model";
import { IBillBundle } from "../interfaces/billBundle.interface";

declare global {
  namespace Express {
    interface Request {
      bundle?: IBillBundle;
    }
  }
}

export const verifyBundleLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uniqueLink } = req.params;

  try {
    const bundle = await BillBundle.findOne({
      uniqueLink,
      status: { $nin: ["paid", "fully-paid", "expired"] },
    }).lean<IBillBundle>();

    if (!bundle) {
      res.status(404).json({
        success: false,
        message: "Bundle not available (paid, expired, or invalid)", 
      });
      return;
    }

    req.bundle = bundle;
    next();
  } catch (error) {
    next(new Error("Failed to verify bundle"));
  }
};
