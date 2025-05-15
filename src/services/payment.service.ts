import axios from "axios";
import { Payment } from "../models/payment.model";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

const paystackApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export class PaystackService {
  // 1. Initialize Transaction
  static async initializeTransaction({
    email,
    amount,
    metadata,
    reference,
  }: {
    email: string;
    amount: number;
    metadata: any;
    reference: string;
  }) {
    try {
      interface InitializeTransactionResponse {
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      }

      const response = await paystackApi.post<InitializeTransactionResponse>(
        "/transaction/initialize",
        {
          email,
          amount: amount * 100,
          metadata,
          reference,
        }
      );

      return response.data.data; // Correct depth
    } catch (error) {
      console.error("Error initializing transaction:", error);
      throw new Error("Failed to initialize transaction");
    }
  }

  // 2. Verify Transaction
  static async verifyTransaction(reference: string) {
    try {
      interface VerifyTransactionResponse {
        data: {
          status: string;
          paid_at?: string; // Optional field to avoid runtime errors
          channel: string;
          [key: string]: any; // Add other fields as needed
        };
      }

      const response = await paystackApi.get<VerifyTransactionResponse>(
        `/transaction/verify/${reference}`
      );
      const transactionData = response.data;

      if (transactionData.data.status === "success") {
        const payment = await Payment.findOneAndUpdate(
          { reference },
          {
            status: "successful",
            // paidAt: new Date(transactionData.data.paid_at),
            channel: transactionData.data.channel,
            metadata: transactionData,
          },
          { new: true }
        );

        if (!payment) {
          console.warn(`Payment not found for reference: ${reference}`);
          return transactionData;
        }

        if (payment.bill) {
          await Bill.findByIdAndUpdate(payment.bill, { status: "paid" });
        }

        if (payment.bundle) {
          const bundle = await BillBundle.findById(payment.bundle);
          if (bundle) {
            const relatedPayments = await Payment.find({
              bundle: bundle._id,
              status: "successful",
            });

            const totalPaid = relatedPayments.reduce(
              (acc, p) => acc + p.amount,
              0
            );

            if (totalPaid >= bundle.totalAmount) {
              bundle.status = "fully-funded";
            } else if (totalPaid > 0) {
              bundle.status = "partially-funded";
            }

            await bundle.save();
          }
        }
      }

      return transactionData;
    } catch (error) {
      console.error("Error verifying transaction:", error);
      throw new Error("Failed to verify transaction");
    }
  }

  // 3. Charge Authorization
  static async chargeAuthorization({
    email,
    amount,
    authorization_code,
    metadata,
  }: {
    email: string;
    amount: number;
    authorization_code: string;
    metadata?: any;
  }) {
    try {
      interface ChargeAuthorizationResponse {
        data: {
          status: string;
          reference: string;
          [key: string]: any; // Add other fields as needed
        };
      }

      const response = await paystackApi.post<ChargeAuthorizationResponse>(
        "/transaction/charge_authorization",
        {
          email,
          amount: amount * 100,
          authorization_code,
          metadata,
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error charging authorization:", error);
      throw new Error("Failed to charge authorization");
    }
  }
}
