//bypassed services and brought the business logic on here to controller, pardon me please 🤝
//i did lots of console log messages to aid debugging

import { Request, Response, NextFunction } from "express";
import { Merchant } from "../models/merchant.model";
import { MerchantRegistrationData } from "../types/merchantRegTypes";
import { Multer } from "multer";
import fs from "fs";
import path from "path";

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

export const registerMerchant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Registering merchant...");

    if (res.headersSent) {
      console.warn("Headers already sent!");
      return;
    }

    const registrationData = req.body;

    let ownershipProof = undefined;
    if (req.file) {
      ownershipProof = {
        path: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      };
    }

    const merchant = new Merchant({
      ...registrationData,
      bank: {
        ...registrationData.bank,
        ownershipProof,
      },
    });

    await merchant.save();

    res.status(201).json({
      success: true,
      message: "Merchant registration submitted successfully 🎉",
      merchantId: merchant._id,
    });

    return;
  } catch (error: any) {
    console.error("Registration error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (res.headersSent) {
      console.error("Headers already sent, cannot send error response");
      return;
    }

    console.error("Registration error: ", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getMerchantStatus = async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).json({ error: "Merchant not found 😞" });
      return;
    }

    res.json({ status: merchant.status });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
