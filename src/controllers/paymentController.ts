import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { initializePayment, verifyPayment } from '../utils/paystack';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller to initialize a payment transaction.
 */
export const initialize = async (req: Request, res: Response) => {
  try {
    const { userId, amount, disbursements, email } = req.body;

    const reference = uuidv4();

    const transaction = await Transaction.create({
      user: userId,
      amount,
      reference,
      disbursements
    });

    const { data } = await initializePayment(email, amount * 100, reference); // Convert Naira to kobo

    res.status(200).json({ data });
    // return res.status(200).json({ authorization_url: (data as any).data.authorization_url, reference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
};

/**
 * Controller to verify payment and mark it successful or failed.
 */
export const verify = async (req: Request, res: Response) => {
  const { reference } = req.params;

  try {
    const { data } = await verifyPayment(reference);

    const transaction = await Transaction.findOne({ reference });

    if ((data as any).data.status === 'success') {
      transaction!.status = 'success';
    } else {
      transaction!.status = 'failed';
    }

    await transaction!.save();

    res.status(200).json({ status: transaction!.status, transaction, payData: data });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
};