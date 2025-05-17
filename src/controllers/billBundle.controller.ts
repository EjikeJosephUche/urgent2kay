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
import { Notification } from "..//models/notification.model";
import { Types } from "mongoose";
import User from "../models/user.model";
import { sendBundleLinkEmail } from "../config/email";

type SponsorStatus = "pending" | "paid" | "declined" | "accepted" | "saved";

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

export const sendBundleToSponsor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bundleId } = req.params;
  const { sponsorEmail } = req.body;

  if (!sponsorEmail) {
    res.status(400).json({ message: "Sponsor email is required" });
    return;
  }

  try {
    await shareBundleWithSponsor(bundleId, sponsorEmail);
    res.status(200).json({
      message: "Bundle sent to sponsor via email and in-app notification",
    });
  } catch (error: any) {
    console.error("Error sending bundle to sponsor:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.authUser?._id;

    if (!Types.ObjectId.isValid(notificationId)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?._id;
    const now = new Date();

    const notifications = await Notification.find({
      user: userId,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.authUser?._id;
    const now = new Date();

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
      expiresAt: { $gt: now },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
