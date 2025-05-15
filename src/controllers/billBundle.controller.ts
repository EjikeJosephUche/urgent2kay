import { Request, Response, NextFunction } from "express";
import {
  createBillBundle,
  shareBundleWithSponsor,
} from "../services/billBundle.service";
import { body, validationResult } from "express-validator";
import { BillBundle } from "../models/billBundle.model";
import Bill from "../models/bill.model";
import mongoose from "mongoose";
import { IBill } from "../interfaces/bill.interface";
// import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Input Validation
    const { title, bills: billIds, email, description } = req.body;
    const ownerId = req.authUser?._id;

    if (!ownerId) {
      console.error("Authentication failure: Missing userId");
      res.status(401).json({ error: "Unauthorized - please login" });
      return;
    }

    if (!title || !billIds || !Array.isArray(billIds) || !email) {
      res.status(400).json({
        error: "Title, bills array and email are required",
      });
      return;
    }

    // Validate Bill ID Formats
    const invalidIds = billIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      res.status(400).json({
        error: "Invalid bill ID format",
        invalidIds,
      });
      return;
    }
    // Create Bundle (service handles bill validation)
    const bundle = await createBillBundle(title, billIds, ownerId, description);
    console.log("Returned from createBill");

    res.status(201).json({
      status: "Success 🎉",
      data: {
        bundle: {
          ...bundle.toObject(),
          merchantBankDetails: bundle.merchantBankDetails,
        },
        shareableLink: `${process.env.FRONTEND_URL}/bundles/${bundle.uniqueLink}`,
      },
    });
  } catch (error: any) {
    console.error("Bundle creation error:", error);

    if (error.message.includes("Missing bills")) {
      res.status(404).json({
        error: "Some bills not found",
        details: error.message,
      });
      return;
    }

    next(error);
  }
};

export const getBundleWithLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bundle = await BillBundle.findOne({
      uniqueLink: req.params.uniqueLink,
      status: { $nin: ["fully-paid", "expired"] }, //this takes care of fully-paid or expired links,
    }).populate("bills owner");

    if (!bundle) {
      res.status(404).json({ error: "Bundle not found or fully paid for 😞" });
      return;
    }

    res.json({ success: true, bundle });
  } catch (error) {
    next(error);
  }
};

export const shareBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add null check for req.body
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({
        success: false,
        message: "Invalid request body format",
      });
      return;
    }

    const { sponsorEmail } = req.body;

    if (!sponsorEmail) {
      res.status(400).json({
        success: false,
        message: "Sponsor email is required in request body",
      });
      return;
    }

    await shareBundleWithSponsor(req.params.id, sponsorEmail);

    res.json({
      success: true,
      message: "Bundle link shared with sponsor 🎉",
    });
  } catch (error) {
    console.error("Error in shareBundle:", error);
    next(error);
  }
};
