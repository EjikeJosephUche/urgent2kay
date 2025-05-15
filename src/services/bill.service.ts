console.log("=== Entering createBillBundle ===");

import Bill from "../models/bill.model";
import { IBill } from "../interfaces/bill.interface";
import { Merchant } from "../models/partner.model";


console.log('about to enter bill functions')
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
    console.log('1. test 1')
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

    console.log("Bill data to be saved:", bill);

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

// console.log("=== Entering createBillBundle ===");

// import Bill from "../models/bill.model";
// import { IBill } from "../interfaces/bill.interface";
// import { Merchant } from "../models/partner.model";

// console.log("about to enter bill functions");
// export const createBill = async (
//   owner: string,
//   merchant: string,
//   amount: number,
//   dueDate: Date,
//   referenceNumber: string,
//   category: string,
//   description?: string
// ): Promise<IBill> => {

//   console.log('this came before try catch block')


//   try {
//     console.log("1. test 1");
//     // Check if merchant exists and has bank details
//     const merchantWithBank = await Merchant.findById(merchant).select("bank");
//     if (!merchantWithBank || !merchantWithBank.bank)
//       throw new Error("Merchant not found");

//     const { bank } = merchantWithBank;
//     if (!bank.bankName || !bank.accountName || !bank.accountNumber) {
//       throw new Error("Incomplete bank details for merchant");
//     }

//     const bill = new Bill({
//       owner,
//       merchant,
//       amount,
//       dueDate,
//       referenceNumber,
//       category,
//       description,
//       merchantBankDetails: {
//         bankName: merchantWithBank.bank.bankName,
//         accountName: merchantWithBank.bank.accountName,
//         accountNumber: merchantWithBank.bank.accountNumber,
//       },
//     });

//     console.log("Bill data to be saved:", bill);

//     await bill.save();
//     return bill;
//   } catch (error: any) {
//     console.error("Bill creation failed:", {
//       message: error.message,
//       merchantId: merchant,
//       ownerId: owner,
//       referenceNumber,
//     });
//     console.error("Bill creation failed:", error);
//     throw new Error(error.message || "Failed to create bill");
//   }
// };

// export const getBillsByOwner = async (ownerId: string): Promise<IBill[]> => {
//   console.log("getBillsByOwner called with ownerId:", ownerId);
//   return Bill.find({ merchant: ownerId }).populate("merchant", "bank");
// };

// export const updateBillStatus = async (
//   billId: string,
//   status: string
// ): Promise<IBill | null> => {
//   console.log("updateBillStatus called with:", { billId, status });
//   return Bill.findByIdAndUpdate(billId, { status }, { new: true });
// };
