import Bill from "../models/bill.model";
import { IBill } from "../interfaces/bill.interface";
import { Merchant } from "../models/partner.model";


export const createBill = async (
  owner: string,
  merchant: string,
  amount: number,
  dueDate: Date,
  referenceNumber: string,
  category: string,
  description?: string
): Promise<IBill> => {
  try {
    // Check if merchant exists and has bank details
    const merchantWithBank = await Merchant.findById(merchant).select("bank");
    if (!merchantWithBank || !merchantWithBank.bank)
      throw new Error("Merchant not found");

    const { bank } = merchantWithBank;
    if (!bank.bankName || !bank.accountName || !bank.accountNumber) {
      throw new Error("Incomplete bank details for merchant");
    }

    const bill = new Bill({
      owner,
      merchant,
      amount,
      dueDate,
      referenceNumber,
      category,
      description,
      merchantBankDetails: {
        bankName: merchantWithBank.bank.bankName,
        accountName: merchantWithBank.bank.accountName,
        accountNumber: merchantWithBank.bank.accountNumber,
      },
    });
    await bill.save();
    return bill;
  } catch (error: any) {
    console.error("Bill creation failed:", {
      message: error.message,
      merchantId: merchant,
      ownerId: owner,
      referenceNumber,
    });
    console.error("Bill creation failed:", error);
    throw new Error(error.message || "Failed to create bill");
  }
};

export const getBillsByOwner = async (ownerId: string): Promise<IBill[]> => {
  return Bill.find({ merchant: ownerId }).populate("merchant", "bank");
}; // here ⚠️⚠️⚠️

export const updateBillStatus = async (
  billId: string,
  status: string
): Promise<IBill | null> => {
  return Bill.findByIdAndUpdate(billId, { status }, { new: true });
};



