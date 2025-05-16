import axios from "axios";
import {
  ITransferRecipient,
  IBulkTransfer,
} from "../interfaces/transferRecipient.interface";
import TransferRecipient from "../models/transferRecipient.model";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const createRecipient = async (recipient: ITransferRecipient) => {
  const response = await axios.post<{ data: { recipient_code: string } }>(
    "https://api.paystack.co/transferrecipient",
    {
      type: "nuban",
      name: recipient.name,
      account_number: recipient.accountNumber,
      bank_code: recipient.bankCode,
      currency: "NGN",
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data;
};

export const initiateBulkTransfer = async (bulkTransfer: IBulkTransfer) => {
  const transfers = await Promise.all(
    bulkTransfer.transfers.map(async (recipient) => {
      const existingRecipient = await TransferRecipient.findOne({
        accountNumber: recipient.accountNumber,
      });
      if (existingRecipient) {
        recipient.recipientCode = existingRecipient.recipientCode;
      } else {
        const newRecipient = await createRecipient(recipient);
        recipient.recipientCode = newRecipient.recipient_code;
        await TransferRecipient.create({
          ...recipient,
          recipientCode: newRecipient.recipient_code,
        });
      }
      return {
        amount: recipient.amount,
        reference: `ref_${Date.now()}`,
        reason: recipient.reason,
        recipient: recipient.recipientCode,
      };
    })
  );

  const response = await axios.post(
    "https://api.paystack.co/transfer/bulk",
    {
      currency: bulkTransfer.currency,
      source: bulkTransfer.source,
      transfers,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
