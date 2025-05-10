import { Types } from "mongoose";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";
import { IUser } from "../interfaces/user.interface";
import { sendBundleLinkEmail } from "../config/email";
import User from "../models/user.model";

export const createBillBundle = async (
  title: string,
  bills: string[],
  ownerId: string,
  description?: string
) => {
  try {
    //Fetch bills WITHOUT select to get ALL fields
    //select was giving errors innitially
    const existingBills = await Bill.find({
      _id: { $in: bills },
      owner: ownerId,
    }).lean();

    //Validate critical fields exist
    const validatedBills = existingBills.map((bill) => {
      // had to force convert amount to number as safety check
      const amount = Number(bill.amount);
      if (isNaN(amount)) {
        throw new Error(`Bill ${bill._id} has invalid amount (${bill.amount})`);
      }

      if (!bill.merchantBankDetails || !bill.category) {
        throw new Error(`Bill ${bill._id} missing required fields`);
      }

      return {
        ...bill,
        amount,
      };
    });

    // Create bundle with all required fields as required
    const bundle = await BillBundle.create({
      title,
      description,
      bills,
      totalAmount: validatedBills.reduce((sum, bill) => sum + bill.amount, 0),
      owner: ownerId,
      merchantBankDetails: validatedBills.map((bill) => ({
        billId: bill._id,
        ...bill.merchantBankDetails,
        amount: bill.amount,
        category: bill.category,
      })),
    });

    console.log("CREATED BUNDLE:", bundle);
    return bundle;
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
};

export const shareBundleWithSponsor = async (
  bundleId: string,
  sponsorEmail: string
) => {
  try {
    if (!sponsorEmail) throw new Error("Sponsor email is required");

    const bundle = await BillBundle.findById(bundleId).populate("owner");
    const sponsor = await User.findOne({ email: sponsorEmail });

    if (!bundle) throw new Error("Bundle not found");
    if (!sponsor) throw new Error("Sponsor not found");

    if (
      bundle.sponsors.some((s) => s.user.equals(sponsor._id as Types.ObjectId))
    ) {
      throw new Error("Sponsor already added to this bundle");
    }

    await sendBundleLinkEmail({
      to: sponsorEmail,
      bundleName: bundle.title,
      link: `${process.env.FRONTEND_URL}/bundles/${bundle.uniqueLink}`,
      sponsorName: sponsor.firstName,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    bundle.sponsors.push({
      user: sponsor._id as Types.ObjectId,
      amount: 0,
      status: "pending",
    });

    await bundle.save();
  } catch (error) {
    console.error("Error sharing bundle:", error);
    throw error;
  }
};
