import { Payment } from "../models/payment.model";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";

export const processPaystackEvent = async (event: any) => {
  if (event.event === "charge.success") {
    const reference = event.data.reference;

    const payment = await Payment.findOneAndUpdate(
      { reference },
      {
        status: "successful",
        paidAt: new Date(event.data.paid_at),
        channel: event.data.channel,
        metadata: event.data,
      },
      { new: true }
    );

    if (!payment) {
      console.warn(`Payment not found for reference: ${reference}`);
      return;
    }

    // Update Bill
    if (payment.bill) {
      await Bill.findByIdAndUpdate(payment.bill, { status: "paid" });
    }

    // Update Bundle
    if (payment.bundle) {
      const bundle = await BillBundle.findById(payment.bundle);
      if (bundle) {
        const successfulPayments = await Payment.find({
          bundle: bundle._id,
          status: "successful",
        });

        const totalPaid = successfulPayments.reduce(
          (sum, p) => sum + p.amount,
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
};
