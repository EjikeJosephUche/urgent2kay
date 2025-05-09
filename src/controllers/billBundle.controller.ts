import { Request, Response, NextFunction } from "express";
import {
  createBillBundle,
  shareBundleWithSponsor,
} from "../services/billBundle.service";
import { body, validationResult } from "express-validator";
import { BillBundle } from "../models/billBundle.model";

export const createBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, bills, email, description } = req.body;

    //check to ensure inputs are correct and if bills is an array of bill IDs
    if (!title || !bills || !Array.isArray(bills) || !email) {
      res
        .status(400)
        .json({ error: "Title, bills IDs and email are all required" });
      return;
    }

    const bundle = await createBillBundle(
      title,
      bills,
      req.user.id,
      description
    );

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
  } catch (error) {
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
