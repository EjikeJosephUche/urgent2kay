import { Payment } from "../models/payment.model";
import Bill from "../models/bill.model";
import { BillBundle } from "../models/billBundle.model";
import { initiateBulkTransfer } from "./transfer.service";
import TransferRecipient from "../models/transferRecipient.model";

export const processPaystackEvent = async (event: any) => {
  const { event: eventType, data } = event;

  if (eventType === "charge.success") {
    const reference = data.reference;

    const payment = await Payment.findOneAndUpdate(
      { reference },
      {
        status: "successful",
        paidAt: new Date(data.paid_at),
        channel: data.channel,
        metadata: data,
      },
      { new: true }
    );

    if (!payment) {
      console.warn(`Payment not found for reference: ${reference}`);
      return;
    }

    // Update Bill status if linked to single bill
    if (payment.bill) {
      await Bill.findByIdAndUpdate(payment.bill, { status: "paid" });
    }

    // Update Bundle status
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

        // ✅ Trigger bulk transfer if bundle is fully paid
        if (bundle.status === "fully-funded") {
          console.log("Triggering bulk transfer...");

          const transferPayload = {
            currency: "NGN",
            source: "balance",
            transfers: bundle.merchantBankDetails.map((item) => ({
              name: item.accountName,
              accountNumber: item.accountNumber,
              bankCode: item.bankName, // ⚠️ Ensure this is bank code, not bank name
              amount: item.amount,
              reason: item.category,
            })),
          };

          try {
            const transferResult = await initiateBulkTransfer(transferPayload);
            console.log("Bulk transfer initiated:", transferResult);
          } catch (err) {
            console.error("Bulk transfer failed:", err);
          }
        }
      }
    }
  }

  // ✅ Handle transfer events
  if (eventType === "transfer.success" || eventType === "transfer.failed") {
    const { recipient, transfer_code, amount } = data;
    await TransferRecipient.updateOne(
      { recipientCode: recipient },
      {
        $set: {
          transferCode: transfer_code,
          amount,
          status: eventType === "transfer.success" ? "success" : "failed",
        },
      }
    );
  }
};
