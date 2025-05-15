console.log("HEADER: ENTRY TO BILLBUNDLE SERVICE");
import { UserRole } from "./../interfaces/user.interface";
import { Types } from "mongoose";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";
import { IUser } from "../interfaces/user.interface";
import { sendBundleLinkEmail } from "../config/email";
import User from "../models/user.model";

export const createBillBundle = async (
  title: string,
  billIds: string[],
  ownerId: string,
  description?: string
) => {
  try {
    console.log("starting to test logs for bills");

    const bills = await Bill.find({ _id: { $in: billIds } }).lean();

    console.log("Fetched Bills:", bills);

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

    const users = await User.find({ email: /@gmail\.com$/i });
    console.log("Users found with gmail:", users);

    const bundle = await BillBundle.findById(bundleId).populate("owner");
    const sponsor = await User.findOne({ email: sponsorEmail });

    console.log("Raw sponsorEmail:", sponsorEmail);
    console.log("Type of sponsorEmail:", typeof sponsorEmail);

    console.log(sponsorEmail, sponsor);
    console.log("sponsor is: sponsor");

    if (!bundle) throw new Error("Bundle not found");
    if (!sponsor) throw new Error("Sponsor not found");

    if (
      bundle.sponsors.some((s) => s.user.equals(sponsor._id as Types.ObjectId))
    ) {
      throw new Error("Sponsor already added to this bundle");
    }

    bundle.sponsors.push({
      user: sponsor._id as Types.ObjectId,
      amount: 0,
      status: "pending",
    });

    await sendBundleLinkEmail({
      to: sponsorEmail,
      bundleName: bundle.title,
      link: `${process.env.FRONTEND_URL}/bundles/${bundle.uniqueLink}`,
      sponsorName: sponsor.firstName,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log(sponsor, sponsorEmail);

    await bundle.save();
  } catch (error) {
    console.error("Error sharing bundle:", error);
    throw error;
  }
};
