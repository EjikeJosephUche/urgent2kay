import { UserRole } from "./../interfaces/user.interface";
import { Types } from "mongoose";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";
import { IUser } from "../interfaces/user.interface";
import { sendBundleLinkEmail } from "../config/email";
import User from "../models/user.model";
import { Notification } from "../models/notification.model";

export const createBillBundle = async (
  title: string,
  billIds: string[],
  ownerId: string,
  description?: string
) => {
  try {
    const bills = await Bill.find({ _id: { $in: billIds } }).lean();

    if (bills.length !== billIds.length) {
      const missingBills = billIds.filter(
        (id) => !bills.some((bill) => bill._id.toString() === id)
      );
      throw new Error(`Missing bills: ${missingBills.join(", ")}`);
    }

    const validatedBills = bills.map((bill) => {
      const amount = Number(bill.amount);
      if (isNaN(amount)) throw new Error(`Invalid amount in bill ${bill._id}`);
      if (!bill.merchantBankDetails || !bill.category) {
        throw new Error(`Bill ${bill._id} missing required fields`);
      }
      return { ...bill, amount };
    });

    const bundle = await BillBundle.create({
      title,
      description,
      bills: billIds,
      totalAmount: validatedBills.reduce((sum, bill) => sum + bill.amount, 0),
      owner: ownerId,
      merchantBankDetails: validatedBills.map((bill) => ({
        billId: bill._id,
        ...bill.merchantBankDetails,
        amount: bill.amount,
        category: bill.category,
      })),
    });

    return bundle;
  } catch (error: any) {
    console.error("Bundle creation failed:", error);
    throw new Error(error.message || "Failed to create bundle");
  }
};


export const shareBundleWithSponsor = async (
  bundleId: string,
  sponsorEmail: string
) => {
  try {
    if (!sponsorEmail) throw new Error("Sponsor email is required");

    const sponsor = await User.findOne({ email: sponsorEmail });
    if (!sponsor) throw new Error("Sponsor not found");


    const bundle = await BillBundle.findById(bundleId).populate({
      path: "owner",
      select: "firstName email",
    });

    if (!bundle) throw new Error("Bundle not found");


    const alreadyAdded = bundle.sponsors.some((s) =>
      s.user.equals(sponsor._id as Types.ObjectId)
    );
    if (alreadyAdded) throw new Error("Sponsor already added to this bundle");


    bundle.sponsors.push({
      user: sponsor._id as Types.ObjectId,
      amount: 0,
      status: "pending",
    });

    // Send email first
    await sendBundleLinkEmail({
      to: sponsorEmail,
      bundleName: bundle.title,
      link: `${process.env.FRONTEND_URL}/bundles/${bundle.uniqueLink}`,
      sponsorName: sponsor.firstName,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Then send in-app notification
    const notification = await Notification.create({
      user: sponsor._id,
      type: "invitation",
      title: "🔔 You've been invited to sponsor a bundle",
      message: `${
        (bundle.owner as any).firstName
      } has invited you to sponsor the bundle "${bundle.title}".`,
      link: `/bundles/${bundle.uniqueLink}`,
      actions: ["accept", "decline", "save"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Add notification to sponsor's user
    sponsor.notifications.push(notification._id);
    await sponsor.save();
  } catch (error) {
    console.error("Error sharing bundle:", error);
    throw error;
  }
};